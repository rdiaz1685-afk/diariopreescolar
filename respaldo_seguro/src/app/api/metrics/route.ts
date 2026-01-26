import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campusId')
    const groupId = searchParams.get('groupId')
    const period = searchParams.get('period') || 'week' // 'week', 'month', 'semester'

    const where: any = {}
    if (campusId) where.campusId = campusId
    if (groupId) where.groupId = groupId

    // Obtener estudiantes según filtros
    const students = await db.student.findMany({
      where,
      include: {
        campus: true,
        group: true
      }
    })

    const studentIds = students.map(s => s.id)

    // Obtener reportes del periodo
    const reports = await db.dailyReport.findMany({
      where: {
        studentId: { in: studentIds },
        date: getDateRange(period)
      }
    })

    // Calcular métricas
    const metrics = {
      summary: {
        totalStudents: students.length,
        totalReports: reports.length,
        reportsPerStudent: students.length > 0 ? (reports.length / students.length).toFixed(1) : 0
      },
      moodDistribution: calculateMoodDistribution(reports),
      lunchIntakeDistribution: calculateLunchIntakeDistribution(reports),
      napPercentage: calculateNapPercentage(reports),
      diaperChanges: calculateDiaperChanges(reports),
      medicationGiven: calculateMedicationGiven(reports),
      campusComparison: await calculateCampusComparison(period),
      groupComparison: await calculateGroupComparison(campusId, period),
      trends: calculateTrends(reports, period)
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error fetching metrics' },
      { status: 500 }
    )
  }
}

function getDateRange(period: string) {
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'semester':
      startDate.setMonth(now.getMonth() - 6)
      break
  }

  return {
    gte: startDate,
    lte: now
  }
}

function calculateMoodDistribution(reports: any[]) {
  const distribution: Record<string, number> = {
    happy: 0,
    thoughtful: 0,
    sad: 0,
    angry: 0
  }

  reports.forEach(report => {
    if (report.mood && distribution[report.mood] !== undefined) {
      distribution[report.mood]++
    }
  })

  return distribution
}

function calculateLunchIntakeDistribution(reports: any[]) {
  const distribution: Record<string, number> = {
    all: 0,
    half: 0,
    none: 0
  }

  reports.forEach(report => {
    if (report.lunchIntake && distribution[report.lunchIntake] !== undefined) {
      distribution[report.lunchIntake]++
    }
  })

  return distribution
}

function calculateNapPercentage(reports: any[]) {
  const naps = reports.filter(r => r.hadNap).length
  const percentage = reports.length > 0 ? ((naps / reports.length) * 100).toFixed(1) : 0
  return {
    total: naps,
    percentage: parseFloat(percentage)
  }
}

function calculateDiaperChanges(reports: any[]) {
  const changes = reports.filter(r => r.diaperChanged).length
  return {
    total: changes,
    averagePerDay: reports.length > 0 ? (changes / reports.length).toFixed(1) : 0
  }
}

function calculateMedicationGiven(reports: any[]) {
  const medications = reports.filter(r => r.medicationGiven).length
  return {
    total: medications,
    percentage: reports.length > 0 ? ((medications / reports.length) * 100).toFixed(1) : 0
  }
}

async function calculateCampusComparison(period: string) {
  const campuses = await db.campus.findMany({
    include: {
      students: true
    }
  })

  const comparison = await Promise.all(
    campuses.map(async (campus) => {
      const campusReports = await db.dailyReport.findMany({
        where: {
          student: {
            campusId: campus.id
          },
          date: getDateRange(period)
        }
      })

      const naps = campusReports.filter(r => r.hadNap).length
      const happyMoods = campusReports.filter(r => r.mood === 'happy').length

      return {
        campusName: campus.name,
        totalReports: campusReports.length,
        napPercentage: campusReports.length > 0
          ? ((naps / campusReports.length) * 100).toFixed(1)
          : 0,
        happinessIndex: campusReports.length > 0
          ? ((happyMoods / campusReports.length) * 100).toFixed(1)
          : 0
      }
    })
  )

  return comparison.sort((a, b) => parseFloat(b.happinessIndex) - parseFloat(a.happinessIndex))
}

async function calculateGroupComparison(campusId: string | null, period: string) {
  const where = campusId ? { campusId } : {}
  const groups = await db.group.findMany({
    where,
    include: {
      students: true
    }
  })

  const comparison = await Promise.all(
    groups.map(async (group) => {
      const groupReports = await db.dailyReport.findMany({
        where: {
          student: {
            groupId: group.id
          },
          date: getDateRange(period)
        }
      })

      const naps = groupReports.filter(r => r.hadNap).length
      const happyMoods = groupReports.filter(r => r.mood === 'happy').length
      const fullLunch = groupReports.filter(r => r.lunchIntake === 'all').length

      return {
        groupName: group.name,
        level: group.level,
        totalReports: groupReports.length,
        napPercentage: groupReports.length > 0
          ? ((naps / groupReports.length) * 100).toFixed(1)
          : 0,
        happinessIndex: groupReports.length > 0
          ? ((happyMoods / groupReports.length) * 100).toFixed(1)
          : 0,
        nutritionIndex: groupReports.length > 0
          ? ((fullLunch / groupReports.length) * 100).toFixed(1)
          : 0
      }
    })
  )

  return comparison.sort((a, b) => parseFloat(b.happinessIndex) - parseFloat(a.happinessIndex))
}

function calculateTrends(reports: any[], period: string) {
  // Agrupar reportes por día
  const reportsByDate: Record<string, any[]> = {}

  reports.forEach(report => {
    const dateKey = new Date(report.date).toISOString().split('T')[0]
    if (!reportsByDate[dateKey]) {
      reportsByDate[dateKey] = []
    }
    reportsByDate[dateKey].push(report)
  })

  // Calcular tendencias diarias
  const dailyTrends = Object.keys(reportsByDate).map(date => {
    const dayReports = reportsByDate[date]
    return {
      date,
      totalReports: dayReports.length,
      happyPercentage: dayReports.length > 0
        ? ((dayReports.filter(r => r.mood === 'happy').length / dayReports.length) * 100).toFixed(1)
        : 0,
      napPercentage: dayReports.length > 0
        ? ((dayReports.filter(r => r.hadNap).length / dayReports.length) * 100).toFixed(1)
        : 0
    }
  })

  return {
    period,
    dailyTrends: dailyTrends.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

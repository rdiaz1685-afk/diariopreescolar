import { useState, useEffect } from 'react'

export interface Campus {
  id: string
  name: string
  code: string
  address?: string
  phone?: string
  studentCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Group {
  id: string
  name: string
  level: string
  campusId: string
  campus?: {
    id: string
    name: string
  }
  studentCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface Metrics {
  summary: {
    totalStudents: number
    totalReports: number
    reportsPerStudent: number
  }
  moodDistribution: {
    happy: number
    thoughtful: number
    sad: number
    angry: number
  }
  lunchIntakeDistribution: {
    all: number
    half: number
    none: number
  }
  napPercentage: {
    total: number
    percentage: number
  }
  diaperChanges: {
    total: number
    averagePerDay: number
  }
  medicationGiven: {
    total: number
    percentage: number
  }
  campusComparison: Array<{
    campusName: string
    totalReports: number
    napPercentage: string
    happinessIndex: string
  }>
  groupComparison: Array<{
    groupName: string
    level: string
    totalReports: number
    napPercentage: string
    happinessIndex: string
    nutritionIndex: string
  }>
  trends: {
    period: string
    dailyTrends: Array<{
      date: string
      totalReports: number
      happyPercentage: string
      napPercentage: string
    }>
  }
}

export function useCampuses() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampuses()
  }, [])

  async function fetchCampuses() {
    try {
      setLoading(true)
      const response = await fetch('/api/campuses')
      if (!response.ok) throw new Error('Error fetching campuses')
      const data = await response.json()
      const campusesWithCount = data.map((campus: any) => ({
        ...campus,
        studentCount: campus._count?.students || 0
      }))
      setCampuses(campusesWithCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { campuses, loading, error, refetch: fetchCampuses }
}

export function useGroups(campusId?: string) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (campusId) {
      fetchGroups()
    }
  }, [campusId])

  async function fetchGroups() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (campusId) params.append('campusId', campusId)

      const response = await fetch(`/api/groups?${params}`)
      if (!response.ok) throw new Error('Error fetching groups')
      const data = await response.json()
      const groupsWithCount = data.map((group: any) => ({
        ...group,
        studentCount: group._count?.students || 0
      }))
      setGroups(groupsWithCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { groups, loading, error, refetch: fetchGroups }
}

export function useMetrics(campusId?: string, groupId?: string, period: string = 'week') {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [campusId, groupId, period])

  async function fetchMetrics() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (campusId) params.append('campusId', campusId)
      if (groupId) params.append('groupId', groupId)
      params.append('period', period)

      const response = await fetch(`/api/metrics?${params}`)
      if (!response.ok) throw new Error('Error fetching metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { metrics, loading, error, refetch: fetchMetrics }
}

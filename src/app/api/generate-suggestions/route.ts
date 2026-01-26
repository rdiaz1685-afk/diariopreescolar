import { NextRequest, NextResponse } from 'next/server'

interface GenerateSuggestionsRequest {
  studentName: string
  studentAge: number
  weeklyReports: Array<{
    mood: string
    lunchIntake: string
    hadNap: boolean
    dailyAchievements?: string
    generalNotes?: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSuggestionsRequest = await request.json()
    const { studentName, studentAge, weeklyReports } = body

    if (!weeklyReports || weeklyReports.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron reportes de la semana' },
        { status: 400 }
      )
    }

    // Analizar los reportes de la semana
    const moodCounts = weeklyReports.reduce((acc, report) => {
      acc[report.mood] = (acc[report.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Generar resumen del comportamiento
    let behaviorSummary = `${studentName} ha mostrado un comportamiento `
    if (dominantMood === 'happy') {
      behaviorSummary += 'muy positivo y alegre durante la semana. '
    } else if (dominantMood === 'thoughtful') {
      behaviorSummary += 'reflexivo y tranquilo durante la semana. '
    } else if (dominantMood === 'sad') {
      behaviorSummary += 'algo apático durante la semana. '
    } else {
      behaviorSummary += 'comportado durante la semana. '
    }

    const napsTaken = weeklyReports.filter(r => r.hadNap).length
    if (napsTaken >= 4) {
      behaviorSummary += 'Ha descansado bien tomando la sieta la mayoría de los días. '
    }

    const achievements = weeklyReports.filter(r => r.dailyAchievements).length
    if (achievements > 0) {
      behaviorSummary += 'Ha logrado varios hitos importantes durante la semana. '
    }

    // Generar sugerencias de IA
    const suggestions = generateAISuggestions(studentName, studentAge, dominantMood, weeklyReports)

    return NextResponse.json({
      behaviorSummary,
      aiSuggestions: suggestions
    })
  } catch (error) {
    console.error('Error generating AI suggestions:', error)
    return NextResponse.json(
      { error: 'Error al generar sugerencias de IA' },
      { status: 500 }
    )
  }
}

function generateAISuggestions(
  studentName: string,
  age: number,
  mood: string,
  reports: any[]
): string {
  const suggestions: string[] = []

  // Sugerencias basadas en el estado de ánimo
  if (mood === 'happy') {
    suggestions.push('Fomentar su alegría con actividades creativas como dibujo y pintura.')
    suggestions.push('Continuar con el refuerzo positivo para mantener su buen comportamiento.')
  } else if (mood === 'thoughtful') {
    suggestions.push('Realizar actividades de lectura y cuentacuentos para estimular su imaginación.')
    suggestions.push('Juegos de construcción y rompecabezas para desarrollar su pensamiento lógico.')
  } else if (mood === 'sad') {
    suggestions.push('Dedicar tiempo de calidad con actividades que le gusten.')
    suggestions.push('Hablar sobre sus emociones y fomentar que exprese cómo se siente.')
    suggestions.push('Realizar actividades físicas divertidas para mejorar su estado de ánimo.')
  }

  // Sugerencias basadas en la alimentación
  const lunchPatterns = reports.map(r => r.lunchIntake)
  const fullMeals = lunchPatterns.filter(l => l === 'all').length
  if (fullMeals >= 4) {
    suggestions.push('Continuar con una alimentación balanceada en casa.')
  } else if (fullMeals <= 1) {
    suggestions.push('Explorar nuevos alimentos y presentaciones para mejorar su apetito.')
  }

  // Sugerencias basadas en logros
  const achievements = reports.filter(r => r.dailyAchievements)
  if (achievements.length > 0) {
    suggestions.push('Celebrar y reconocer los logros alcanzados durante la semana.')
    suggestions.push('Continuar apoyando su desarrollo con actividades desafiantes pero divertidas.')
  }

  // Sugerencias generales según la edad
  if (age <= 3) {
    suggestions.push('Juegos sensoriales para estimular el desarrollo motriz.')
    suggestions.push('Canciones y rimas para fomentar el lenguaje.')
  } else if (age >= 4) {
    suggestions.push('Actividades que fomenten la independencia y autonomía.')
    suggestions.push('Juegos en grupo para desarrollar habilidades sociales.')
  }

  return suggestions.join('\n\n')
}

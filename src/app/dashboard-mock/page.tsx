'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Datos mockeados para pruebas (por problemas de caché del servidor)
const mockCampuses = [
  {
    id: '1',
    name: 'Mitras',
    code: 'MITRAS',
    studentCount: 8
  },
  {
    id: '2',
    name: 'Cumbres',
    code: 'CUMBRES',
    studentCount: 7
  },
  {
    id: '3',
    name: 'Norte',
    code: 'NORTE',
    studentCount: 6
  },
  {
    id: '4',
    name: 'Dominio',
    code: 'DOMINIO',
    studentCount: 5
  },
  {
    id: '5',
    name: 'Anahuac',
    code: 'ANAHUAC',
    studentCount: 6
  }
]

const mockMetrics = {
  summary: {
    totalStudents: 32,
    totalReports: 160,
    reportsPerStudent: 5
  },
  moodDistribution: {
    happy: 89,
    thoughtful: 7,
    sad: 3,
    angry: 1
  },
  lunchIntakeDistribution: {
    all: 78,
    half: 18,
    none: 4
  },
  napPercentage: {
    total: 125,
    percentage: 78.1
  },
  diaperChanges: {
    total: 42,
    averagePerDay: 2.1
  },
  medicationGiven: {
    total: 8,
    percentage: 5
  },
  campusComparison: [
    { campusName: 'Mitras', totalReports: 35, napPercentage: '82.3', happinessIndex: '87.4' },
    { campusName: 'Cumbres', totalReports: 32, napPercentage: '75.0', happinessIndex: '84.3' },
    { campusName: 'Norte', totalReports: 30, napPercentage: '80.0', happinessIndex: '90.1' },
    { campusName: 'Dominio', totalReports: 28, napPercentage: '71.4', happinessIndex: '79.2' },
    { campusName: 'Anahuac', totalReports: 35, napPercentage: '77.1', happinessIndex: '88.6' }
  ],
  groupComparison: [
    { groupName: 'Toddlers Mitras', level: 'toddlers', totalReports: 18, napPercentage: '85.7', happinessIndex: '91.2', nutritionIndex: '83.4' },
    { groupName: 'Toddlers Cumbres', level: 'toddlers', totalReports: 15, napPercentage: '80.0', happinessIndex: '86.6', nutritionIndex: '80.0' },
    { groupName: 'Preescolar Mitras', level: 'preescolar', totalReports: 17, napPercentage: '76.4', happinessIndex: '89.4', nutritionIndex: '85.7' }
  ],
  trends: {
    period: 'week',
    dailyTrends: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), totalReports: 28, happyPercentage: '85.7', napPercentage: '81.2' },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), totalReports: 32, happyPercentage: '87.5', napPercentage: '75.0' },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), totalReports: 29, happyPercentage: '82.1', napPercentage: '77.8' },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), totalReports: 31, happyPercentage: '84.3', napPercentage: '79.3' },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), totalReports: 33, happyPercentage: '88.6', napPercentage: '82.1' },
      { date: new Date().toISOString(), totalReports: 30, happyPercentage: '85.7', napPercentage: '80.7' }
    ]
  }
}

export default function DashboardMock() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent neon-text">
              Dashboard Administrativo (Demo)
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas y tendencias por campus y grupo
            </p>
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500">
            Datos de Demo (sin conexión API)
          </Badge>
        </div>

        {/* Métricas principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                  <p className="text-2xl font-bold mt-1">{mockMetrics.summary.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reportes</p>
                  <p className="text-2xl font-bold mt-1">{mockMetrics.summary.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Porcentaje Felicidad</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">
                    {mockMetrics.moodDistribution.happy}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reportes por Estudiante</p>
                  <p className="text-2xl font-bold mt-1 text-blue-500">
                    {mockMetrics.summary.reportsPerStudent}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-hover neon-border">
          <CardHeader>
            <CardTitle>Ranking por Campus</CardTitle>
            <CardDescription>Comparación de métricas entre los 5 campuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMetrics.campusComparison.map((campus, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50">
                  <div>
                    <h3 className="font-semibold">{campus.campusName}</h3>
                    <Badge>{campus.totalReports} reportes</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Siestas:</span>
                      <span className="font-semibold">{campus.napPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Felicidad:</span>
                      <span className={`font-semibold ${parseFloat(campus.happinessIndex) > 70 ? 'text-green-500' : parseFloat(campus.happinessIndex) > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {campus.happinessIndex}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

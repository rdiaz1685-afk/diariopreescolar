'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useCampuses, useGroups, useMetrics, Campus, Group, Metrics } from '@/hooks/use-dashboard'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Baby,
  Utensils,
  BedDouble,
  ShieldCheck,
  Award,
  Calendar,
  Target,
  Clock,
  Smile,
  Brain,
  RefreshCw,
  MapPin,
  MessageSquare
} from 'lucide-react'
import { FeedbackList } from '@/components/feedback-list'

export default function Dashboard() {
  const [selectedCampus, setSelectedCampus] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week')
  const [currentDate, setCurrentDate] = useState<string>('')

  // Set current date only on client side to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  const { campuses, loading: campusesLoading } = useCampuses()
  const { groups } = useGroups(selectedCampus)
  const { metrics, loading: metricsLoading } = useMetrics(selectedCampus || undefined, selectedGroup || undefined, selectedPeriod)

  const totalStudents = campuses.reduce((sum, campus) => sum + (campus.studentCount || 0), 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent neon-text">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas y tendencias por campus y grupo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {currentDate}
            </div>
            <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                RA
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Filtros */}
        <Card className="card-hover neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Filtros de Análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Selector de Campus */}
              <div className="space-y-2">
                <Label>Campus</Label>
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los campuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los campuses</SelectItem>
                    {campuses.map(campus => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name} ({campus.studentCount} estudiantes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de Grupo */}
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grupos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los grupos</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} - {group.level} ({group.studentCount} estudiantes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de Periodo */}
              <div className="space-y-2">
                <Label>Periodo</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                    <SelectItem value="semester">Este semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                  <p className="text-2xl font-bold mt-1">{totalStudents}</p>
                </div>
                <Users className="w-10 h-10 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reportes</p>
                  <p className="text-2xl font-bold mt-1">
                    {metrics?.summary.totalReports || 0}
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-accent opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Porcentaje Felicidad</p>
                  <p className="text-2xl font-bold mt-1 text-green-500">
                    {metrics?.summary.reportsPerStudent || 0}%
                  </p>
                </div>
                <Smile className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reportes por Estudiante</p>
                  <p className="text-2xl font-bold mt-1 text-blue-500">
                    {metrics?.summary.reportsPerStudent || 0}
                  </p>
                </div>
                <Award className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de análisis */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[800px]">
            <TabsTrigger value="overview" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Resumen General
            </TabsTrigger>
            <TabsTrigger value="moods" className="gap-2">
              <Smile className="w-4 h-4" />
              Estados de Ánimo
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="gap-2">
              <Target className="w-4 h-4" />
              Comparaciones
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Sugerencias
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Resumen General */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Siestas */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-purple-500" />
                    Siestas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total siestas</span>
                      <Badge className="bg-purple-500/20 text-purple-500">
                        {metrics?.napPercentage.total || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Porcentaje</span>
                      <Badge className="bg-green-500/20 text-green-500">
                        {metrics?.napPercentage.percentage || 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alimentación */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-green-500" />
                    Alimentación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Comieron todo</span>
                      <Badge className="bg-green-500/20 text-green-500">
                        {metrics?.lunchIntakeDistribution.all || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Comieron mitad</span>
                      <Badge className="bg-yellow-500/20 text-yellow-500">
                        {metrics?.lunchIntakeDistribution.half || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">No comieron</span>
                      <Badge className="bg-red-500/20 text-red-500">
                        {metrics?.lunchIntakeDistribution.none || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pañales */}
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-orange-500" />
                    Cambios de Pañal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total cambios</span>
                      <Badge className="bg-orange-500/20 text-orange-500">
                        {metrics?.diaperChanges.total || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Promedio diario</span>
                      <Badge className="bg-blue-500/20 text-blue-500">
                        {metrics?.diaperChanges.averagePerDay || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medicamentos */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  Medicamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total medicamentos administrados</p>
                    <p className="text-3xl font-bold mt-1">
                      {metrics?.medicationGiven.total || 0}
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-500">
                    {metrics?.medicationGiven.percentage || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Estados de Ánimo */}
          <TabsContent value="moods" className="space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-primary" />
                  Distribución de Estados de Ánimo
                </CardTitle>
                <CardDescription>
                  Análisis del comportamiento emocional de los estudiantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-6xl mb-2">😊</div>
                    <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Alegres</p>
                      <p className="text-3xl font-bold text-green-500">
                        {metrics?.moodDistribution.happy || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-6xl mb-2">🤔</div>
                    <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Pensativos</p>
                      <p className="text-3xl font-bold text-yellow-500">
                        {metrics?.moodDistribution.thoughtful || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-6xl mb-2">😢</div>
                    <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Tristes</p>
                      <p className="text-3xl font-bold text-blue-500">
                        {metrics?.moodDistribution.sad || 0}
                      </p>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-6xl mb-2">😠</div>
                    <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Enojados</p>
                      <p className="text-3xl font-bold text-red-500">
                        {metrics?.moodDistribution.angry || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tendencias */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Tendencias Temporales
                </CardTitle>
                <CardDescription>
                  Evolución del comportamiento en el periodo seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {metrics?.trends.dailyTrends.map((trend, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50">
                        <div className="flex-shrink-0">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1">
                            {new Date(trend.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Reportes:</span>
                              <span className="font-semibold">{trend.totalReports}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Felicidad:</span>
                              <span className="font-semibold text-green-500">{trend.happyPercentage}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Siestas:</span>
                              <span className="font-semibold text-purple-500">{trend.napPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Comparaciones */}
          <TabsContent value="comparisons" className="space-y-6">
            {/* Comparación entre Campuses */}
            <Card className="card-hover neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Ranking por Campus
                </CardTitle>
                <CardDescription>
                  Comparación de métricas entre los 5 campuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {metrics?.campusComparison.map((campus, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50">
                        <div className="flex-shrink-0">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {index + 1}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
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
                            {parseFloat(campus.happinessIndex) > 70 && (
                              <TrendingUp className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                            {parseFloat(campus.happinessIndex) < 50 && (
                              <TrendingDown className="w-5 h-5 text-red-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Comparación entre Grupos */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Ranking por Grupo
                </CardTitle>
                <CardDescription>
                  Comparación de métricas entre grupos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {metrics?.groupComparison.map((group, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-secondary/50">
                        <div className="flex-shrink-0">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-accent text-accent-foreground">
                              {group.level.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{group.groupName}</h3>
                            <Badge variant="outline">{group.level}</Badge>
                            <Badge>{group.totalReports} reportes</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Siestas:</span>
                              <span className="font-semibold">{group.napPercentage}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Felicidad:</span>
                              <span className={`font-semibold ${parseFloat(group.happinessIndex) > 70 ? 'text-green-500' : parseFloat(group.happinessIndex) > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {group.happinessIndex}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Nutrición:</span>
                              <span className={`font-semibold ${parseFloat(group.nutritionIndex) > 70 ? 'text-green-500' : parseFloat(group.nutritionIndex) > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                {group.nutritionIndex}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Sugerencias */}
          <TabsContent value="feedback" className="space-y-6">
            <FeedbackList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload, Users, Baby, Building } from 'lucide-react'

interface Campus {
  id: string
  name: string
  code: string
}

interface Group {
  id: string
  name: string
  level: string
  campusId: string
}

export function StudentFormSimple() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')

  const [campuses, setCampuses] = useState<Campus[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedCampus, setSelectedCampus] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    emergencyPhone: '',
    parentEmail: '',
    parentPhone: '',
    medicalNotes: '',
    campusId: '',
    groupId: ''
  })

  const [batchData, setBatchData] = useState('')

  // Cargar campuses al montar
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        // Primero, llamar a setup para asegurar que existan campuses
        console.log('Iniciando setup de base de datos...')
        const setupResponse = await fetch('/api/setup')
        if (setupResponse.ok) {
          const setupData = await setupResponse.json()
          console.log('Setup completado:', setupData)
        }

        // Ahora cargar los campuses
        const response = await fetch('/api/campuses')
        if (response.ok) {
          const data = await response.json()
          console.log('Campuses cargados:', data)
          setCampuses(data)

          // Si no hay campuses después del setup, mostrar error
          if (data.length === 0) {
            console.error('No se encontraron campuses después del setup')
          }
        } else {
          console.error('Error cargando campuses:', response.status)
        }
      } catch (error) {
        console.error('Error cargando campuses:', error)
      }
    }

    fetchCampuses()
  }, [])

  // Cargar grupos cuando se selecciona un campus
  useEffect(() => {
    const fetchGroups = async () => {
      if (selectedCampus) {
        try {
          const response = await fetch(`/api/groups?campusId=${selectedCampus}`)
          if (response.ok) {
            const data = await response.json()
            console.log('Grupos cargados:', data)
            setGroups(data)
          } else {
            console.error('Error cargando grupos:', response.status)
          }
        } catch (error) {
          console.error('Error cargando grupos:', error)
        }
      } else {
        setGroups([])
      }
    }

    fetchGroups()
  }, [selectedCampus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error del servidor:', errorData)
        throw new Error(errorData.details || errorData.message || 'Error al crear estudiante')
      }

      const student = await response.json()

      toast({
        title: 'Student created',
        description: `${student.name} ${student.lastName} has been added successfully`
      })

      setFormData({
        name: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        emergencyContact: '',
        emergencyPhone: '',
        parentEmail: '',
        parentPhone: '',
        medicalNotes: '',
        campusId: '',
        groupId: ''
      })
      setSelectedCampus('')

      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el estudiante',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const lines = batchData.trim().split('\n')
      const students = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',').map(part => part.trim())
          return {
            name: parts[0] || '',
            lastName: parts[1] || '',
            dateOfBirth: parts[2] || '',
            gender: parts[3] || 'M'
          }
        })
        .filter(s => s.name && s.lastName)

      if (students.length === 0) {
        toast({
          title: 'Error',
          description: 'No se encontraron estudiantes válidos',
          variant: 'destructive'
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/students/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students })
      })

      if (!response.ok) throw new Error('Error al crear estudiantes')

      const result = await response.json()

      toast({
        title: 'Students created',
        description: result.message
      })

      setBatchData('')

      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron crear los estudiantes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-muted-foreground">Processing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Student Management
          </CardTitle>
          <CardDescription>
            Add students individually or in bulk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'single' ? 'default' : 'outline'}
              onClick={() => setActiveTab('single')}
              className="flex-1"
            >
              <Baby className="w-4 h-4 mr-2" />
              Add Single
            </Button>
            <Button
              variant={activeTab === 'batch' ? 'default' : 'outline'}
              onClick={() => setActiveTab('batch')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
          </div>

          {/* Formulario Individual */}
          {activeTab === 'single' && (
            <form onSubmit={handleSubmit} className="space-y-4 relative" style={{ isolation: 'isolate' }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Campus *</Label>
                  {campuses.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground bg-muted rounded-md">
                      Preparing database, please wait a moment...
                    </div>
                  ) : (
                    <Select value={formData.campusId} onValueChange={(value) => {
                      setFormData({ ...formData, campusId: value, groupId: '' })
                      setSelectedCampus(value)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Group *</Label>
                  <Select value={formData.groupId} onValueChange={(value) => setFormData({ ...formData, groupId: value })} disabled={!selectedCampus}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCampus ? "Select group" : "Select campus first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent Phone</Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Medical Notes</Label>
                <Textarea
                  id="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  placeholder="Allergies, medications, special conditions..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Add Student'}
              </Button>
            </form>
          )}

          {/* Carga Masiva */}
          {activeTab === 'batch' && (
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchData">
                  Student Data (CSV)
                </Label>
                <Textarea
                  id="batchData"
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  rows={10}
                  placeholder="John, Smith, 2020-05-15, M&#10;Mary, Garcia, 2020-06-20, F&#10;Charles, Lopez, 2020-07-10, M"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Format: First Name, Last Name, Date of Birth (YYYY-MM-DD), Gender (M/F)
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 'Create Students'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

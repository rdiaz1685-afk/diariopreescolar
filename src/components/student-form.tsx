'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Upload, Users, Baby } from 'lucide-react'
import { useCampuses, useGroups } from '@/hooks/use-dashboard'

interface StudentFormData {
  name: string
  lastName: string
  dateOfBirth: string
  gender: string
  campusId: string
  groupId: string
  emergencyContact: string
  emergencyPhone: string
  parentEmail: string
  parentPhone: string
  medicalNotes: string
}

export function StudentForm() {
  const { toast } = useToast()
  const { campuses, loading: campusesLoading } = useCampuses()
  const { groups } = useGroups(selectedCampus)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [selectedCampus, setSelectedCampus] = useState('')

  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    campusId: '',
    groupId: '',
    emergencyContact: '',
    emergencyPhone: '',
    parentEmail: '',
    parentPhone: '',
    medicalNotes: ''
  })

  const [batchData, setBatchData] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Error al crear estudiante')

      const student = await response.json()

      toast({
        title: 'Estudiante creado',
        description: `${student.name} ${student.lastName} se ha agregado exitosamente`
      })

      // Limpiar formulario
      setFormData({
        name: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        campusId: '',
        groupId: '',
        emergencyContact: '',
        emergencyPhone: '',
        parentEmail: '',
        parentPhone: '',
        medicalNotes: ''
      })

      // Recargar página para ver el nuevo estudiante
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el estudiante',
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
      // Parsear los datos del textarea
      const lines = batchData.trim().split('\n')
      const students = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',').map(p => p.trim())
          return {
            name: parts[0] || '',
            lastName: parts[1] || '',
            dateOfBirth: parts[2] || '',
            gender: parts[3] || 'M',
            campusId: selectedCampus || null,
            groupId: formData.groupId || null
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
        title: 'Estudiantes creados',
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

  return (
    <div className="space-y-6">
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Gestión de Estudiantes
          </CardTitle>
          <CardDescription>
            Agrega estudiantes de forma individual o en lote
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
              Agregar Uno
            </Button>
            <Button
              variant={activeTab === 'batch' ? 'default' : 'outline'}
              onClick={() => setActiveTab('batch')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Carga Masiva
            </Button>
          </div>

          {/* Formulario Individual */}
          {activeTab === 'single' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campus">Campus</Label>
                  <Select value={formData.campusId} onValueChange={(value) => {
                    setFormData({ ...formData, campusId: value })
                    setSelectedCampus(value)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {campuses && campuses.length > 0 && campuses.map(campus => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select value={formData.groupId} onValueChange={(value) => setFormData({ ...formData, groupId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {groups && groups.length > 0 && groups.map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} - {group.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email del Padre/Madre</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Teléfono del Padre/Madre</Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalNotes">Notas Médicas</Label>
                <Textarea
                  id="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  placeholder="Alergias, medicamentos, condiciones especiales..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Guardando...' : 'Agregar Estudiante'}
              </Button>
            </form>
          )}

          {/* Carga Masiva */}
          {activeTab === 'batch' && (
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campus">Campus *</Label>
                <Select value={selectedCampus} onValueChange={setSelectedCampus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin asignar</SelectItem>
                    {campuses && campuses.length > 0 && campuses.map(campus => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchData">
                  Datos de Estudiantes (CSV)
                </Label>
                <Textarea
                  id="batchData"
                  value={batchData}
                  onChange={(e) => setBatchData(e.target.value)}
                  rows={10}
                  placeholder="Juan, Pérez, 2020-05-15, M&#10;María, García, 2020-06-20, F&#10;Carlos, López, 2020-07-10, M"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: Nombre, Apellido, Fecha de Nacimiento (YYYY-MM-DD), Género (M/F)
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Procesando...' : 'Crear Estudiantes'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Search, Save, Phone, Mail, User } from 'lucide-react'

interface Student {
  id: string
  name: string
  lastName: string
  emergencyContact: string
  emergencyPhone: string
  parentEmail: string
  parentPhone: string
  campusId: string
  groupId: string
}

export function ParentContactEditor() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [editing, setEditing] = useState(false)

  const [formData, setFormData] = useState({
    emergencyContact: '',
    emergencyPhone: '',
    parentEmail: '',
    parentPhone: ''
  })

  // Buscar estudiantes
  useEffect(() => {
    const searchStudents = async () => {
      if (searchQuery.length < 2) {
        // Si no hay búsqueda o es muy corta, no cargar
        setStudents([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/students?search=${encodeURIComponent(searchQuery)}`)
        console.log('Buscando estudiantes con query:', searchQuery)
        if (response.ok) {
          const data = await response.json()
          console.log('Estudiantes encontrados:', data.length)
          setStudents(data)
        } else {
          console.error('Error en respuesta de búsqueda:', response.status)
        }
      } catch (error) {
        console.error('Error buscando estudiantes:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchStudents, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone
    })
    setEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    try {
      const response = await fetch(`/api/students/${selectedStudent.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Error al actualizar')
      }

      toast({
        title: 'Datos actualizados',
        description: `Contacto de ${selectedStudent.name} ${selectedStudent.lastName} actualizado correctamente`
      })

      setEditing(false)
      setSelectedStudent(null)
      setFormData({
        emergencyContact: '',
        emergencyPhone: '',
        parentEmail: '',
        parentPhone: ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los datos de contacto',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Edición de Datos de Padres
          </CardTitle>
          <CardDescription>
            Buscar por nombre del niño para editar sus datos de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buscador */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar niño por nombre</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                placeholder="Escribe el nombre del niño..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {searchQuery.length >= 2 && !selectedStudent && (
            <div className="space-y-2">
              {loading ? (
                <div className="text-center text-muted-foreground py-4">
                  Buscando...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No se encontraron estudiantes
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="font-medium">
                        {student.name} {student.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Teléfono: {student.parentPhone || 'No registrado'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Formulario de edición */}
          {selectedStudent && editing && (
            <div className="space-y-6 border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedStudent.name} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Editando datos de contacto
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null)
                    setEditing(false)
                  }}
                >
                  Cancelar
                </Button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">
                      Contacto de Emergencia
                    </Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="Nombre del contacto de emergencia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">
                      Teléfono de Emergencia
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        placeholder="Teléfono de emergencia"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">
                      Email del Padre/Madre
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="parentEmail"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">
                      Teléfono del Padre/Madre
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="parentPhone"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        placeholder="Teléfono principal"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full neon-accent">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

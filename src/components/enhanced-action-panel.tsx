'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BedDouble, Baby, Pill, Award } from 'lucide-react'

interface Student {
  id: string
  name: string
  lastName: string
}

interface ActionPanelProps {
  selectedStudents: string[]
  students: Student[]
}

export function EnhancedActionPanel({ selectedStudents, students }: ActionPanelProps) {
  const [napTimes, setNapTimes] = useState<Record<string, string>>({})
  const [diaperChanges, setDiaperChanges] = useState<Record<string, number>>({})
  const [medicationName, setMedicationName] = useState<Record<string, string>>({})
  const [medicationQuantity, setMedicationQuantity] = useState<Record<string, string>>({})
  const [showMedicationFields, setShowMedicationFields] = useState<Record<string, boolean>>({})
  const [individualAchievements, setIndividualAchievements] = useState<Record<string, string>>({})
  const [generalNotes, setGeneralNotes] = useState('')

  const isMultipleSelection = selectedStudents.length > 1
  const isSingleSelection = selectedStudents.length === 1

  const getSelectedStudent = () => {
    if (selectedStudents.length === 1) {
      return students.find(s => s.id === selectedStudents[0])
    }
    return null
  }

  const selectedStudent = getSelectedStudent()

  return (
    <div className="space-y-6">
      {/* Siesta */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-purple-500" />
            Siesta
            {selectedStudents.length > 0 && (
              <Badge variant="secondary">({selectedStudents.length})</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isMultipleSelection
              ? 'Aplicar siesta a selección masiva'
              : 'Tiempo de siesta individual'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMultipleSelection ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 text-lg neon-accent"
                onClick={() => {
                  selectedStudents.forEach(id => setNapTimes(prev => ({ ...prev, [id]: '30 min' })))
                }}
              >
                Sí
              </Button>
              <Button
                variant="outline"
                className="h-20 text-lg"
                onClick={() => {
                  selectedStudents.forEach(id => setNapTimes(prev => ({ ...prev, [id]: '' })))
                }}
              >
                No
              </Button>
            </div>
          ) : isSingleSelection ? (
            <div className="space-y-2">
              <Label htmlFor="napTime">Tiempo de siesta</Label>
              <Input
                id="napTime"
                placeholder="Ej: 30 minutos, 1 hora..."
                value={napTimes[selectedStudents[0]] || ''}
                onChange={(e) => setNapTimes({ ...napTimes, [selectedStudents[0]]: e.target.value })}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Selecciona estudiantes para aplicar siesta
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pañal/Ropa */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-orange-500" />
            Cambio de Pañal/Ropa
            {selectedStudents.length > 0 && (
              <Badge variant="secondary">({selectedStudents.length})</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isMultipleSelection
              ? 'Aplicar cambio a selección masiva'
              : 'Número de cambios individuales'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isMultipleSelection ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 text-lg neon-accent"
                onClick={() => {
                  selectedStudents.forEach(id => setDiaperChanges(prev => ({ ...prev, [id]: 1 })))
                }}
              >
                Sí
              </Button>
              <Button
                variant="outline"
                className="h-20 text-lg"
                onClick={() => {
                  selectedStudents.forEach(id => setDiaperChanges(prev => ({ ...prev, [id]: 0 })))
                }}
              >
                No
              </Button>
            </div>
          ) : isSingleSelection ? (
            <div className="space-y-2">
              <Label htmlFor="diaperCount">Número de cambios</Label>
              <Input
                id="diaperCount"
                type="number"
                min="0"
                placeholder="Ej: 2, 3, 4..."
                value={diaperChanges[selectedStudents[0]] || ''}
                onChange={(e) => setDiaperChanges({ ...diaperChanges, [selectedStudents[0]]: parseInt(e.target.value) || 0 })}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Selecciona estudiantes para aplicar cambios
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicamento */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-red-500" />
            Medicamento
            {selectedStudents.length > 0 && (
              <Badge variant="secondary">({selectedStudents.length})</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Solo disponible para selección individual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedStudents.length ? (
            <div className="text-center text-muted-foreground py-8">
              Selecciona un estudiante individual
            </div>
          ) : isMultipleSelection ? (
            <div className="text-center text-muted-foreground py-8">
              Los medicamentos solo se aplican a estudiantes individuales
            </div>
          ) : isSingleSelection && !showMedicationFields[selectedStudents[0]] ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 text-lg neon-accent"
                onClick={() => {
                  setShowMedicationFields(prev => ({ ...prev, [selectedStudents[0]]: true }))
                  setMedicationName(prev => ({ ...prev, [selectedStudents[0]]: '' }))
                  setMedicationQuantity(prev => ({ ...prev, [selectedStudents[0]]: '' }))
                }}
              >
                Sí
              </Button>
              <Button
                variant="outline"
                className="h-20 text-lg"
                onClick={() => {
                  setShowMedicationFields(prev => ({ ...prev, [selectedStudents[0]]: false }))
                  setMedicationName(prev => ({ ...prev, [selectedStudents[0]]: '' }))
                  setMedicationQuantity(prev => ({ ...prev, [selectedStudents[0]]: '' }))
                }}
              >
                No
              </Button>
            </div>
          ) : isSingleSelection && showMedicationFields[selectedStudents[0]] ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicationName">Nombre del medicamento</Label>
                  <Input
                    id="medicationName"
                    placeholder="Nombre del medicamento"
                    value={medicationName[selectedStudents[0]] || ''}
                    onChange={(e) => setMedicationName({ ...medicationName, [selectedStudents[0]]: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicationQuantity">Cantidad</Label>
                  <Input
                    id="medicationQuantity"
                    placeholder="Cantidad (ml, mg, pastillas...)"
                    value={medicationQuantity[selectedStudents[0]] || ''}
                    onChange={(e) => setMedicationQuantity({ ...medicationQuantity, [selectedStudents[0]]: e.target.value })}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMedicationFields(prev => ({ ...prev, [selectedStudents[0]]: false }))
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Logros del día */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Logros del Día
            {selectedStudents.length > 0 && (
              <Badge variant="secondary">({selectedStudents.length})</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Solo disponible para selección individual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedStudents.length ? (
            <div className="text-center text-muted-foreground py-8">
              Selecciona un estudiante individual
            </div>
          ) : isMultipleSelection ? (
            <div className="text-center text-muted-foreground py-8">
              Los logros solo se aplican a estudiantes individuales
            </div>
          ) : isSingleSelection ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-medium">
                  {selectedStudent?.name?.charAt(0)}{selectedStudent?.lastName?.charAt(0)}
                </div>
                <span className="font-medium">
                  {selectedStudent?.name} {selectedStudent?.lastName}
                </span>
              </div>
              <Textarea
                placeholder="Escribe el logro del día..."
                value={individualAchievements[selectedStudents[0]] || ''}
                onChange={(e) =>
                  setIndividualAchievements({
                    ...individualAchievements,
                    [selectedStudents[0]]: e.target.value
                  })
                }
                className="min-h-[100px]"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Observaciones generales */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            Observaciones Generales
          </CardTitle>
          <CardDescription>
            Siempre disponible para selección masiva e individual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Agrega observaciones generales del día..."
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="min-h-[120px]"
            disabled={selectedStudents.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  )
}

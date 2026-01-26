'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Bed, Baby, Utensils, Smile, Award, CheckCircle2, Moon, Zap } from 'lucide-react'

interface Student {
  id: string
  name: string
  lastName: string
  dateOfBirth: Date
  groupId: string
  groupName?: string
}

interface DailyReport {
  studentId: string
  mood?: string
  lunchIntake?: string
  hadNap?: boolean
  diaperChanged?: boolean
  medicationGiven?: boolean
  dailyAchievements?: string
}

interface EnhancedStudentCardProps {
  student: Student
  report?: DailyReport
  selected: boolean
  onSelect: (id: string) => void
  onQuickCheck: (studentId: string, field: string, value: any) => void
}

const moodEmojis: Record<string, string> = {
  happy: '😊',
  thoughtful: '🤔',
  sad: '😢',
  angry: '😠'
}

const lunchIcons: Record<string, any> = {
  all: <Utensils className="w-4 h-4 text-green-500" />,
  half: <Utensils className="w-4 h-4 text-yellow-500" />,
  none: <Utensils className="w-4 h-4 text-red-500" />
}

export function EnhancedStudentCard({ student, report, selected, onSelect, onQuickCheck }: EnhancedStudentCardProps) {
  const [quickChecks, setQuickChecks] = useState({
    mood: report?.mood || null,
    lunchIntake: report?.lunchIntake || null,
    hadNap: report?.hadNap || false,
    diaperChanged: report?.diaperChanged || false,
    medicationGiven: report?.medicationGiven || false
  })

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card
      className={`cursor-pointer transition-all ${
        selected
          ? 'border-primary bg-primary/5 neon-border'
          : 'hover:border-primary/50'
      }`}
      onClick={() => onSelect(student.id)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Avatar y Nombre */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect(student.id)}
              className="pointer-events-none"
            />
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-accent text-accent-foreground text-base">
                {getInitials(student.name, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {student.name} {student.lastName}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {calculateAge(student.dateOfBirth)} años
                </span>
              </div>
              {student.groupName && (
                <Badge variant="outline" className="text-xs">
                  {student.groupName}
                </Badge>
              )}
            </div>
          </div>

          {/* Estado de ánimo */}
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ánimo:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, mood: null })
                  onQuickCheck(student.id, 'mood', null)
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  !quickChecks.mood ? 'bg-muted-foreground/20' : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
              >
                <span className="text-lg">{moodEmojis.happy || '😊'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, mood: 'thoughtful' })
                  onQuickCheck(student.id, 'mood', 'thoughtful')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.mood === 'thoughtful' ? 'bg-yellow-500 text-white' : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                }`}
              >
                <span className="text-lg">{moodEmojis.thoughtful || '🤔'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, mood: 'sad' })
                  onQuickCheck(student.id, 'mood', 'sad')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.mood === 'sad' ? 'bg-blue-500 text-white' : 'bg-blue-500/20 hover:bg-blue-500/30'
                }`}
              >
                <span className="text-lg">{moodEmojis.sad || '😢'}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, mood: 'angry' })
                  onQuickCheck(student.id, 'mood', 'angry')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.mood === 'angry' ? 'bg-red-500 text-white' : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                <span className="text-lg">{moodEmojis.angry || '😠'}</span>
              </button>
            </div>
          </div>

          {/* Lonche */}
          <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Lonche:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, lunchIntake: 'all' })
                  onQuickCheck(student.id, 'lunchIntake', 'all')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.lunchIntake === 'all' ? 'bg-green-500 text-white' : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
              >
                <Utensils className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, lunchIntake: 'half' })
                  onQuickCheck(student.id, 'lunchIntake', 'half')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.lunchIntake === 'half' ? 'bg-yellow-500 text-white' : 'bg-yellow-500/20 hover:bg-yellow-500/30'
                }`}
              >
                <Utensils className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, lunchIntake: 'none' })
                  onQuickCheck(student.id, 'lunchIntake', 'none')
                }}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  quickChecks.lunchIntake === 'none' ? 'bg-red-500 text-white' : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                <Utensils className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Siesta, Pañal, Medicamento */}
          <div className="flex items-center gap-2">
            {/* Siesta */}
            <div className="flex-1 flex items-center justify-between p-2 rounded-md bg-secondary/30">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Siesta:</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, hadNap: !quickChecks.hadNap })
                  onQuickCheck(student.id, 'hadNap', !quickChecks.hadNap)
                }}
                className={`p-2 rounded-md transition-all flex items-center gap-2 ${
                  quickChecks.hadNap ? 'bg-purple-500 text-white' : 'bg-purple-500/20 hover:bg-purple-500/30'
                }`}
              >
                <Bed className="w-5 h-5" />
                <Zap className="w-4 h-4" />
              </button>
            </div>

            {/* Pañal */}
            <div className="flex-1 flex items-center justify-between p-2 rounded-md bg-secondary/30">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Pañal:</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, diaperChanged: !quickChecks.diaperChanged })
                  onQuickCheck(student.id, 'diaperChanged', !quickChecks.diaperChanged)
                }}
                className={`p-2 rounded-md transition-all ${
                  quickChecks.diaperChanged ? 'bg-orange-500 text-white' : 'bg-orange-500/20 hover:bg-orange-500/30'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>

            {/* Medicamento */}
            <div className="flex-1 flex items-center justify-between p-2 rounded-md bg-secondary/30">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-red-500" />
                <span className="text-sm">Meds:</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuickChecks({ ...quickChecks, medicationGiven: !quickChecks.medicationGiven })
                  onQuickCheck(student.id, 'medicationGiven', !quickChecks.medicationGiven)
                }}
                className={`p-2 rounded-md transition-all ${
                  quickChecks.medicationGiven ? 'bg-red-500 text-white' : 'bg-red-500/20 hover:bg-red-500/30'
                }`}
              >
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Checkbox para marcar como completado */}
          <div className="flex items-center justify-between p-2 rounded-md bg-primary/5">
            <span className="text-sm text-muted-foreground">Reporte completado</span>
            <Checkbox
              checked={!!(report?.mood && report.lunchIntake)}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

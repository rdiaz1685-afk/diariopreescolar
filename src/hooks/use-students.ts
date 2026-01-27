import { useState, useEffect } from 'react'

export interface Student {
  id: string
  name: string
  lastName: string
  dateOfBirth: Date
  gender: string
  emergencyContact: string
  emergencyPhone: string
  parentEmail: string
  parentPhone: string
  medicalNotes: string | null
  groupId: string
  groups?: { name: string }
  createdAt: Date
  updatedAt: Date
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchStudents() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/students')

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Solo actualizar el estado si el componente todavía está montado
        if (isMounted) {
          setStudents(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Error fetching students:', err)

        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          // En caso de error, establecer un array vacío para que la aplicación no se rompa
          setStudents([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchStudents()

    // Cleanup function para evitar memory leaks
    return () => {
      isMounted = false
    }
  }, [])

  return {
    students, loading, error, refetch: () => {
      const fetchStudents = async () => {
        try {
          setLoading(true)
          setError(null)
          const response = await fetch('/api/students')
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          setStudents(Array.isArray(data) ? data : [])
        } catch (err) {
          console.error('Error refetching students:', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          setStudents([])
        } finally {
          setLoading(false)
        }
      }
      fetchStudents()
    }
  }
}

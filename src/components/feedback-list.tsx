'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, User, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Feedback {
    id: string
    userName: string
    userRole: string
    content: string
    status: string
    createdAt: string
}

export function FeedbackList() {
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)

    const fetchFeedback = async () => {
        try {
            console.log('--- Cargando feedback desde API ---')
            const response = await fetch('/api/feedback', { cache: 'no-store' })
            if (response.ok) {
                const data = await response.json()
                console.log('Feedback recibido:', data)
                setFeedback(data)
            }
        } catch (error) {
            console.error('Error fetching feedback:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeedback()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta sugerencia?')) return

        try {
            const response = await fetch(`/api/feedback/${id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                // Actualizar la lista localmente
                setFeedback(feedback.filter(item => item.id !== id))
            }
        } catch (error) {
            console.error('Error deleting feedback:', error)
        }
    }

    const handleToggleStatus = async (item: Feedback) => {
        const newStatus = item.status === 'pending' ? 'reviewed' : 'pending'
        try {
            const response = await fetch(`/api/feedback/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (response.ok) {
                setFeedback(feedback.map(f => f.id === item.id ? { ...f, status: newStatus } : f))
            }
        } catch (error) {
            console.error('Error updating feedback status:', error)
        }
    }

    if (loading) {
        return <div className="p-4 text-center">Cargando sugerencias...</div>
    }

    if (feedback.length === 0) {
        return (
            <Card className="neon-border">
                <CardContent className="p-12 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No hay sugerencias todavía.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="neon-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Buzón de Sugerencias y Feedback
                </CardTitle>
                <CardDescription>
                    Opiniones y propuestas enviadas por el equipo docente
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl border bg-secondary/10 hover:bg-secondary/20 transition-all space-y-3 relative group/item">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-primary/20">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{item.userName || 'Anónimo'}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.userRole || 'UNKNOWN'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={item.status === 'pending' ? 'outline' : 'default'}
                                                className={`cursor-pointer ${item.status === 'pending' ? 'border-yellow-500 text-yellow-600' : 'bg-green-600'}`}
                                                onClick={() => handleToggleStatus(item)}
                                            >
                                                {item.status === 'pending' ? 'Pendiente' : 'Revisado'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground text-right w-full justify-end">
                                            <Clock className="w-3 h-3" />
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Sin fecha'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-700 bg-white/50 p-3 rounded-lg border border-slate-100">
                                    {item.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

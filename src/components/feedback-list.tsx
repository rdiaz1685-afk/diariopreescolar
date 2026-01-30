'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, User, Clock, CheckCircle2 } from 'lucide-react'

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

    useEffect(() => {
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

        fetchFeedback()
    }, [])

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
            <CardHeader shadow-sm>
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
                            <div key={item.id} className="p-4 rounded-xl border bg-secondary/10 hover:bg-secondary/20 transition-all space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-primary/20">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{item.userName}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.userRole}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant={item.status === 'pending' ? 'outline' : 'default'} className={item.status === 'pending' ? 'border-yellow-500 text-yellow-600' : 'bg-green-600'}>
                                            {item.status === 'pending' ? 'Pendiente' : 'Revisado'}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
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

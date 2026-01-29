'use client'

import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpCircle, Play, BookOpen, MessageCircle, ArrowRight, Video, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Tutorial {
    id: string
    title: string
    description: string
    duration: string
    category: 'basicos' | 'diario' | 'alumnos' | 'reportes'
    videoUrl?: string
}

const tutorials: Tutorial[] = [
    {
        id: 'bienvenida',
        title: 'Bienvenidos a Diario Preescolar',
        description: 'Un recorrido rápido por las funciones principales de la plataforma.',
        duration: '1:15',
        category: 'basicos',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Video demo de bienvenida
    },
    {
        id: 'alta-alumno',
        title: 'Registrar un Alumno',
        description: 'Este tutorial explica cómo registrar un alumno en la plataforma. Aprenderás a ingresar la información básica y de contacto necesaria. Nota: Solo administradores tienen este privilegio.',
        duration: '2:33',
        category: 'alumnos',
        videoUrl: 'https://embed.app.guidde.com/playbooks/iSq5BX7S6kMMyRRzwJ5hfM?mode=videoOnly&cta=0'
    },
    {
        id: 'actividad-diaria',
        title: 'Registrar Actividades',
        description: 'Este tutorial explica cómo registrar comportamientos, comidas, siestas y actividades pedagógicas diarias.',
        duration: '1:32',
        category: 'diario',
        videoUrl: 'https://embed.app.guidde.com/playbooks/cRS38kgpUVU9A9v5AgV81R?mode=videoOnly&cta=0' // Tu video de Guidde aquí
    },
    {
        id: 'envio-reporte',
        title: 'Envío de Reportes Diarios',
        description: 'Cómo generar y enviar el reporte digital a los padres de familia.',
        duration: '0:45',
        category: 'reportes'
    },
    {
        id: 'mensajeria',
        title: 'Comunicación con Padres',
        description: 'Uso del sistema de feedback y avisos importantes.',
        duration: '1:00',
        category: 'reportes'
    }
]

export function HelpCenter() {
    const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null)

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="fixed bottom-8 right-8 z-[9999]">
                    <Button
                        variant="default"
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-[#10b981] text-white border-2 border-white/40 transition-all hover:scale-110 active:scale-95 group relative"
                    >
                        <HelpCircle className="h-8 w-8 transition-transform group-hover:rotate-12" />

                        {/* Puntito palpitante de interés */}
                        <span className="absolute -top-1 -right-1 flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                1
                            </span>
                        </span>
                    </Button>
                </div>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] border-l border-white/10 bg-black/95 backdrop-blur-xl text-white">
                <SheetHeader className="pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Centro de Aprendizaje</span>
                    </div>
                    <SheetTitle className="text-3xl font-extrabold tracking-tight text-white">¿Cómo podemos ayudarte?</SheetTitle>
                    <SheetDescription className="text-zinc-400 text-base">
                        Guías rápidas y micro-tutoriales para dominar la plataforma.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8">
                    {selectedVideo ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedVideo(null)}
                                className="text-primary hover:text-primary/80 -ml-2"
                            >
                                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                                Volver a la lista
                            </Button>
                            <div className="aspect-video rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl relative group">
                                {selectedVideo.videoUrl ? (
                                    <>
                                        <iframe
                                            className="w-full h-full"
                                            src={selectedVideo.videoUrl}
                                            title={selectedVideo.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture"
                                            referrerPolicy="unsafe-url"
                                            sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-forms allow-same-origin allow-presentation"
                                            allowFullScreen
                                        ></iframe>

                                        {/* Escudo de Protección: Bloquea clics en áreas de publicidad de Guidde */}
                                        <div className="absolute inset-0 z-10 pointer-events-none">
                                            {/* Bloquear esquina superior derecha (Logo/Link) */}
                                            <div className="absolute top-0 right-0 h-20 w-32 pointer-events-auto cursor-default" />
                                            {/* Bloquear esquina superior izquierda */}
                                            <div className="absolute top-0 left-0 h-16 w-16 pointer-events-auto cursor-default" />
                                            {/* Bloquear franja inferior (donde sale el botón de 'Get Guidde' al final) */}
                                            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-auto cursor-default" />
                                        </div>
                                    </>
                                ) : (
                                    /* Placeholder si no hay video */
                                    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                                        <Play className="h-16 w-16 text-primary animate-pulse" />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <p className="absolute bottom-4 text-xs text-zinc-500 font-mono italic">Próximamente: Video Tutorial</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{selectedVideo.title}</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    {selectedVideo.description}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Tutoriales Populares</h4>
                                    <div className="grid gap-4">
                                        {tutorials.map((tutorial) => (
                                            <Card
                                                key={tutorial.id}
                                                onClick={() => setSelectedVideo(tutorial)}
                                                className="p-4 bg-zinc-900/50 border-white/5 hover:bg-zinc-800/80 transition-all cursor-pointer group"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                                        {tutorial.category === 'basicos' && <Play className="h-6 w-6" />}
                                                        {tutorial.category === 'alumnos' && <Video className="h-6 w-6" />}
                                                        {tutorial.category === 'diario' && <BookOpen className="h-6 w-6" />}
                                                        {tutorial.category === 'reportes' && <MessageCircle className="h-6 w-6" />}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="font-bold text-sm group-hover:text-primary transition-colors">{tutorial.title}</h5>
                                                            <Badge variant="secondary" className="text-[10px] bg-white/5 text-zinc-400 border-none">
                                                                {tutorial.duration}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 line-clamp-2">
                                                            {tutorial.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>

                                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6 mt-8">
                                    <h4 className="font-bold text-sm mb-2 text-primary">¿Necesitas ayuda personalizada?</h4>
                                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                                        Si no encuentras lo que buscas, nuestro equipo de soporte está listo para ayudarte.
                                    </p>
                                    <Button className="w-full bg-primary text-primary-foreground font-bold text-xs" size="sm">
                                        Contactar Soporte
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Baby, Loader2, Lock, Mail, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'update-password'>('login')
    const router = useRouter()
    const { toast } = useToast()

    // Detectar si el usuario viene de un correo de recuperación
    useEffect(() => {
        // En Next.js App Router, el hash se maneja mejor con onAuthStateChange de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setMode('update-password')
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            toast({
                title: '¡Bienvenida!',
                description: 'Has iniciado sesión correctamente.',
            })

            router.push('/')
            router.refresh()
        } catch (error: any) {
            toast({
                title: 'Error de acceso',
                description: error.message || 'Credenciales inválidas',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast({
                title: 'Contraseñas no coinciden',
                description: 'Las contraseñas ingresadas deben ser iguales.',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error

            toast({
                title: 'Contraseña actualizada',
                description: 'Tu contraseña ha sido cambiada exitosamente.',
            })

            setMode('login')
            router.push('/')
        } catch (error: any) {
            toast({
                title: 'Error al actualizar',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (!email) {
            toast({
                title: 'Correo requerido',
                description: 'Por favor ingresa tu correo electrónico para enviarte el enlace de recuperación.',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login`,
            })

            if (error) throw error

            toast({
                title: 'Correo enviado',
                description: 'Se ha enviado un enlace de recuperación a tu correo electrónico registrado.',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Error al enviar recuperación. Verifica que el correo esté registrado.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl neon-border overflow-hidden">
                    <CardHeader className="space-y-1 text-center relative">
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.div
                                    key="login-header"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl">
                                            <Baby className="w-10 h-10 text-primary" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        Diario Preescolar
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground text-lg">
                                        Portal para Maestras
                                    </CardDescription>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="update-header"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-accent/10 rounded-2xl">
                                            <Lock className="w-10 h-10 text-accent" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        Nueva Contraseña
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        Ingresa tu nueva clave de acceso
                                    </CardDescription>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.form
                                    key="login-form"
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="maestra@colegio.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Contraseña</Label>
                                            <button
                                                type="button"
                                                onClick={handleResetPassword}
                                                className="text-xs font-medium text-primary hover:underline transition-colors"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            'Entrar al Diario'
                                        )}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="update-form"
                                    onSubmit={handleUpdatePassword}
                                    className="space-y-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-10 h-12"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 h-12"
                                            onClick={() => setMode('login')}
                                            disabled={loading}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-[2] h-12 font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-all shadow-lg"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                'Cambiar Clave'
                                            )}
                                        </Button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground/50">
                            Powered by Z.ai Education
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}

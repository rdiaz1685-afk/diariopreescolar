'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import {
    Users,
    UserPlus,
    FileSpreadsheet,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2
} from 'lucide-react'

export function TeamManagement() {
    const [activeView, setActiveView] = useState<'list' | 'add' | 'bulk'>('list')
    const [profiles, setProfiles] = useState<any[]>([])
    const [campuses, setCampuses] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const { toast } = useToast()

    // Formulario individual
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'maestra',
        campusId: '',
        groupId: ''
    })

    // Carga masiva (texto CSV simple)
    const [csvData, setCsvData] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [pRes, cRes, gRes] = await Promise.all([
                supabase.from('profiles').select('*, campuses(name), groups(name)').order('createdAt', { ascending: false }),
                supabase.from('campuses').select('*'),
                supabase.from('groups').select('*')
            ])

            if (pRes.data) setProfiles(pRes.data)
            if (cRes.data) setCampuses(cRes.data)
            if (gRes.data) setGroups(gRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTeacher = async (e: React.FormEvent) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            const response = await fetch('/api/auth/bulk-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teachers: [formData] })
            })
            const data = await response.json()

            if (data.results?.[0]?.success) {
                toast({ title: "Éxito", description: "Maestra creada correctamente" })
                setFormData({ name: '', email: '', password: '', role: 'maestra', campusId: '', groupId: '' })
                fetchData()
                setActiveView('list')
            } else {
                throw new Error(data.results?.[0]?.error || 'Error desconocido')
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setActionLoading(false)
        }
    }

    const handleBulkUpload = async () => {
        const lines = csvData.trim().split('\n')
        if (lines.length < 1) return

        setActionLoading(true)
        const teachers = lines.map(line => {
            const [name, email, password, role, campusName, groupName] = line.split(',').map(s => s.trim())
            const campusId = campuses.find(c => c.name.toLowerCase() === campusName?.toLowerCase())?.id
            const groupId = groups.find(g => g.name.toLowerCase() === groupName?.toLowerCase())?.id

            return { name, email, password, role: role || 'maestra', campusId, groupId }
        })

        try {
            const response = await fetch('/api/auth/bulk-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teachers })
            })
            const data = await response.json()

            const successCount = data.results.filter((r: any) => r.success).length
            toast({
                title: "Proceso completado",
                description: `Se crearon ${successCount} de ${teachers.length} usuarios.`
            })
            fetchData()
            setActiveView('list')
            setCsvData('')
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setActionLoading(false)
        }
    }

    const downloadTemplate = () => {
        const header = "Nombre Completo, Correo, Contraseña, Rol (maestra/directora/rector), Campus, Grupo (opcional)\n"
        const example = "Maria Perez, maria@colegio.com, clave123, maestra, Mitras, Toddlers A"
        const blob = new Blob([header + example], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'formato_maestras.csv'
        a.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant={activeView === 'list' ? 'default' : 'outline'}
                        onClick={() => setActiveView('list')}
                    >
                        <Users className="w-4 h-4 mr-2" /> Personal Actual
                    </Button>
                    <Button
                        variant={activeView === 'add' ? 'default' : 'outline'}
                        onClick={() => setActiveView('add')}
                    >
                        <UserPlus className="w-4 h-4 mr-2" /> Alta Individual
                    </Button>
                    <Button
                        variant={activeView === 'bulk' ? 'default' : 'outline'}
                        onClick={() => setActiveView('bulk')}
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Carga Masiva
                    </Button>
                </div>
            </div>

            {activeView === 'list' && (
                <Card className="neon-border">
                    <CardHeader>
                        <CardTitle>Personal del Colegio</CardTitle>
                        <CardDescription>Lista de usuarios con acceso al sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <div className="grid gap-4">
                                {profiles.map(profile => (
                                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20">
                                        <div>
                                            <h4 className="font-bold">{profile.name}</h4>
                                            <div className="flex gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                                                <span>{profile.role}</span>
                                                <span>•</span>
                                                <span>{profile.campuses?.name || 'Sin Campus'}</span>
                                                <span>•</span>
                                                <span>{profile.groups?.name || 'Sin Grupo'}</span>
                                            </div>
                                            <p className="text-sm text-primary">{profile.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {activeView === 'add' && (
                <Card className="neon-border max-w-2xl">
                    <CardHeader>
                        <CardTitle>Nueva Maestra</CardTitle>
                        <CardDescription>Crea un acceso individual de forma inmediata</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTeacher} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre Completo</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej: Maria Lopez" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Correo Institucional</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="maria@colegio.com" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contraseña Temporal</Label>
                                    <Input
                                        type="text"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min. 8 caracteres" required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rol</Label>
                                    <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="maestra">Maestra</SelectItem>
                                            <SelectItem value="directora">Directora</SelectItem>
                                            <SelectItem value="rector">Rector/Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Campus</Label>
                                    <Select value={formData.campusId} onValueChange={v => setFormData({ ...formData, campusId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona campus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campuses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Grupo Asignado</Label>
                                    <Select value={formData.groupId} onValueChange={v => setFormData({ ...formData, groupId: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona grupo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Registrar Maestra'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeView === 'bulk' && (
                <Card className="neon-border">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Carga Masiva</CardTitle>
                                <CardDescription>Sube a varias maestras pegando los datos de tu Excel</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                <Download className="w-4 h-4 mr-2" /> Descargar Formato
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                            <h5 className="font-bold flex items-center text-primary">
                                <AlertCircle className="w-4 h-4 mr-2" /> Instrucciones del Excel:
                            </h5>
                            <ol className="text-sm list-decimal list-inside space-y-1 text-muted-foreground">
                                <li>Copia las columnas de tu Excel en este orden: Nombre, Correo, Clave, Rol, Campus, Grupo.</li>
                                <li>Pégalas en el cuadro de abajo (asegúrate que estén separadas por comas).</li>
                                <li>El sistema creará los accesos y marcará los correos como verificados automáticamente.</li>
                            </ol>
                        </div>

                        <textarea
                            className="w-full h-48 bg-secondary/30 p-4 font-mono text-sm rounded-lg border"
                            placeholder="Maria Perez, maria@colegio.com, clave123, maestra, Mitras, Toddlers A"
                            value={csvData}
                            onChange={e => setCsvData(e.target.value)}
                        />

                        <Button className="w-full h-12" onClick={handleBulkUpload} disabled={actionLoading || !csvData}>
                            {actionLoading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            Subir Maestras e Iniciar Procesamiento
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

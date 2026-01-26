'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mail, Eye, Download, Send, MessageSquare } from 'lucide-react'

interface DailyReport {
  id: string
  studentId: string
  date: string
  mood: string | null
  lunchIntake: string | null
  hadNap: boolean
  diaperChanged: boolean
  diaperNotes: string | null
  medicationGiven: boolean
  medicationName: string | null
  medicationNotes: string | null
  dailyAchievements: string | null
  generalNotes: string | null
  student: {
    name: string
    lastName: string
    parentEmail: string
    parentPhone: string
  }
}

interface EmailReportPreviewProps {
  report: DailyReport
  onSend?: () => void
  onClose?: () => void
}

export function EmailReportPreview({ report, onSend, onClose }: EmailReportPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [sending, setSending] = useState(false)

  const getMoodEmoji = (mood: string | null) => {
    const moods: Record<string, { emoji: string; color: string }> = {
      happy: { emoji: '😊', color: 'bg-green-100 text-green-700' },
      thoughtful: { emoji: '🤔', color: 'bg-yellow-100 text-yellow-700' },
      sad: { emoji: '😢', color: 'bg-blue-100 text-blue-700' },
      angry: { emoji: '😠', color: 'bg-red-100 text-red-700' }
    }
    return moods[mood || 'happy'] || moods.happy
  }

  const getLunchEmoji = (intake: string | null) => {
    const intakes: Record<string, { emoji: string; text: string }> = {
      all: { emoji: '🍽️', text: 'Todo' },
      half: { emoji: '🍽️', text: 'Mitad' },
      none: { emoji: '🚫', text: 'No comió' }
    }
    return intakes[intake || 'none'] || intakes.none
  }

  const generateEmailHTML = () => {
    const { student } = report
    const mood = getMoodEmoji(report.mood)
    const lunch = getLunchEmoji(report.lunchIntake)

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Diario - ${student.name} ${student.lastName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    body {
      background: #fafafa;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #FFB6C1 0%, #AEC6CF 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .emoji {
      font-size: 24px;
    }
    .info-box {
      background: #fef9f3;
      border-left: 5px solid #FFB6C1;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .info-label {
      color: #6c757d;
      font-size: 14px;
      font-weight: 500;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
    .emoji-large {
      font-size: 40px;
      display: block;
      margin: 0 auto 10px;
    }
    .achievements-box {
      background: #e8f5e9;
      border-left: 5px solid #DDA0DD;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    .notes-box {
      background: #d1ecf1;
      border-left: 5px solid #AEC6CF;
      padding: 20px;
      border-radius: 10px;
    }
    .notes-text {
      color: #2c3e50;
      font-size: 15px;
      line-height: 1.6;
    }
    .footer {
      background: #fef9f3;
      padding: 25px 30px;
      text-align: center;
      margin-top: 20px;
      border-radius: 0 0 20px 20px;
    }
    .footer p {
      color: #6c757d;
      font-size: 14px;
      margin: 5px 0;
    }
    .footer strong {
      color: #2c3e50;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        border-radius: 15px;
      }
      .content {
        padding: 20px;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Reporte Diario</h1>
      <p>${new Date(report.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <!-- Estado de Ánimo -->
      <div class="section">
        <div class="section-title">
          <span>😊</span>
          <span>Estado de Ánimo Hoy</span>
        </div>
        <div class="info-box">
          <div class="emoji-large" style="text-align: center;">${mood.emoji}</div>
          <p style="font-size: 18px; text-align: center; font-weight: 600;">
            ${report.mood === 'happy' ? '¡Muy feliz! 😊' : report.mood === 'thoughtful' ? 'Pensativo 🤔' : report.mood === 'sad' ? 'Un poco triste 😢' : 'Molesto 😠'}
          </p>
        </div>
      </div>

      <!-- Comida -->
      <div class="section">
        <div class="section-title">
          <span>🍽️</span>
          <span>Alimentación del Día</span>
        </div>
        <div class="info-box">
          <div class="info-grid">
            <div class="info-item">
              <div class="emoji-large">${lunch.emoji}</div>
              <div>
                <div class="info-label">Lonche</div>
                <div class="info-value">${lunch.text}</div>
              </div>
            </div>
            ${report.hadNap ? `
            <div class="info-item">
              <div class="emoji-large">😴</div>
              <div>
                <div class="info-label">Siesta</div>
                <div class="info-value">✅ Sí, durmió</div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Cuidados (Pañal/Medicamento) -->
      <div class="section">
        <div class="section-title">
          <span>👶</span>
          <span>Cuidados del Día</span>
        </div>
        <div class="info-box">
          <div class="info-grid">
            ${report.diaperChanged ? `
            <div class="info-item" style="background: #FFB6C1;">
              <div class="emoji-large">🧷</div>
              <div>
                <div class="info-label" style="color: white;">Pañal</div>
                <div class="info-value" style="color: white;">${report.diaperNotes || '1 cambio'}</div>
              </div>
            </div>
            ` : ''}
            ${report.medicationGiven ? `
            <div class="info-item" style="background: #77DD77;">
              <div class="emoji-large">💊</div>
              <div>
                <div class="info-label" style="color: white;">Medicamento</div>
                <div class="info-value" style="color: white;">${report.medicationName || 'Sí'}</div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Logros del Día -->
      <div class="section">
        <div class="section-title">
          <span>⭐</span>
          <span>Logros del Día</span>
        </div>
        <div class="achievements-box">
          <p class="notes-text" style="text-align: center; font-size: 18px; font-weight: 600;">
            ${report.dailyAchievements || '¡Excelente día! 🌟'}
          </p>
        </div>
      </div>

      <!-- Observaciones -->
      ${report.generalNotes ? `
      <div class="section">
        <div class="section-title">
          <span>📝</span>
          <span>Observaciones Generales</span>
        </div>
        <div class="notes-box">
          <p class="notes-text">
            ${report.generalNotes}
          </p>
        </div>
      </div>
      ` : ''}
    </div>
  </div>

    <div class="footer">
      <p><strong>Preescolar</strong> | Reporte Diario de Actividades</p>
      <p>Contacto para preguntas: ${student.parentPhone}</p>
    </div>
  </div>
  </div>
</body>
</html>`
  }

  const handleSendEmail = async () => {
    if (onSend) {
      onSend()
    }
  };

  const copyToClipboard = (text: string, type: 'whatsapp' | 'email') => {
    navigator.clipboard.writeText(text);
    alert(`Reporte para ${type} copiado al portapapeles`);
  };

  const generatePlainTextSummary = () => {
    const moods: Record<string, string> = {
      happy: '¡Muy feliz! 😊',
      thoughtful: 'Pensativo 🤔',
      sad: 'Un poco triste 😢',
      angry: 'Enojado 😠'
    };

    const intakes: Record<string, string> = {
      all: 'Todo 🍽️',
      half: 'Mitad 🥗',
      none: 'No comió 🚫'
    };

    const dateStr = new Date(report.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    let summary = `*📊 Reporte Diario - ${report.student.name} ${report.student.lastName}*\n`;
    summary += `📅 _${dateStr}_\n\n`;
    summary += `😊 *Ánimo:* ${moods[report.mood || 'happy']}\n`;
    summary += `🍽️ *Lonche:* ${intakes[report.lunchIntake || 'all']}\n`;

    if (report.hadNap) summary += `😴 *Siesta:* Sí ✅\n`;
    if (report.diaperChanged) summary += `🧷 *Pañal/Ropa:* ${report.diaperNotes || '1 cambio'} ✅\n`;
    if (report.medicationGiven) summary += `💊 *Medicamento:* ${report.medicationName || 'Sí'} ✅\n`;

    if (report.dailyAchievements) {
      summary += `\n⭐ *Logro del Día:*\n${report.dailyAchievements}\n`;
    }

    if (report.generalNotes) {
      summary += `\n📝 *Observaciones:*\n${report.generalNotes}\n`;
    }

    summary += `\n_Enviado desde Diario Preescolar_`;
    return summary;
  };

  return (
    <Card className="neon-border shadow-2xl overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            <div className="text-xl">
              Vista Previa del Reporte
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-red-50 hover:text-red-600"
          >
            Cerrar
          </Button>
        </CardTitle>
        <CardDescription>
          Personaliza y envía el reporte de <strong>{report.student.name} {report.student.lastName}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Padre/Madre</p>
            <p className="font-semibold text-blue-900">{report.student.parentEmail}</p>
          </div>
          <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Teléfono</p>
            <p className="font-semibold text-green-900">{report.student.parentPhone}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold"
            onClick={() => {
              const phone = report.student.parentPhone?.replace(/\D/g, '');
              const message = generatePlainTextSummary();
              window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`, '_blank');
            }}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Enviar WhatsApp
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-green-500 text-green-700 hover:bg-green-50 h-12"
            onClick={() => copyToClipboard(generatePlainTextSummary(), 'whatsapp')}
          >
            <Send className="w-4 h-4 mr-2" />
            Copiar para WhatsApp
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={showPreview ? "secondary" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa Visual'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const html = generateEmailHTML()
              const printWindow = window.open('', '_blank')
              if (printWindow) {
                printWindow.document.write(html)
                printWindow.document.close()
                printWindow.print()
              }
            }}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Imprimir Reporte
          </Button>
        </div>

        {showPreview && (
          <div className="border border-primary/20 rounded-xl overflow-hidden shadow-inner bg-white">
            <div className="bg-gray-100 p-2 text-xs text-gray-500 border-b flex justify-between items-center">
              <span>Simulación de Email</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            </div>
            <iframe
              srcDoc={generateEmailHTML()}
              className="w-full h-[500px] border-0"
              title="Vista Previa"
            />
          </div>
        )}

        <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            Este reporte será enviado de forma privada al WhatsApp del padre de familia.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

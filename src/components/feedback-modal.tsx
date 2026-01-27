'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Lightbulb, Send, MessageSquarePlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function FeedbackModal() {
    const [content, setContent] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsSending(true)
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })

            if (response.ok) {
                toast({
                    title: "Suggestion sent!",
                    description: "Thank you for helping us improve our community's work.",
                })
                setContent('')
                setIsOpen(false)
            } else {
                const error = await response.json()
                throw new Error(error.error || 'Failed to send')
            }
        } catch (error: any) {
            toast({
                title: "Could not send suggestion",
                description: "Please try again later or contact support.",
                variant: "destructive"
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-primary hover:bg-primary/10 transition-all font-semibold">
                    <Lightbulb className="w-4 h-4" />
                    <span>Feedback</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] neon-border">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquarePlus className="w-6 h-6 text-primary" />
                        <DialogTitle className="text-2xl">Improvements & Suggestions</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        Your experience is very valuable to us. Please share any ideas or improvements you'd like to see in the app.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Describe your idea here... (e.g., 'It would be great if we could add photos to reports')"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[150px] bg-secondary/20 focus:ring-primary/50"
                    />
                    <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Your suggestion will be reviewed by the administration team to continue evolving together.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSending}
                        className="w-full neon-accent group"
                    >
                        {isSending ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                            <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                        )}
                        Send Suggestion
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

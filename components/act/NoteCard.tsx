'use client'

import { useState } from 'react'
import { StoryNote } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { GameIcon } from '@/components/icons/GameIcon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface NoteCardProps {
  note: StoryNote
  noteType: { value: string; label: string; icon: string }
  onUpdate: (id: string, updates: Partial<StoryNote>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function NoteCard({ note, noteType, onUpdate, onDelete }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content || '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSave() {
    if (!editTitle.trim()) return

    setSaving(true)
    await onUpdate(note.id, {
      title: editTitle.trim(),
      content: editContent.trim() || null
    })
    setSaving(false)
    setIsEditing(false)
  }

  function handleCancel() {
    setEditTitle(note.title)
    setEditContent(note.content || '')
    setIsEditing(false)
  }

  async function handleToggleReveal() {
    await onUpdate(note.id, { is_revealed: !note.is_revealed })
  }

  async function handleDelete() {
    await onDelete(note.id)
    setConfirmDelete(false)
  }

  // Editing mode dialog
  if (isEditing) {
    return (
      <Dialog open={isEditing} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GameIcon name={noteType.icon} category="ui" size={20} />
              Modifica Nota
            </DialogTitle>
            <DialogDescription>
              {noteType.label}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-[var(--ink-light)] mb-1 block">Titolo</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Titolo della nota"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-[var(--ink-light)] mb-1 block">Contenuto</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Contenuto della nota..."
                rows={10}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={saving || !editTitle.trim()}>
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <div className="bg-[var(--paper)] rounded border border-[var(--ink-faded)]/10 overflow-hidden">
        {/* Header - always visible */}
        <div
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[var(--ink)]/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-[var(--ink-light)] transition-transform duration-200" style={{
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
          }}>
            ▸
          </span>
          <GameIcon
            name={noteType.icon}
            category="ui"
            size={18}
            className="text-[var(--teal)]"
          />
          <span className="flex-1 font-medium text-[var(--ink)] truncate">
            {note.title}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {note.is_revealed ? (
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Rivelato
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-[var(--ink-light)]">
                Nascosto
              </Badge>
            )}
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-[var(--ink-faded)]/10 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {/* Content */}
            {note.content ? (
              <div className="text-[var(--ink)] text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {note.content}
              </div>
            ) : (
              <p className="text-[var(--ink-light)] italic text-sm">
                Nessun contenuto.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--ink-faded)]/10">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <GameIcon name="quill" category="ui" size={12} className="mr-1" />
                Modifica
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleReveal()
                }}
              >
                {note.is_revealed ? 'Nascondi' : 'Rivela'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDelete(true)
                }}
                className="text-red-500 hover:text-red-600 hover:border-red-300"
              >
                Elimina
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminare questa nota?</DialogTitle>
            <DialogDescription>
              Stai per eliminare "{note.title}". Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

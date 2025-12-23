'use client'

import { Session } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GameIcon } from '@/components/icons/GameIcon'

interface ActSessionsProps {
  sessions: Session[]
  actNumber: number
}

export function ActSessions({ sessions, actNumber }: ActSessionsProps) {
  // Sort sessions by session_number
  const sortedSessions = [...sessions].sort((a, b) => (a.session_number || 0) - (b.session_number || 0))

  return (
    <Card className="parchment-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <GameIcon name="d20" category="ui" size={20} className="text-[var(--ink)]" />
          <h3 className="text-lg font-semibold">Sessioni</h3>
          <span className="text-sm text-[var(--ink-light)]">({sessions.length})</span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-[var(--ink-faded)] italic">
            Nessuna sessione collegata a questo atto
          </p>
        ) : (
          <div className="space-y-3">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-[var(--paper)] rounded-lg border border-[var(--ink-faded)]/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GameIcon name="scroll" category="ui" size={16} className="text-[var(--ink-light)]" />
                    <span className="font-medium">Sessione #{session.session_number}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {session.play_date && (
                      <Badge variant="outline" className="text-xs">
                        {new Date(session.play_date).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Badge>
                    )}
                    {session.xp_awarded > 0 && (
                      <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                        +{session.xp_awarded} XP
                      </Badge>
                    )}
                  </div>
                </div>
                {session.summary && (
                  <p className="mt-2 text-sm text-[var(--ink-light)] line-clamp-2">
                    {session.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

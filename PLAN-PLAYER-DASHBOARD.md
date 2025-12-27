# Piano: Dashboard Login Giocatori

## Obiettivo

Permettere ai giocatori di fare login con il proprio personaggio e vedere una dashboard dedicata con:
- Sessioni della campagna
- La loro scheda personaggio
- Registro dei combattimenti
- Note rivelate dal DM
- Guida rapida su come si gioca D&D

---

## FASE 1: Database - Nuova Tabella Giocatori

### SQL da eseguire in Supabase

```sql
-- Tabella giocatori con codice accesso
CREATE TABLE dnd_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES dnd_characters(id) ON DELETE CASCADE,
  access_code VARCHAR(8) UNIQUE NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per login veloce
CREATE INDEX idx_players_access_code ON dnd_players(access_code);

-- RLS Policy (opzionale)
ALTER TABLE dnd_players ENABLE ROW LEVEL SECURITY;
```

---

## FASE 2: Autenticazione Giocatori

### 2.1 Nuovo endpoint API

**File**: `/app/api/player-auth/route.ts`

```typescript
// POST: Verifica access_code
// - Query dnd_players per access_code
// - Se trovato: imposta cookie "player-auth" con character_id
// - Aggiorna last_login
// - Ritorna character_id e campaign_id
```

### 2.2 Pagina login giocatore

**File**: `/app/player/login/page.tsx`

- Form semplice con campo "Codice Accesso"
- Design dark theme coerente con resto app
- Redirect a `/player/dashboard` dopo login

### 2.3 Middleware aggiornato

**File**: `/middleware.ts`

Aggiungere gestione rotte `/player/*`:
- Verificare cookie `player-auth`
- Escludere `/player/login` dalla protezione
- Redirect a `/player/login` se non autenticato

---

## FASE 3: Dashboard Giocatore

### Route principale

**File**: `/app/player/dashboard/page.tsx`

### Layout con 5 sezioni

| # | Sezione | Componente | Fonte Dati |
|---|---------|------------|------------|
| 1 | Scheda Personaggio | `CharacterSheet.tsx` | `dnd_characters` |
| 2 | Sessioni Campagna | `SessionsList.tsx` | `dnd_sessions` |
| 3 | Registro Combattimenti | `CombatLog.tsx` | `dnd_encounters` (completed) |
| 4 | Note Rivelate | `RevealedNotes.tsx` | `dnd_story_notes` (is_revealed=true) |
| 5 | Guida Rapida D&D | `QuickGuide.tsx` | Contenuto statico |

---

### 3.1 Scheda Personaggio (read-only)

**Componente**: `/components/player/CharacterSheet.tsx`

Mostra:
- Nome, classe, razza, livello, avatar
- HP (current/max), HP temporanei
- Armor Class, Velocità, Iniziativa
- Punteggi abilità con modificatori calcolati
- Percezione passiva, Spell Save DC
- Risorse di classe (Rage, Ki, Channel Divinity, etc.)
- Incantesimi conosciuti (da `dnd_character_spells`)
- Condizioni attuali
- Concentrazione attiva

---

### 3.2 Sessioni Campagna

**Componente**: `/components/player/SessionsList.tsx`

Query:
```sql
SELECT * FROM dnd_sessions
WHERE campaign_id = ?
ORDER BY play_date DESC, session_number DESC
```

Mostra per ogni sessione:
- Numero sessione
- Data di gioco
- Riassunto (summary)
- XP guadagnati

---

### 3.3 Registro Combattimenti

**Componente**: `/components/player/CombatLog.tsx`

Query:
```sql
SELECT e.*,
  array_agg(DISTINCT m.name) as monsters
FROM dnd_encounters e
LEFT JOIN dnd_encounter_monsters em ON e.id = em.encounter_id
LEFT JOIN dnd_monsters m ON em.monster_id = m.id
WHERE e.campaign_id = ?
  AND e.status = 'completed'
GROUP BY e.id
ORDER BY e.updated_at DESC
```

Mostra per ogni combattimento:
- Nome encounter
- Location
- Difficoltà
- Lista mostri affrontati
- Atto di riferimento

---

### 3.4 Note Rivelate

**Componente**: `/components/player/RevealedNotes.tsx`

Query:
```sql
SELECT * FROM dnd_story_notes
WHERE campaign_id = ?
  AND is_revealed = true
ORDER BY note_type, updated_at DESC
```

Raggruppate per tipo (accordion/collapsible):

| Tipo | Icona | Descrizione |
|------|-------|-------------|
| `npc` | 👤 | Personaggi incontrati |
| `location` | 📍 | Luoghi visitati |
| `quest` | ⚔️ | Missioni attive/completate |
| `lore` | 📚 | Storia del mondo |
| `secret` | 🔮 | Segreti scoperti |
| `general` | 📝 | Note generiche |

Per ogni nota:
- Titolo
- Contenuto (markdown supportato)
- Tags
- Data ultimo aggiornamento

---

### 3.5 Guida Rapida D&D

**Componente**: `/components/player/QuickGuide.tsx`

Contenuto statico con sezioni:

#### Come funzionano i tiri
- d20 + modificatore vs DC (Difficulty Class)
- Vantaggio/Svantaggio: tira 2d20, prendi il migliore/peggiore

#### Azioni in combattimento
- **Azione**: Attacco, Incantesimo, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use Object
- **Azione Bonus**: Dipende da classe/abilità
- **Reazione**: 1 per round (es. Opportunity Attack)
- **Movimento**: Velocità in piedi, può essere spezzato

#### Riposi
- **Riposo Breve** (1 ora): Usa Hit Dice per recuperare HP
- **Riposo Lungo** (8 ore): Recupera tutti gli HP, metà Hit Dice, risorse

#### Condizioni comuni
- Breve descrizione delle 14 condizioni D&D

---

## FASE 4: Generazione Codici Accesso (lato DM)

### Modifiche al Campaign Dashboard

**File**: `/app/campaigns/[id]/page.tsx`

Nella card di ogni personaggio, aggiungere:
- Bottone "Genera Codice Giocatore" (icona chiave)
- Dialog che:
  1. Genera codice random 8 caratteri (es. `A3X7K9M2`)
  2. Crea record in `dnd_players`
  3. Mostra codice da condividere con il giocatore
  4. Opzione "Rigenera Codice" se già esistente

### Endpoint API

**File**: `/app/api/player-code/route.ts`

```typescript
// POST: Genera nuovo codice per character_id
// - Genera codice random unico
// - Upsert in dnd_players
// - Ritorna codice generato

// DELETE: Revoca accesso giocatore
// - Elimina record da dnd_players
```

---

## STRUTTURA FILE DA CREARE

```
app/
├── player/
│   ├── login/
│   │   └── page.tsx              # Login giocatore
│   └── dashboard/
│       └── page.tsx              # Dashboard principale
├── api/
│   ├── player-auth/
│   │   └── route.ts              # Auth endpoint
│   └── player-code/
│       └── route.ts              # Generazione codici

components/
├── player/
│   ├── CharacterSheet.tsx        # Scheda read-only
│   ├── SessionsList.tsx          # Lista sessioni
│   ├── CombatLog.tsx             # Registro combattimenti
│   ├── RevealedNotes.tsx         # Note rivelate
│   └── QuickGuide.tsx            # Guida D&D

types/
└── database.ts                   # Aggiungere tipo Player
```

---

## TIPI TYPESCRIPT DA AGGIUNGERE

**File**: `/types/database.ts`

```typescript
export interface Player {
  id: string
  character_id: string
  access_code: string
  player_name: string
  last_login: string | null
  created_at: string
}

// Per la dashboard
export interface PlayerDashboardData {
  player: Player
  character: Character
  campaign: Campaign
  sessions: Session[]
  encounters: Encounter[]
  revealedNotes: StoryNote[]
}
```

---

## ORDINE DI IMPLEMENTAZIONE CONSIGLIATO

1. [ ] Aggiungere tipo `Player` in `types/database.ts`
2. [ ] Eseguire SQL per creare tabella `dnd_players` in Supabase
3. [ ] Creare API `/api/player-auth/route.ts`
4. [ ] Aggiornare `middleware.ts` per rotte `/player/*`
5. [ ] Creare pagina `/player/login/page.tsx`
6. [ ] Creare componenti player:
   - [ ] `CharacterSheet.tsx`
   - [ ] `SessionsList.tsx`
   - [ ] `CombatLog.tsx`
   - [ ] `RevealedNotes.tsx`
   - [ ] `QuickGuide.tsx`
7. [ ] Creare dashboard `/player/dashboard/page.tsx`
8. [ ] Creare API `/api/player-code/route.ts`
9. [ ] Aggiungere generazione codici nel campaign dashboard

---

## NOTE TECNICHE

### Cookie Strategy
- `dm-auth`: Cookie per DM (esistente)
- `player-auth`: Nuovo cookie per giocatori (contiene character_id criptato)

### Sicurezza
- Codici accesso: 8 caratteri alfanumerici (62^8 = ~218 trilioni combinazioni)
- Cookie HttpOnly + Secure
- Nessun accesso a dati di altri personaggi/campagne

### UX
- Design coerente con tema dark esistente
- Mobile-friendly per consultazione durante sessioni
- Caricamento lazy per sezioni pesanti

---

## MOCKUP STRUTTURA DASHBOARD

```
┌─────────────────────────────────────────────────────────┐
│  🎭 [Nome Personaggio] - [Classe] Lv.[X]                │
│  Campagna: [Nome Campagna]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📜 SCHEDA PERSONAGGIO                            │   │
│  │ ┌─────────┬─────────┬─────────┐                 │   │
│  │ │ HP      │ AC      │ Speed   │                 │   │
│  │ │ 45/52   │ 16      │ 30ft    │                 │   │
│  │ └─────────┴─────────┴─────────┘                 │   │
│  │ FOR DEX CON INT SAG CAR                         │   │
│  │  16  14  15  10  12  8                          │   │
│  │ (+3)(+2)(+2)(+0)(+1)(-1)                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📅 SESSIONI                                      │   │
│  │ ▸ Sessione #5 - 15 Dic 2024 - 300 XP            │   │
│  │ ▸ Sessione #4 - 08 Dic 2024 - 250 XP            │   │
│  │ ▸ ...                                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ⚔️ COMBATTIMENTI                                 │   │
│  │ ▸ Imboscata dei Goblin - Foresta Nera           │   │
│  │   Mostri: Goblin x4, Bugbear                    │   │
│  │ ▸ ...                                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📖 NOTE RIVELATE                                 │   │
│  │ ▾ NPC (3)                                        │   │
│  │   • Gundren Rockseeker - Nano mercante          │   │
│  │   • Sildar Hallwinter - Cavaliere umano         │   │
│  │ ▸ Luoghi (2)                                     │   │
│  │ ▸ Quest (1)                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🎲 GUIDA RAPIDA                                  │   │
│  │ ▸ Come funzionano i tiri                        │   │
│  │ ▸ Azioni in combattimento                       │   │
│  │ ▸ Riposi                                         │   │
│  │ ▸ Condizioni                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

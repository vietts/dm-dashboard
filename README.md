# DM Dashboard

Dashboard per Dungeon Master - Strumento completo per gestire campagne D&D 5e.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Custom SVG game icons

---

## Feature Implementate

### Gestione Campagne
- Creazione e modifica campagne D&D
- Tracciamento atto corrente
- Overview con statistiche (personaggi, sessioni, XP totali)

### Gestione Party
- Schede personaggio complete con tutte le statistiche D&D 5e
- HP tracking con pulsanti rapidi (+1, +5, -1, -5)
- Sistema condizioni (blinded, charmed, frightened, etc.)
- Livelli di esaurimento
- Avatar personalizzati
- Risorse di classe (Rage, Ki, Channel Divinity, etc.)

### Sistema Atti
- Pagina dettaglio atto dedicata (`/campaigns/[id]/acts/[actId]`)
- Sezioni: Descrizione, Obiettivi, Note, Incontri, PNG/Mostri, Sessioni
- Note raggruppate per tipo (6 categorie collassabili)
- Navigazione tra atti (precedente/successivo)
- Status: Corrente, Completato

### Sessioni di Gioco
- Registrazione sessioni con data e XP assegnati
- Collegamento sessione-atto
- Badge atto visibile nelle card sessioni
- Riassunto sessione

### Note della Storia
- 6 tipi di nota:
  - **Generale**: Note generiche
  - **PNG**: Personaggi non giocanti
  - **Luogo**: Locations
  - **Quest**: Missioni e obiettivi
  - **Segreto**: Info nascoste (reveal/hide)
  - **Lore**: Background e storia del mondo
- Note collassabili per tipo
- Collegamento note ad atti specifici

### Sistema Incontri
- Creazione incontri con nome, descrizione, location
- Difficoltà: Facile, Medio, Difficile, Mortale
- Status: Pianificato, In Corso, Completato
- Associazione mostri all'incontro
- Quick status change

### Bestiario
- Integrazione con Open5e API
- Cache locale mostri importati
- Ricerca e import rapido
- Statistiche complete mostri

### Incantesimi
- Database incantesimi D&D 5e (Open5e)
- Ricerca per nome, livello, scuola
- Cache locale

### Razze & Classi
- Riferimento rapido razze D&D 5e
- Riferimento rapido classi con archetipi

---

## Struttura Progetto

```
app/
├── page.tsx                    # Home - lista campagne
├── campaigns/
│   └── [id]/
│       ├── layout.tsx          # Layout con navigazione atti
│       ├── page.tsx            # Overview campagna (tabs)
│       └── acts/[actId]/
│           ├── page.tsx        # Dettaglio atto
│           └── loading.tsx     # Skeleton loading

components/
├── act/                        # Componenti pagina atto
│   ├── ActHeader.tsx
│   ├── ActDescription.tsx
│   ├── ActObjectives.tsx
│   ├── NotesByTypeSection.tsx
│   ├── NoteCard.tsx
│   ├── EncountersSection.tsx
│   ├── EncounterCard.tsx
│   ├── NPCMonstersSection.tsx
│   ├── ActNavigation.tsx
│   └── ActSessions.tsx
├── ui/                         # shadcn/ui components
└── icons/                      # Game icons SVG

types/
└── database.ts                 # TypeScript types Supabase
```

---

## Database Schema

### Tabelle principali
- `dnd_campaigns` - Campagne
- `dnd_characters` - Personaggi del party
- `dnd_acts` - Atti della campagna
- `dnd_sessions` - Sessioni di gioco (con `act_id`)
- `dnd_story_notes` - Note della storia
- `dnd_encounters` - Incontri
- `dnd_encounter_monsters` - Mostri negli incontri
- `dnd_monsters` - Bestiario

### Tabelle cache Open5e
- `open5e_spells` - Incantesimi
- `open5e_races` - Razze
- `open5e_classes` - Classi

---

## Setup

```bash
# Clona il repository
git clone <repo-url>
cd dm-dashboard

# Installa dipendenze
npm install

# Configura variabili ambiente
cp .env.example .env.local
# Aggiungi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# Avvia development server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## Roadmap

### Prossima Feature: Mappa Interattiva
- [ ] Upload immagine mappa (dungeon, regione, mondo)
- [ ] Marker posizionabili drag & drop
- [ ] Collegamento marker a luoghi nelle note
- [ ] Collegamento marker a incontri
- [ ] Fog of war per nascondere aree ai giocatori
- [ ] Zoom e pan

---

## Licenza

Progetto privato per uso personale.

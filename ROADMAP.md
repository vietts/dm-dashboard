# DM Dashboard - Roadmap e Piano di Sviluppo

## Sessione 22 Dicembre 2024 - Riepilogo

### Completato in questa sessione

#### 1. Espansione Open5e con Cache Supabase
- **Tabelle cache create**: `open5e_spells`, `open5e_races`, `open5e_classes`
- **Client API**: `/lib/open5e.ts` con caching automatico (7 giorni)
- **SpellBrowser UI**: Ricerca incantesimi per nome, livello, scuola
- **RaceClassBrowser UI**: Browser per razze e classi con dettagli completi

#### 2. Link PNG ↔ Bestiario
- Aggiunto campo `monster_id` a `dnd_story_notes`
- Un PNG può ora essere collegato a un mostro del bestiario per avere stats di combattimento

#### 3. TypeScript Types Aggiornati
- `CachedSpell`, `CachedRace`, `CachedClass`
- `StoryNoteWithMonster` per PNG con stats

#### 4. Initiative Tracker (COMPLETATO!)
- **Setup combattimento**: Dialog per selezionare PG e mostri (con quantità)
- **Roll automatico iniziativa**: d20 + bonus per PG, d20 + DEX mod per mostri
- **Lista ordinata**: Combattenti ordinati per iniziativa (decrescente)
- **Turno corrente evidenziato**: Ring colorato + badge "TURNO" animato
- **Controlli turno**: Next/Previous con gestione automatica round
- **Gestione HP inline**: Bottoni +/- per modificare HP
- **Gestione condizioni**: Dialog con tutte le 14 condizioni D&D
- **Reroll iniziativa**: Possibilità di rilanciare per singolo combattente
- **Rimozione combattenti**: Bottone per rimuovere sconfitti

### Stato Attuale delle Feature

| Feature | Stato | Note |
|---------|-------|------|
| Party Management | ✅ Completo | CRUD personaggi, HP tracker, condizioni |
| Note Narrative | ✅ Completo | Filtri per atto e tipo, CRUD |
| Incontri | ✅ Completo | Gestione incontri per atto, stati |
| Bestiario | ✅ Completo | Open5e import + mostri custom |
| SpellBrowser | ✅ Completo | Ricerca + cache |
| RaceClassBrowser | ✅ Completo | Browse + cache |
| Initiative Tracker | ✅ Completo | Roll, turni, HP, condizioni |
| Combat Tracker | ✅ Completo | Integrato nell'Initiative Tracker |

---

## Piano Prossimi Step

### Priorità ALTA

#### 1. Modale Personaggio Esteso (Stile Scheda D&D)
**Scopo**: Vista dettagliata del personaggio simile alla scheda ufficiale

**Funzionalità**:
- [ ] Layout a 3 colonne come scheda ufficiale
- [ ] Statistiche complete (FOR, DES, COS, INT, SAG, CAR)
- [ ] Tiri salvezza
- [ ] Abilità (skills)
- [ ] Competenze
- [ ] Equipaggiamento base
- [ ] Tratti razziali e di classe
- [ ] Spell slots (se incantatore)

**Note**: I giocatori hanno la scheda fisica, questo serve al DM per quick reference

**API da integrare**:
- Razze da Open5e → tratti razziali
- Classi da Open5e → feature di classe per livello

---

### Priorità MEDIA

#### 3. Traduzione Italiano con Cache
**Scopo**: Tradurre automaticamente contenuti Open5e in italiano

**Approccio proposto**:
```
1. Quando visualizzo un elemento (spell, race, class, monster)
2. Controllo se esiste traduzione in cache (`translations` table)
3. Se non esiste:
   - Chiamo API traduzione (DeepL gratuito? LibreTranslate?)
   - Salvo traduzione in Supabase
4. Prossima volta → uso cache
```

**Nuova tabella Supabase**:
```sql
CREATE TABLE open5e_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'spell', 'race', 'class', 'monster'
  entity_slug TEXT NOT NULL,
  field_name TEXT NOT NULL,  -- 'name', 'description', 'traits', etc.
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  language TEXT DEFAULT 'it',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, entity_slug, field_name, language)
);
```

**API Traduzione Gratuite**:
- **LibreTranslate** (self-hosted o API gratuita limitata)
- **DeepL API Free** (500.000 char/mese)
- **MyMemory** (gratuito con limiti)
- **Lingva Translate** (frontend per Google Translate)

#### 4. Tool Mappe - Ricerca Preliminare

**Tipi di mappe necessarie**:
1. **Mappe mondo/regione** - visione d'insieme delle aree
2. **Mappe battaglia** - griglia per combattimento tattico

**Tool gratuiti da valutare**:

| Tool | Tipo | Integrazione | Note |
|------|------|--------------|------|
| **Inkarnate** | Mondo | Link/embed | Free tier limitato, mappe bellissime |
| **Dungeondraft** | Battaglia | Export PNG | A pagamento, ottimo |
| **Dungeon Scrawl** | Battaglia | SVG/PNG export | Gratuito, open source |
| **Watabou Generators** | Entrambi | API/embed | Gratuito, procedurale |
| **RPG Map Editor II** | Battaglia | Export | Gratuito, browser-based |

**Approccio consigliato per MVP**:
1. **Fase 1**: Semplice upload/link immagini mappe
2. **Fase 2**: Viewer con zoom/pan
3. **Fase 3**: Overlay griglia + token posizionabili

---

### Priorità BASSA (Future)

#### 5. Battle Map Integrato
**Scopo**: Griglia di combattimento con token

**Funzionalità MVP**:
- [ ] Griglia quadrata (5ft = 1 quadrato)
- [ ] Upload immagine background
- [ ] Token draggabili per PG e mostri
- [ ] Colori diversi per fazioni
- [ ] Sync con Initiative Tracker

**Tecnologie possibili**:
- Canvas HTML5 + React-konva
- SVG interattivo
- Pixi.js per performance

#### 6. Atti come Entità Separate
**Scopo**: Refactoring architetturale per gestione atti più granulare

**Già pianificato in `joyful-cooking-hoare.md`**:
- Nuova tabella `dnd_acts`
- Migration dati esistenti
- UI per gestione atti

---

## Stack Tecnico Attuale

```
Frontend:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Supabase (PostgreSQL)
- Edge Functions (future)

API Esterne:
- Open5e API (monsters, spells, races, classes)
```

## File Chiave del Progetto

```
dm-dashboard/
├── app/
│   ├── page.tsx                    # Homepage con lista campagne
│   ├── campaigns/[id]/page.tsx     # Dashboard campagna (2500+ righe)
│   └── globals.css                 # Tema cartografico vintage
├── lib/
│   ├── supabase.ts                 # Client Supabase
│   ├── open5e.ts                   # Client Open5e con cache
│   └── dnd-utils.ts                # Utilità D&D (classi, condizioni)
├── types/
│   └── database.ts                 # Types TypeScript per DB
└── components/
    ├── ui/                         # shadcn components
    └── icons/GameIcon.tsx          # Icone game-icons.net
```

## Risorse Utili

- **Open5e API**: https://api.open5e.com/v1/
- **Open5e Docs**: https://open5e.com/
- **game-icons.net**: Icone CC BY 3.0 per D&D
- **Supabase Project**: `tifzytowwgaukmnbebed`

---

## Come Riprendere

1. Aprire il progetto: `cd /Users/francesconguyen/Desktop/DND/dm-dashboard`
2. Avviare dev server: `npm run dev`
3. Leggere questo file per contesto
4. Continuare da "Initiative Tracker" o altra priorità

## Note per Claude

- Il file campagna principale è molto grande (`app/campaigns/[id]/page.tsx`)
- Usare ricerca mirata (Grep) invece di leggere tutto
- Le tabelle DB sono documentate in `types/database.ts`
- Il piano architetturale completo è in `.claude/plans/joyful-cooking-hoare.md`

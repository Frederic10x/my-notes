# Notes App - Context pour Claude Code

## Objectif du projet

App de prise de notes avec catégorisation automatique par LLM (Groq) et dictée vocale.
Stack : Next.js 16 (App Router) + TypeScript + Supabase + Groq API + CSS pur.

## Architecture validée

### Stack technique

- **Frontend/Backend** : Next.js 16.1.6 App Router (TypeScript)
- **Base de données** : Supabase (PostgreSQL + Auth + RLS)
- **LLM** : Groq API (llama-3.1-8b-instant) pour catégorisation automatique
- **Styling** : CSS pur (CSS Modules) - PAS de Tailwind
- **Runtime** : Bun
- **Hébergement** : Vercel

### Structure du projet

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx
│   │       └── login.module.css
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── layout.module.css
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   └── note/
│   │       ├── new/
│   │       │   ├── page.tsx
│   │       │   └── page.module.css
│   │       └── [id]/
│   │           ├── page.tsx
│   │           └── page.module.css
│   ├── api/
│   │   ├── notes/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PATCH, DELETE
│   │   └── categorize/
│   │       └── route.ts          # POST (AI categorization)
│   ├── components/
│   │   ├── forms/
│   │   │   ├── NoteForm.tsx
│   │   │   ├── NoteForm.module.css
│   │   │   ├── VoiceRecorder.tsx
│   │   │   └── VoiceRecorder.module.css
│   │   └── ui/
│   │       ├── Header.tsx
│   │       ├── Header.module.css
│   │       ├── MobileNav.tsx
│   │       ├── MobileNav.module.css
│   │       ├── SearchBar.tsx
│   │       ├── SearchBar.module.css
│   │       ├── CategoryFilter.tsx
│   │       ├── CategoryFilter.module.css
│   │       ├── CategoryDropdown.tsx
│   │       ├── CategoryDropdown.module.css
│   │       ├── NotesList.tsx
│   │       ├── NotesList.module.css
│   │       ├── NoteCard.tsx
│   │       ├── NoteCard.module.css
│   │       ├── NoteRow.tsx
│   │       └── NoteRow.module.css
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    ├── supabase/
    │   ├── client.ts             # Browser client
    │   └── server.ts             # Server client (SSR)
    ├── groq/
    │   └── client.ts
    └── types/
        ├── notes.ts              # Note types & categories
        └── database.ts           # Supabase table schemas
```

**Fichiers racine :**
- `middleware.ts` - Auth guards (redirection login/dashboard)
- `next.config.ts`
- `tsconfig.json`
- `package.json`
- `.env` (variables d'environnement)

## Schema de base de données

### Table `notes`

```sql
- id: UUID (PK)
- user_id: UUID (FK auth.users)
- title: VARCHAR(255)
- content: TEXT
- category: ENUM('todo', 'done', 'recurring', 'waiting_followup')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- is_voice_note: BOOLEAN
```

**Categories exhaustives :**

| Category | Label FR | Emoji | Description |
|----------|----------|-------|-------------|
| `todo` | A faire | (badge orange) | Tache a faire, action requise |
| `done` | Fait | (badge vert) | Tache completee, information |
| `recurring` | Recurrent | (badge bleu) | Taches cycliques |
| `waiting_followup` | En attente | (badge violet) | Attente de retour avec relance |

## APIs Endpoints

### Notes CRUD

| Method | Endpoint | Description | Params |
|--------|----------|-------------|--------|
| GET | `/api/notes` | Liste notes | `?category=&search=&limit=12&offset=0` |
| POST | `/api/notes` | Creer note | `{content, is_voice_note?}` |
| GET | `/api/notes/[id]` | Detail note | - |
| PATCH | `/api/notes/[id]` | Update note | `{category?, title?, content?}` |
| DELETE | `/api/notes/[id]` | Supprimer note | - |

### AI Categorization

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/api/categorize` | Categorise contenu | `{category, title}` |

- Timeout: 10 secondes
- Retry automatique en cas d'echec
- Fallback: `{category: "todo", title: "Nouvelle note"}`

## Composants

### Forms (`src/app/components/forms/`)

- **NoteForm** : Formulaire creation/edition note avec textarea et validation
- **VoiceRecorder** : Enregistrement vocal avec Web Speech API (FR), auto-stop apres 60s silence

### UI (`src/app/components/ui/`)

- **Header** : Navigation desktop avec logo et actions
- **MobileNav** : Navigation bottom tab (Dashboard / Nouvelle note)
- **SearchBar** : Recherche avec debounce
- **CategoryFilter** : Filtres par categorie (boutons)
- **CategoryDropdown** : Selecteur categorie (dropdown)
- **NotesList** : Container liste notes avec pagination
- **NoteCard** : Carte note (vue mobile)
- **NoteRow** : Ligne note (vue desktop)

## UX/UI Specifications

### Mobile (prioritaire)

- Navigation bottom tab fixe
- Notes en cards empilees
- Titre tronque avec ellipsis
- Badge categorie colore

### Desktop

- Header fixe avec navigation
- Notes en grille/liste
- Recherche + filtres en haut
- Pagination

### Vues

1. **Login** (`/login`) : Form email/password, validation, redirection
2. **Dashboard** (`/dashboard`) : Liste notes + recherche + filtres + pagination
3. **Nouvelle note** (`/note/new`) : Textarea OU dictee vocale, categorisation auto
4. **Detail note** (`/note/[id]`) : Contenu complet, edition categorie, suppression

## Auth & Securite

- Supabase Auth (email/password)
- Middleware Next.js pour proteger routes `/dashboard/*` et `/note/*`
- Redirection automatique login <-> dashboard selon session
- RLS sur table `notes` (user_id filter)
- Validation UUID sur tous les endpoints
- Validation contenu (min 3 caracteres)

## Design System (CSS Variables)

**Fichier** : `src/app/styles/variables.css`

```css
:root {
  --color-primary: #6366f1;
  --category-todo: #f59e0b;
  --category-done: #10b981;
  --category-recurring: #3b82f6;
  --category-waiting-followup: #8b5cf6;

  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;

  --radius-md: 0.5rem;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

## Dependances

```json
{
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.93.3",
    "groq-sdk": "^0.37.0",
    "date-fns": "^4.1.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "eslint": "^9"
  }
}
```

## Variables d'environnement

Fichier `.env` :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GROQ_API_KEY=...
```

## Etat actuel du projet

**Complete :**

- Structure de dossiers
- Types TypeScript (`notes.ts`, `database.ts`)
- Clients Supabase (browser + server SSR)
- Client Groq configure
- Variables CSS
- Middleware auth (protection routes)
- Page login avec Supabase Auth
- API Routes `/api/notes` (CRUD complet)
- API Route `/api/categorize` (Groq avec retry/timeout)
- Dashboard avec liste notes, recherche, filtres, pagination
- Formulaire creation note (texte + dictee vocale)
- Page detail note avec edition categorie
- Composants UI (Header, MobileNav, NoteCard, NoteRow, etc.)
- Voice Recorder (Web Speech API FR)

**A ameliorer :**

- Refinement composants UI
- Tests
- Optimistic updates
- PWA (offline support)

## Contraintes importantes

### A NE PAS faire

- Utiliser Tailwind (CSS pur uniquement)
- Creer des composants sur-generiques (YAGNI)
- Multiplier les fichiers inutiles
- Over-engineering

### Principes de developpement

- Mobile-first
- TypeScript strict
- CSS Modules pour scoping
- Server Components par defaut
- Client Components uniquement si interactivite necessaire
- Validation des inputs cote serveur

## Notes pour Claude Code

- Toujours utiliser CSS Modules (`.module.css`)
- Privilegier Server Components
- Utiliser `'use client'` uniquement si necessaire
- Suivre la structure de dossiers etablie
- Respecter les categories exhaustives definies
- Mobile-first dans tous les styles
- UUID validation sur les IDs de notes
- Gestion erreurs avec fallbacks

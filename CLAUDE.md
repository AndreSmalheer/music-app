# MuziekApp — Project Context voor Claude Code

## Wat is dit project?
Een muziekspeler-app gebouwd als **native mobiele app via Capacitor (iOS)**. De UI is een
React + Vite web-app die Capacitor in een native shell draait. Gebruikers kunnen nummers
**downloaden vanaf YouTube** (de YouTube-URL wordt server-side omgezet naar een MP3 met
metadata + cover) en die MP3's lokaal afspelen, ordenen in playlists en per artiest bekijken.

> Belangrijk: dit is **geen PWA**. Er is geen service worker / manifest. Distributie loopt
> via Capacitor → Xcode → iOS. Een eerdere conceptversie van dit document noemde PWA; dat
> klopt niet meer.

## Tech Stack

### Frontend (✅ gebouwd)
- **Vite 8 + React 19** (JavaScript, geen TypeScript)
- **react-router-dom 7** — routing (zie routes hieronder)
- **framer-motion 12** — page transitions, tap feedback, layout animaties
- **Capacitor 8** (`@capacitor/core`, `@capacitor/ios`) — native iOS wrapper
- Audio via de native `<audio>` tag + de **Media Session API** (lockscreen controls)

### Backend (❌ nog te bouwen — scaffold staat in `/backend`)
- **Node.js + Express** — REST API onder `/api/...`
- **MongoDB + Mongoose** — songs, playlists, artists, recently played
- **Multer** — MP3 + cover upload (opslag in `backend/uploads/`)
- **YouTube-download** — YouTube-URL → MP3 (downloadstap is nog niet geïmplementeerd;
  de route/stub staat klaar in `backend/routes/songs.js`)

## Projectstructuur (werkelijk — geen frontend/-submap)
```
muziek-app/
├── CLAUDE.md
├── index.html
├── package.json              # frontend
├── vite.config.js
├── capacitor.config.json     # appId: com.andrew.musicapp, webDir: dist
├── public/
│   ├── music/test.mp3        # test-audio
│   └── covers/               # test-covers
├── ios/                      # Capacitor iOS project (Xcode)
├── src/
│   ├── main.jsx
│   ├── App.jsx               # routes + desktop-guard + player/modal providers
│   ├── components/
│   │   ├── MediaPlayer/      # PlayerContext: playSong, queue, controls, media session
│   │   ├── MediaControls/    # play/pause/next/prev UI
│   │   ├── Slider/           # voortgang / volume
│   │   ├── Header/  Footer/  # nav chrome
│   │   ├── RecentlyPlayed/   # horizontale rij op Home
│   │   ├── OptionsMenu/  ModalOverlay/  ConfirmModal/   # long-press context menu
│   │   ├── Skeleton/  EmptyState/                        # laad- en lege toestanden
│   │   └── DesktopUnsupported/                           # blokkeert >768px
│   ├── context/
│   │   ├── ModalContext.jsx          # useModal(): showOptions(...)
│   │   └── ConfirmModalContext.jsx
│   ├── hooks/
│   │   └── useLongPress.js
│   └── pages/
│       ├── Home/             ├── Search/          ├── NowPLaying/
│       ├── PlaylistDetail/   ├── ArtistDetail/    ├── Download/   (YouTube→MP3)
│       ├── Settings/         ├── Onboarding/      ├── EditPlaylist/
│       └── SeeAll/           # SeeAll, SeeAllArtists, SeeAllPlaylists, CreatePlaylist
└── backend/                  # ← nieuw, nog niet aan frontend gekoppeld
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── config/db.js
    ├── models/               # Song, Playlist, Artist, RecentlyPlayed
    ├── routes/               # songs, playlists, artists, recent, search
    ├── middleware/upload.js  # multer (MP3 + cover)
    └── uploads/              # gegenereerde MP3's + covers (gitignored)
```

## Routes (frontend — `src/App.jsx`)
| Pad | Pagina |
|-----|--------|
| `/` | Home |
| `/search` | Search |
| `/now-playing` | NowPlaying |
| `/see-all` `/see-all-artists` `/see-all-playlists` | SeeAll-varianten |
| `/playlist/:id` | PlaylistDetail |
| `/artist/:id` | ArtistDetail |
| `/create-playlist` | CreatePlaylist |
| `/edit-playlist/:id` | EditPlaylist |
| `/download` | Download (YouTube→MP3) |
| `/settings` | Settings |
| `/onboarding` | Onboarding |

## Status

### ✅ Klaar (frontend)
- Volledige UI met alle 14 routes + page transitions
- `PlayerContext` (MediaPlayer): `playSong()`, queue, next/prev, volume, media session
- Long-press → OptionsMenu / Modal / ConfirmModal systeem
- Skeleton-loaders en EmptyState op Home / RecentlyPlayed
- Desktop wordt geblokkeerd (>768px → `DesktopUnsupported`)

### ❌ Nog te doen
- [ ] Backend draaiend: Express + Mongoose-verbinding (`backend/server.js`)
- [ ] MP3-upload endpoint werkend (multer staat klaar)
- [ ] YouTube-download implementeren (URL → MP3 + metadata, in `routes/songs.js`)
- [ ] Frontend koppelen aan API — **alle pages gebruiken nu lege placeholder-arrays**
      (`placeholderArtists`, `placeholderPlaylists`, `placeholderTracks` = `[]`).
      Vervangen door `fetch`/service-laag.
- [ ] Playlists CRUD aan UI koppelen (Create/Edit playlist pages)
- [ ] Recently played echt opslaan/ophalen
- [ ] Zoeken (`/search`) op de backend aansluiten

## Datavormen die de frontend nu verwacht
De backend-modellen hieronder moeten hierop mappen. Let op: de UI gebruikt korte veldnamen.
| Frontend-veld | Bron-component | Mapt op model-veld |
|---------------|----------------|--------------------|
| track `{ id, title, cover }` | RecentlyPlayed, SeeAll | Song `_id`, `title`, `thumbnail` |
| artist `{ id, name, img }` | Home, ArtistDetail | Artist `_id`, `name`, `thumbnail` |
| playlist `{ id, title, cover }` | Home, PlaylistDetail | Playlist `_id`, `name`, `thumbnail` |
| `playSong(src, title, artist, coverSrc)` | MediaPlayer | Song `filePath` → `src` |

> Bij integratie: laat de API `thumbnail` teruggeven en map in een service-laag naar
> `cover`/`img`/`coverSrc`, óf hernoem in de components. Hou dit consistent op één plek.

## MongoDB Collections / Modellen

### `songs`
```js
{
  _id: ObjectId,
  title: String,                 // verplicht
  artist: String,                // verplicht (artiestennaam als tekst)
  album: String,                 // optioneel
  type: "mp3" | "youtube",       // bron; na download is het altijd een lokale mp3
  filePath: String,              // pad/URL naar MP3 in uploads/  (type mp3)
  youtubeId: String,             // YouTube video-id als bron (type youtube)
  thumbnail: String,             // URL naar cover
  duration: Number,              // seconden
  addedAt: Date
}
```

### `playlists`
```js
{
  _id: ObjectId,
  name: String,
  thumbnail: String,             // cover van de playlist
  songs: [ObjectId],             // refs → songs
  createdAt: Date,
  updatedAt: Date
}
```

### `artists`
```js
{
  _id: ObjectId,
  name: String,
  thumbnail: String,             // artiestenfoto
  songs: [ObjectId],             // refs → songs
  createdAt: Date
}
```

### `recentlyplayed`
```js
{
  _id: ObjectId,
  song: ObjectId,                // ref → songs
  playedAt: Date
}
```

> **Albums** worden bewust niet als aparte collection opgeslagen. Een album is óf een
> playlist, óf een groepering op het `album`-veld in `songs`. Dat houdt het simpel.

> **Settings** worden client-side bewaard (geen aparte collection nodig voor nu).

## API Endpoints
| Method | Route | Doel |
|--------|-------|------|
| `POST` | `/api/songs/upload` | MP3 (+ cover) uploaden via multer |
| `POST` | `/api/songs/download` | YouTube-URL → MP3 (download-stap, TODO) |
| `GET` | `/api/songs` | Alle songs |
| `GET` | `/api/songs/:id` | Eén song |
| `DELETE` | `/api/songs/:id` | Song verwijderen (+ bestand) |
| `GET` | `/api/playlists` | Alle playlists |
| `POST` | `/api/playlists` | Playlist aanmaken |
| `GET` | `/api/playlists/:id` | Eén playlist (met songs) |
| `PUT` | `/api/playlists/:id` | Playlist updaten |
| `DELETE` | `/api/playlists/:id` | Playlist verwijderen |
| `GET` | `/api/artists` | Alle artiesten |
| `GET` | `/api/artists/:id` | Eén artiest (met songs) |
| `GET` | `/api/recent` | Recently played |
| `POST` | `/api/recent` | Song toevoegen aan recently played |
| `GET` | `/api/search?q=` | Zoeken in songs, artists, playlists |

## Dev-commando's
```bash
# Frontend (vanaf root)
npm install
npm run dev            # Vite dev-server (--host, bereikbaar op je telefoon/LAN)
npm run build          # bouwt naar dist/  (Capacitor webDir)
npx cap sync ios       # web-build naar iOS kopiëren
npx cap open ios       # Xcode openen

# Backend (vanaf /backend)
cd backend
npm install
npm run dev            # nodemon server.js  (poort uit .env, default 3001)
```

## Regels
- `.env` staat in `.gitignore` — **nooit committen**. Gebruik `backend/.env.example` als sjabloon.
- MP3's en covers worden opgeslagen in `backend/uploads/` — die map is **gitignored**.
- Frontend praat met de backend via `/api/...`. Zet de basis-URL in een env-var
  (`VITE_API_URL`), niet hardcoded — Capacitor draait niet op `localhost`.
- Mongoose-modellen gebruiken voor alle DB-toegang.
- Eén plek voor het mappen van `thumbnail` → `cover`/`img`/`coverSrc` (service-laag).
- App is mobile-only: desktop (>768px) wordt bewust geblokkeerd.

## .env variabelen (backend/.env)
```
MONGODB_URI=mongodb://localhost:27017/muziekapp
PORT=3001
# optioneel, alleen als je YouTube Data API gebruikt voor zoeken/metadata:
YOUTUBE_API_KEY=jouw_key_hier
```
Frontend (root `.env`):
```
VITE_API_URL=http://localhost:3001
```

## Context
- Schoolproject (MBO Software Development).
- Prioriteit: **MP3 + YouTube-download is must-have**, daarna playlists/favorieten, dan polish.
- Schrijf Nederlandse comments waar het helpt; code/identifiers in het Engels (zoals nu).

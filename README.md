# MyDRTV – backend

Backend til MyDRTV, bygget med **NestJS** og **TypeORM** oven på **PostgreSQL**.
Backenden og databasen kører i **Docker** på en Hetzner-server, så alle bruger den samme database.

## Overblik

Projektet kan køre på to måder:

```
LOKALT (udvikling)                         SERVER (Hetzner)
──────────────────                         ────────────────
npm run start:dev                          docker compose up -d --build
        │                                          │
        ▼                                  ┌───────┴──────── Docker ─────────┐
NestJS på din Mac :3000                    │ backend (NestJS) :3000 ◀── internettet
        │                                  │        │                        │
        ▼  127.0.0.1:5433                  │        ▼  db:5432 (internt)     │
Postgres.app på din Mac                    │ db (postgres:18) + volume       │
                                           └─────────────────────────────────┘
```

- **Lokalt** udvikler vi med hot reload mod vores egen Postgres.app på port 5433.
- **På serveren** kører både backenden og databasen som containere, styret af `docker-compose.yml`. Når nogen poster en film, gemmes den i serverens database, og alle, der kalder `http://DIN-IP:3000`, ser den.

Begge måder læser den samme slags `.env`. Docker overskriver selv `DB_HOST` og `DB_PORT`, så backenden finder databasen inde i Docker.

## Mappestruktur

```
MyDRTV-backend/
├── src/
│   ├── main.ts               # Starter Nest-appen på PORT (standard 3000) og slår CORS til
│   ├── app.module.ts         # Rodmodul: indlæser .env og opretter DB-forbindelsen
│   ├── app.controller.ts     # GET /  → "Hello World!" (sundhedstjek)
│   ├── app.service.ts
│   └── movies/               # Feature-modul for film
│       ├── movies.module.ts      # Samler controller, service og entity
│       ├── movies.controller.ts  # Routes: GET /movies
│       ├── movies.service.ts     # Forretningslogik + databasekald via repository
│       ├── entity/movie.entity.ts      # Mapper tabellen "movies" til en TypeScript-klasse
│       └── dto/create-movie.dto.ts     # Formen på data, når en film oprettes
├── test/                     # End-to-end-tests (Jest + Supertest)
├── Dockerfile                # Opskrift på backend-imaget
├── docker-compose.yml        # Starter backend + database sammen
├── .dockerignore             # Holder node_modules, dist og .env ude af imaget
├── .env.example              # Skabelon til .env
├── .env                      # Jeres egne værdier (committes ikke)
└── package.json
```

### Sådan hænger lagene sammen

Hver feature (fx `movies`) er sit eget **modul** med tre lag:

1. **Controller** (`movies.controller.ts`) tager imod HTTP-requesten og kalder servicen.
2. **Service** (`movies.service.ts`) indeholder logikken og taler med databasen gennem et TypeORM-`Repository<Movie>`.
3. **Entity** (`movie.entity.ts`) beskriver tabellen `movies` og dens kolonner.

`MoviesModule` registrerer entity'en med `TypeOrmModule.forFeature([Movie])`, så repositoryet kan injectes i servicen. `AppModule` importerer `MoviesModule` og opretter selve databaseforbindelsen med `TypeOrmModule.forRootAsync`, som læser forbindelsesoplysningerne fra miljøvariabler via `ConfigModule`.

```
HTTP → MoviesController.findAll() → MoviesService.findAll() → Repository<Movie>.find() → PostgreSQL
```

Nye features (fx brugere eller favoritter) laves efter samme mønster: `nest g resource <navn>`, en entity, og importér modulet i `AppModule`.

## Sådan hænger det hele sammen

```
Browser / Expo-app  →  http://SERVER-IP  (port 80)
                          nginx
                          ├─ /api/...  → backend:3000  (/api fjernes: /api/movies → /movies)
                          │                └─ db:5432
                          └─ /...      → web:3000  (Next.js)
```

| Hvem | Kalder backenden på | CORS? |
|---|---|---|
| Next.js i browseren | `/api/movies` | Nej, samme adresse |
| Next.js på serveren (Server Components) | `http://backend:3000/movies` (env `API_URL`) | Nej, server til server |
| Expo-appen | `http://SERVER-IP/api/movies` (env `EXPO_PUBLIC_API_URL`) | Nej, ikke en browser |

Lokalt kører Next.js på `:3001` (`npm run dev`), og `next.config.ts` sender `/api` videre til backenden på `:3000`. Websitet bruger `src/lib/api.ts`, som vælger den rigtige adresse selv.

## Docker

### `Dockerfile` – opskriften på backenden

1. Tager udgangspunkt i `node:24-bookworm-slim`.
2. Kopierer `package.json` og `package-lock.json` og kører `npm ci`. Det lag caches, så længe afhængighederne ikke ændrer sig.
3. Kopierer resten af projektet og kører `npm run build`, som oversætter TypeScript til `dist/`.
4. Starter med `node dist/main.js` på port 3000.

`.dockerignore` sørger for, at `node_modules`, `dist` og `.env` ikke kopieres med. Adgangsoplysningerne ligger altså aldrig i imaget. De gives til containeren, når den starter.

### `docker-compose.yml` – backend og database sammen

| Service | Hvad den gør |
|---|---|
| `backend` | Bygges fra `Dockerfile`. Får brugernavn, password og databasenavn fra `.env`, men `DB_HOST=db` og `DB_PORT=5432` sættes af compose. Udstilles på port 3000. Starter først, når databasen er klar (`healthcheck`). |
| `db` | `postgres:18`. Opretter bruger og database første gang ud fra `DB_USERNAME`, `DB_PASSWORD` og `DB_DATABASE` i `.env`. Porten er kun bundet til `127.0.0.1` på serveren, så databasen kan **ikke** nås fra internettet. Backenden når den på Dockers interne netværk, og gruppen når den gennem en SSH-tunnel (se *Adgang for gruppen*). Dataen ligger i volumet `postgres_data` og overlever genstart. |

Begge services har `restart: unless-stopped`, så de starter igen af sig selv, når serveren genstartes. Det er Dockers svar på `pm2 startup`.

> **Hvorfor `db` og ikke `localhost`?** Inde i en container betyder `localhost` containeren selv. Containerne i samme compose-fil finder hinanden på servicenavnet, så backenden når databasen på `db:5432`.

## Lokal udvikling

### 1. Installér afhængigheder

```bash
npm install
```

### 2. Opret `.env`

```bash
cp .env.example .env
```

Udfyld den med jeres Postgres.app-oplysninger:

```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...
CORS_ORIGIN=
```

`DB_HOST`, `DB_PORT`, `DB_USERNAME` og `DB_DATABASE` er påkrævede. Mangler de, stopper appen ved opstart (`getOrThrow`).

### 3. Start backenden

Postgres.app skal køre. Derefter:

```bash
npm run start:dev
```

Tjek at det virker:

- http://localhost:3000 → `Hello World!`
- http://localhost:3000/movies → liste over film

### Vil du teste Docker-setuppet lokalt?

```bash
APP_PORT=3001 docker compose up -d --build
```

Så kører Docker-versionen på http://localhost:3001 ved siden af `npm run start:dev` på 3000. Databasen i Docker starter tom, så importér data som i trin 7 nedenfor. Stop igen med `docker compose down`.

## Deployment på Hetzner

Skift `DIN-IP` ud med serverens IP fra Hetzner-panelet.

### Del 1: Gør koden klar på din Mac

**1. Test lokalt**, at `npm run start:dev` virker, og at `/movies` returnerer film.

**2. Commit og push til GitHub.**

### Del 2: Sæt serveren op

**3. Log ind på serveren**

```bash
ssh root@DIN-IP
```

**4. Installér Docker og git**

```bash
curl -fsSL https://get.docker.com | sh
apt install -y git
```

Tjek at det virker:

```bash
docker compose version
```

Node, PostgreSQL og PM2 skal **ikke** installeres på serveren. Det klarer Docker.

**5. Hent koden**

Backend og web skal ligge ved siden af hinanden, fordi `docker-compose.yml` bygger websitet fra `../MyDRTV-frontend-web`:

```bash
git clone https://github.com/MyDRTV/MyDRTV-backend.git
git clone https://github.com/MyDRTV/MyDRTV-frontend-web.git
cd MyDRTV-backend
```

Er repoet privat, skal du logge ind med dit GitHub-brugernavn og et *personal access token* som password.

**6. Lav serverens `.env`**

```bash
cp .env.example .env
nano .env
```

Udfyld den, og gem med `Ctrl+O`, `Enter`, `Ctrl+X`:

```env
DB_HOST=db
DB_PORT=5432
DB_USERNAME=mydrtv
DB_PASSWORD=ET-LANGT-TILFÆLDIGT-PASSWORD
DB_DATABASE=mydrtv
CORS_ORIGIN=
```

- Databasen oprettes automatisk med disse oplysninger første gang. Der skal ikke køres `CREATE USER` eller `CREATE DATABASE`.
- Brug et nyt, stærkt password. Det er ikke det samme som jeres lokale.
- Når frontenden har en fast adresse, så skriv den i `CORS_ORIGIN`, fx `CORS_ORIGIN=https://mydrtv.dk`.

**7. Start backend og database**

```bash
docker compose up -d --build
docker compose ps
```

Begge services skal stå som `running`, og `db` som `healthy`.

**8. Flyt data fra Postgres.app til serveren**

`synchronize` er `false`, så TypeORM opretter ikke tabeller selv. Tabeller og data skal ind fra jeres lokale database.

På **din Mac** (ikke på serveren), i projektmappen:

```bash
/Applications/Postgres.app/Contents/Versions/18/bin/pg_dump \
  -h 127.0.0.1 -p 5433 -U DIT-LOKALE-BRUGERNAVN -d DIN-LOKALE-DATABASE \
  --no-owner --no-privileges > mydrtv.sql

scp mydrtv.sql root@DIN-IP:~/
rm mydrtv.sql
```

- `--no-owner --no-privileges` gør dumpet uafhængigt af, hvilken bruger der ejede tabellerne lokalt.
- Dumpet indeholder også tabellen `users`, så det må **ikke** committes til GitHub. Slet det, når det er kopieret.

- Find det lokale brugernavn og databasenavn med `psql -h 127.0.0.1 -p 5433 -U postgres -c '\l'`. Tabellerne kan godt ligge i standarddatabasen `postgres`.
- Tjek med `ls -lh mydrtv.sql`, at filen ikke er 0 bytes, før du sender den. En fejlende `pg_dump` tømmer filen, fordi `>` tømmer den, før kommandoen kører.

På **serveren**:

```bash
ls -lh ~/mydrtv.sql      # skal være større end 0
cd ~/MyDRTV-backend
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < ~/mydrtv.sql
rm ~/mydrtv.sql
```

Kommandoen bruger selv brugernavnet og databasenavnet fra serverens `.env`. En vellykket import skriver linjer som `CREATE TABLE` og `COPY 20`. Skriver den ingenting, var filen tom.

**9. Test i browseren:** `http://DIN-IP` (websitet) og `http://DIN-IP/api/movies` (backenden)

**10. Genstart serveren** og tjek, at alt kommer op af sig selv:

```bash
reboot
```

Vent et minut, og åbn `http://DIN-IP/api/movies` igen.

### Firewall

Opret en firewall i Hetzner-panelet (*Firewalls*), der kun tillader indgående **22** (SSH) og **80** (nginx). Backenden (3000) og databasen (5432) er kun bundet til `127.0.0.1` og kan ikke nås udefra.

Databasen har ingen port udadtil, så den er ikke tilgængelig fra internettet.

> Brug Hetzners firewall frem for `ufw`. Docker åbner selv porte i `iptables` og går uden om `ufw`.

### Når du har ændret noget i koden

Push fra din Mac, og kør så på serveren:

```bash
ssh root@DIN-IP
cd ~/MyDRTV-frontend-web && git pull     # hvis websitet er ændret
cd ~/MyDRTV-backend && git pull
docker compose up -d --build
```

`--build` bygger imaget igen, også med nye pakker. Der skal ikke køres `npm install` på serveren. Dataen i databasen bevares.

## Adgang for gruppen

Serverens IP-adresse og adgangsoplysningerne til databasen står ikke i repoet. Spørg i gruppen, og del dem privat, aldrig i git.

> **Hvem er jeg på?** Prompten `root@ubuntu-...` betyder, at du er på serveren. Står dit eget navn der, er du på din Mac. `pg_dump`, `scp` og tunnelen køres på Mac'en, og `docker compose` køres på serveren.

### 1. Log ind på serveren med din egen SSH-nøgle

Hver i gruppen har sin egen nøgle, så I ikke behøver dele root-koden.

På **din Mac**, én gang:

```bash
ssh-keygen -t ed25519 -C "dit-navn"   # tryk Enter til alle spørgsmål
cat ~/.ssh/id_ed25519.pub            # kopiér hele linjen
```

Send linjen fra `.pub`-filen til den, der har adgang til serveren. Det er den **offentlige** nøgle, så den er ufarlig at dele. Filen uden `.pub` må aldrig deles.

Den, der har adgang, tilføjer nøglen på **serveren**:

```bash
echo "ssh-ed25519 AAAA...resten-af-linjen dit-navn" >> ~/.ssh/authorized_keys
```

Nu kan du logge ind uden password:

```bash
ssh root@DIN-IP
```

### 2. Brug serverens database fra din Mac (SSH-tunnel)

Serverens database er den fælles database. I kopierer den ikke til jeres egne Mac'er. I forbinder til den gennem en krypteret tunnel.

**Terminal 1**, som skal stå åben, mens du arbejder:

```bash
ssh -N -L 5434:127.0.0.1:5432 root@DIN-IP
```

Den skriver ingenting, når den virker. Stop den med `Control + C`.

Din lokale **`.env`**:

```env
DB_HOST=127.0.0.1
DB_PORT=5434
DB_USERNAME=<samme som i serverens .env>
DB_PASSWORD=<samme som i serverens .env>
DB_DATABASE=<samme som i serverens .env>
CORS_ORIGIN=
```

**Terminal 2:**

```bash
npm run start:dev
```

Databaseprogrammer som Postico, TablePlus og pgAdmin forbinder til `127.0.0.1`, port `5434`, mens tunnelen er åben.

> **Pas på:** Det er de rigtige, fælles data. Sletter du noget under udvikling, er det væk for alle. Tag en backup først: `pg_dump -h 127.0.0.1 -p 5434 -U <bruger> -d <database> > backup.sql` (og commit den aldrig).

### 3. Læg din kode på serveren

Se *Når du har ændret noget i koden* ovenfor: push, log ind, og kør `git pull` og `docker compose up -d --build`.

## Nyttige kommandoer

### Docker

```bash
docker compose up -d --build     # byg og start backend + database
docker compose ps                # status
docker compose logs -f backend   # følg backendens log
docker compose logs -f db        # følg databasens log
docker compose restart backend   # genstart kun backenden
docker compose down              # stop og fjern containerne (data bevares)
docker compose down -v           # stop OG slet volumet – sletter al data!
docker compose exec db psql -U mydrtv -d mydrtv   # åbn psql i databasen
```

### Backend

```bash
npm run start:dev    # udvikling med hot reload
npm run build        # byg til dist/
npm run start:prod   # kør den byggede version
npm run lint         # oxlint
npm run format       # prettier
npm run test         # unit-tests
npm run test:e2e     # end-to-end-tests
```

## Hvis noget går galt

Se altid fejlene med `docker compose logs backend`.

| Fejl | Betyder |
|---|---|
| `Mangler DB_PASSWORD i .env` (eller en anden variabel) | `.env` mangler eller er ikke udfyldt i mappen, hvor du kører `docker compose` |
| `relation "movies" does not exist` | Tabellerne er ikke importeret. Se trin 8 |
| `role "..." does not exist` ved import | Forkert `-U`. Brug kommandoen med `$POSTGRES_USER` fra trin 8 |
| Importen skriver ingenting, og `\dt` finder ingen tabeller | `mydrtv.sql` var 0 bytes. Lav dumpet igen, og tjek med `ls -lh` |
| Tunnelen: `bind: Address already in use` | Port 5434 bruges allerede, fx af en tunnel, der stadig er åben. Luk den, eller brug en anden lokal port |
| `password authentication failed for user ...` | Passwordet i `.env` er ændret, efter databasen blev oprettet. Databasen husker det første password. Ret `.env` tilbage, eller slet volumet med `docker compose down -v` (sletter data) |
| `ECONNREFUSED ...:5433` lokalt | Postgres.app kører ikke |
| `port is already allocated` | Noget andet bruger port 3000. Stop det, eller start med `APP_PORT=3001 docker compose up -d` |
| Browseren siger *CORS error* | Frontendens adresse står ikke i `CORS_ORIGIN` |

## Endpoints

| Metode | Route | Beskrivelse |
|---|---|---|
| `GET` | `/` | Sundhedstjek, returnerer `Hello World!` |
| `GET` | `/movies` | Alle film, sorteret alfabetisk efter titel |

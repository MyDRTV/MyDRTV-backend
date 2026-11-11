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
│       └── movie.entity.ts       # Mapper tabellen "movies" til en TypeScript-klasse
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
| `db` | `postgres:18`. Opretter bruger og database første gang ud fra `DB_USERNAME`, `DB_PASSWORD` og `DB_DATABASE` i `.env`. Har **ingen** `ports`, så den kan kun nås af backenden på Dockers interne netværk og ikke fra internettet. Dataen ligger i volumet `postgres_data` og overlever genstart. |

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

```bash
git clone https://github.com/MyDRTV/MyDRTV-backend.git
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

På **serveren**:

```bash
cd ~/MyDRTV-backend
docker compose exec -T db psql -U mydrtv -d mydrtv -v ON_ERROR_STOP=1 < ~/mydrtv.sql
rm ~/mydrtv.sql
```

Brug det brugernavn og databasenavn, du skrev i serverens `.env`.

**9. Test i browseren:** `http://DIN-IP:3000/movies`

**10. Genstart serveren** og tjek, at alt kommer op af sig selv:

```bash
reboot
```

Vent et minut, og åbn `http://DIN-IP:3000/movies` igen.

### Firewall

Opret en firewall i Hetzner-panelet (*Firewalls*), der kun tillader indgående **22** (SSH) og **3000** (backenden). Senere, med domæne og HTTPS: 80 og 443 i stedet for 3000.

Databasen har ingen port udadtil, så den er ikke tilgængelig fra internettet.

> Brug Hetzners firewall frem for `ufw`. Docker åbner selv porte i `iptables` og går uden om `ufw`.

### Når du har ændret noget i koden

Push fra din Mac, og kør så på serveren:

```bash
ssh root@DIN-IP
cd MyDRTV-backend
git pull
docker compose up -d --build
```

`--build` bygger imaget igen, også med nye pakker. Der skal ikke køres `npm install` på serveren. Dataen i databasen bevares.

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
| `password authentication failed for user ...` | Passwordet i `.env` er ændret, efter databasen blev oprettet. Databasen husker det første password. Ret `.env` tilbage, eller slet volumet med `docker compose down -v` (sletter data) |
| `ECONNREFUSED ...:5433` lokalt | Postgres.app kører ikke |
| `port is already allocated` | Noget andet bruger port 3000. Stop det, eller start med `APP_PORT=3001 docker compose up -d` |
| Browseren siger *CORS error* | Frontendens adresse står ikke i `CORS_ORIGIN` |

## Endpoints

| Metode | Route | Beskrivelse |
|---|---|---|
| `GET` | `/` | Sundhedstjek, returnerer `Hello World!` |
| `GET` | `/movies` | Alle film, sorteret alfabetisk efter titel |

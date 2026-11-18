# MyDRTV – backend

Backenden til MyDRTV. Den er bygget med **NestJS** og **TypeORM** og gemmer data i **PostgreSQL**.

Overalt i denne fil står `DIN-IP`. Skift det ud med serverens IP-adresse. Den står ikke i repoet, så spørg i gruppen.

## Overblik

Der er tre steder, og hvert sted har én opgave:

```
 Jeres Mac'er              GitHub                    Hetzner-serveren
 ────────────              ──────                    ────────────────
 skriv kode     ──push──►  gemmer koden    ──deploy──►  Docker kører siden
 npm run start:dev         (MyDRTV-backend,             backend + db + web + nginx
 (ingen Docker)             MyDRTV-frontend-web)        offentlig på http://IP
```

- **Mac'en** er jeres værksted. I skriver og tester koden her med `npm run start:dev`, som genindlæser automatisk. Docker skal ikke bruges.
- **GitHub** er det fælles lager for koden. Det, der ligger på `main`, er det, der skal være live.
- **Hetzner** er udstillingsvinduet. Docker kører fire containere: backend, database, web og nginx. Docker er kun til serveren, så den kan starte det hele ens hver gang.

Alle kan se siden på `http://DIN-IP`, også uden login. SSH-nøgler giver kun adgang til at styre serveren og til databasen.

## Sådan arbejder du

1. Start SSH-tunnelen til databasen, og kør `npm run start:dev` (se *Kom i gang på din Mac*).
2. Skriv og test din kode lokalt på http://localhost:3000.
3. Commit og push til GitHub.
4. Når det er på `main`, går det automatisk live på serveren (se *Læg ændringer på serveren*).

Du skal ikke bygge noget eller bruge Docker på din egen Mac.

## Kom i gang på din Mac

Du skal bruge Node.js og en SSH-nøgle, som er lagt på serveren (se *Adgang til serveren*).

### 1. Installér pakkerne

```bash
npm install
```

### 2. Lav din `.env`

```bash
cp .env.example .env
```

Udfyld den. Brugernavn og password er app-kontoens (se *To konti i databasen*), og databasenavnet er det samme som på serveren. Spørg i gruppen, og del dem aldrig i git.

```env
DB_HOST=127.0.0.1
DB_PORT=5434
DB_USERNAME=mydrtv_app
DB_PASSWORD=...
DB_DATABASE=...
CORS_ORIGIN=
```

### 3. Åbn tunnelen til databasen

Vi har én fælles database, og den ligger på serveren. I kopierer den ikke til jeres egne Mac'er. I forbinder til den gennem en krypteret SSH-tunnel.

Åbn en terminal, og lad den stå åben, mens du arbejder:

```bash
ssh -N -L 5434:127.0.0.1:5432 root@DIN-IP
```

Den skriver ingenting, når den virker. Stop den med `Control + C`.

Tunnelen gør, at port `5434` på din Mac fører til databasen på serveren. Databaseprogrammer som Postico, TablePlus og pgAdmin kan også forbinde til `127.0.0.1`, port `5434`, mens tunnelen er åben.

> **Pas på:** Det er de rigtige, fælles data. Sletter du noget, er det væk for alle. Tag en backup først, hvis du er i tvivl: `pg_dump -h 127.0.0.1 -p 5434 -U <bruger> -d <database> > backup.sql`. Commit den aldrig.

### 4. Start backenden

Åbn en ny terminal:

```bash
npm run start:dev
```

Tjek, at det virker:

- http://localhost:3000 viser `Hello World!`
- http://localhost:3000/movies viser en liste over film

### Se og ret data med pgAdmin

pgAdmin er et program til at se og rette i databasen. Tunnelen fra trin 3 skal være åben imens. Postgres.app skal ikke bruges: den er en database på din egen Mac og kender ikke den fælles.

1. Højreklik på **Servers → Register → Server**.
2. Fanen *General*: giv den et navn, fx `MyDRTV`.
3. Fanen *Connection*: host `127.0.0.1`, port `5434`, databasenavnet fra din `.env`, og brugernavn og password for den konto, du vil bruge (se *To konti i databasen*). Lad fanen *SSH Tunnel* være tom.
4. Højreklik på databasen → **Query Tool**, skriv din SQL, og tryk `F5`.

```sql
SELECT * FROM genres;
```

`genre_pk` har en regel for, hvordan nøglen må se ud, så en fri tekst bliver afvist. Lad databasen lave nøglen:

```sql
INSERT INTO genres (genre_pk, genre_name)
VALUES (replace(gen_random_uuid()::text, '-', ''), 'Dokumentar');
```

### Ny kolonne kræver to trin

TypeORM ændrer aldrig databasen selv (`synchronize` er `false`). En ny kolonne skal derfor laves begge steder:

1. Kør `ALTER TABLE ... ADD COLUMN ...` i den fælles database.
2. Tilføj kolonnen i entity-filen, og push.

Mangler trin 1, fejler backenden med `column ... does not exist`. Ændringen i databasen rammer alle og det kørende site med det samme, så sig det i gruppen først.

### To konti i databasen

Databasen har to konti, så backenden ikke kan mere, end den skal:

| Konto | Bruges af | Må |
|---|---|---|
| `mydrtv_app` | Backenden (`DB_USERNAME` i `.env`) | Læse og skrive rækker |
| Superbrugeren | Jer i pgAdmin (`POSTGRES_USER` i serverens `.env`) | Alt, også oprette og ændre tabeller |

App-kontoen er oprettet med denne SQL, kørt som superbrugeren:

```sql
CREATE ROLE mydrtv_app LOGIN PASSWORD '...';

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mydrtv_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mydrtv_app;
```

Den sidste sætning giver app-kontoen adgang til tabeller, som superbrugeren opretter senere. Opret derfor altid nye tabeller som superbrugeren.

Lav to forbindelser i pgAdmin, én for hver konto. Et Query Tool hører til den forbindelse, du åbnede det fra. Test app-kontoen fra dens egen forbindelse:

```sql
SELECT current_user;             -- skal vise mydrtv_app
SELECT * FROM genres;            -- skal vise de samme rækker som hos superbrugeren
CREATE TABLE test (id int);      -- skal fejle: permission denied
```

## Adgang til serveren

Hver i gruppen har sin egen SSH-nøgle, så I ikke behøver dele root-koden.

På **din Mac**, én gang:

```bash
ssh-keygen -t ed25519 -C "dit-navn"   # tryk Enter til alle spørgsmål
cat ~/.ssh/id_ed25519.pub            # kopiér hele linjen
```

Send linjen til den, der har adgang til serveren. Det er den **offentlige** nøgle, så den er ufarlig at dele. Filen uden `.pub` må aldrig deles.

Den, der har adgang, tilføjer linjen på **serveren**:

```bash
echo "ssh-ed25519 AAAA...resten-af-linjen dit-navn" >> ~/.ssh/authorized_keys
```

Nu kan du logge ind uden password:

```bash
ssh root@DIN-IP
```

> **Hvor er jeg?** Står der `root@ubuntu-...` i prompten, er du på serveren. Står dit eget navn der, er du på din Mac.

## Læg ændringer på serveren

Når nogen pusher til `main` i backend-repoet, lægger GitHub selv den nye kode på serveren. Det tager 1–2 minutter. Under fanen **Actions** på GitHub kan du følge med, og et grønt flueben betyder, at det er live.

Det styres af én fil, `.github/workflows/deploy.yml`. Først tjekker den koden (CI). Er alt grønt, logger den ind på serveren, kører `git pull` i begge repos og derefter `docker compose up -d --build` (CD). Dataen i databasen bevares.

Tjekkene kører i denne rækkefølge. Fejler ét af dem, får du et rødt kryds, og intet bliver lagt ud:

| Trin | Hvad det gør | Hvad det fanger |
|---|---|---|
| `npm ci` | Installerer præcis de pakker, der står i `package-lock.json` | Pakker, der mangler i `package.json` |
| `npm run lint` | Læser koden uden at køre den | Sjusk som ubrugte imports og et glemt `await` |
| `npm test` | Kører alle tests i filer, der ender på `.spec.ts` | Kode, der kører, men gør noget forkert |
| `npm run build` | Oversætter TypeScript til JavaScript | Typefejl og imports af filer, der ikke findes |

Kør de tre sidste på din egen Mac, før du pusher, så slipper du for at vente på GitHub.

> Ændringer i websitet (`MyDRTV-frontend-web`) kommer med ved næste push til backenden.

### Opsætning (engangsjob)

**1. Lav en nøgle til GitHub på din Mac:**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mydrtv_deploy -N "" -C "github-deploy"
cat ~/.ssh/mydrtv_deploy.pub
```

**2. Læg den offentlige nøgle på serveren** (log ind med `ssh root@DIN-IP`):

```bash
echo "LINJEN-FRA-mydrtv_deploy.pub" >> ~/.ssh/authorized_keys
```

**3. Gem to Secrets på GitHub.** Repoet → **Settings → Secrets and variables → Actions → New repository secret**:

| Navn | Værdi |
|---|---|
| `SSH_HOST` | Serverens IP |
| `SSH_KEY` | Hele outputtet af `cat ~/.ssh/mydrtv_deploy` (den private nøgle, uden `.pub`) |

Slet derefter den private nøgle fra din Mac med `rm ~/.ssh/mydrtv_deploy`.

**4. Push til `main`**, og tjek fanen Actions.

## Sådan hænger serveren sammen

Udefra er der kun én indgang: nginx på port 80. Den sender trafikken videre til den rigtige container.

```
Browser / Expo-app  →  http://DIN-IP  (port 80)
                          nginx
                          ├─ /api/...  → backend:3000  (/api fjernes: /api/movies → /movies)
                          │                └─ db:5432
                          └─ /...      → web:3000  (Next.js)
```

Backenden og databasen kan ikke nås direkte fra internettet. De er kun bundet til `127.0.0.1` på serveren.

| Hvem | Kalder backenden på |
|---|---|
| Next.js i browseren | `/api/movies` |
| Next.js på serveren (Server Components) | `http://backend:3000/movies` (env `API_URL`) |
| Expo-appen | `http://DIN-IP/api/movies` (env `EXPO_PUBLIC_API_URL`) |

Ingen af dem har brug for CORS: browseren kalder samme adresse, som siden kommer fra, og server og app er ikke browsere. CORS bruges kun lokalt, hvor Next.js kører på `:3001` og backenden på `:3000`.

## Kodens opbygning

```
MyDRTV-backend/
├── src/
│   ├── main.ts               # Starter appen på PORT (standard 3000) og slår CORS til
│   ├── app.module.ts         # Rodmodulet: læser .env og forbinder til databasen
│   ├── app.controller.ts     # GET /  → "Hello World!"
│   ├── app.service.ts
│   ├── movies/               # Alt om film
│   │   ├── movies.module.ts
│   │   ├── movies.controller.ts  # Routes: GET /movies
│   │   ├── movies.service.ts     # Logik og databasekald
│   │   ├── entity/movie.entity.ts    # Tabellen "movies" som en TypeScript-klasse
│   │   └── dto/create-movie.dto.ts   # Formen på data, når en film oprettes
│   ├── genres/               # Samme opbygning som movies
│   ├── ratings/              # Samme opbygning som movies
│   ├── users/                # Samme opbygning som movies
│   ├── watchlist/            # Samme opbygning som movies
│   ├── auth/                 # Login, guards og roller (ikke skrevet endnu)
│   └── database/             # Data-source og seed (ikke skrevet endnu)
├── test/                     # End-to-end-tests
├── nginx/default.conf        # nginx' regler: /api til backenden, resten til web
├── .github/workflows/deploy.yml  # Automatisk deploy ved push til main
├── Dockerfile                # Opskriften på backendens image
├── docker-compose.yml        # Starter alle fire containere på serveren
├── .env.example              # Skabelon til .env
└── package.json
```

De små konfigurationsfiler i roden (`tsconfig*.json`, `nest-cli.json`, `jest.config.ts`, `.oxlintrc.json`, `.prettierrc`) fulgte med, da projektet blev oprettet med Nest. De styrer TypeScript, tests, lint og formatering, og I skal sjældent røre dem.

### Lagene i et modul

Hver feature, fx `movies`, er sit eget modul med tre lag:

1. **Controller** tager imod HTTP-requesten og kalder servicen.
2. **Service** indeholder logikken og taler med databasen gennem et TypeORM-`Repository<Movie>`.
3. **Entity** beskriver tabellen og dens kolonner.

```
HTTP → MoviesController → MoviesService → Repository<Movie> → PostgreSQL
```

Nye features laves på samme måde: `nest g resource <navn>`, en entity, og modulet importeres i `AppModule`.

> Et modul virker først, når det står under `imports` i `app.module.ts`. Lige nu er kun `MoviesModule` importeret, så de andre modulers routes svarer ikke endnu.

## Docker på serveren

Docker gør, at serveren ikke skal have Node eller PostgreSQL installeret. Alt kører i containere, som starter ens hver gang.

- **`Dockerfile`** er opskriften på backenden: installér pakker, byg TypeScript til `dist/`, og start med `node dist/main.js`.
- **`docker-compose.yml`** starter de fire containere og forbinder dem:

| Container | Hvad den gør |
|---|---|
| `backend` | NestJS, bygget fra `Dockerfile`. Starter først, når databasen er klar. |
| `db` | PostgreSQL 18. Dataen ligger i volumet `postgres_data` og overlever genstart. |
| `web` | Next.js, bygget fra `../MyDRTV-frontend-web`. |
| `nginx` | Den eneste indgang udefra, på port 80. |

Alle har `restart: unless-stopped`, så de starter igen af sig selv, når serveren genstartes.

> **Hvorfor `db` og ikke `localhost`?** Inde i en container betyder `localhost` containeren selv. Containerne finder hinanden på deres navn, så backenden når databasen på `db:5432`. Derfor sætter compose selv `DB_HOST` og `DB_PORT`.

`.dockerignore` holder `node_modules`, `dist` og `.env` ude af imaget, så adgangsoplysninger aldrig ligger i det.

## Opsætning af serveren (engangsjob)

Det her er allerede gjort. Det står her, hvis serveren en dag skal sættes op igen.

**1. Log ind, og installér Docker og git**

```bash
ssh root@DIN-IP
curl -fsSL https://get.docker.com | sh
apt install -y git
docker compose version
```

**2. Hent koden.** Backend og web skal ligge ved siden af hinanden:

```bash
git clone https://github.com/MyDRTV/MyDRTV-backend.git
git clone https://github.com/MyDRTV/MyDRTV-frontend-web.git
cd MyDRTV-backend
```

**3. Lav serverens `.env`**

```bash
cp .env.example .env
nano .env
```

```env
POSTGRES_USER=...
POSTGRES_PASSWORD=ET-LANGT-TILFÆLDIGT-PASSWORD
DB_USERNAME=mydrtv_app
DB_PASSWORD=ET-ANDET-LANGT-PASSWORD
DB_DATABASE=...
CORS_ORIGIN=
```

`POSTGRES_USER` og `POSTGRES_PASSWORD` er superbrugeren, som databasen oprettes med første gang. `DB_USERNAME` og `DB_PASSWORD` er app-kontoen, som backenden logger ind med. `DB_HOST` og `DB_PORT` skal ikke stå her, for compose sætter dem selv.

Gem med `Control+O`, `Enter`, `Control+X`. Skift ikke `POSTGRES_PASSWORD` bagefter (se *Hvis noget går galt*).

**4. Start det hele**

```bash
docker compose up -d --build
docker compose ps
```

Alle fire skal stå som `running`, og `db` som `healthy`. Backenden kan først logge ind, når app-kontoen er oprettet i trin 6.

**5. Læg data i databasen.** TypeORM opretter ikke tabeller selv (`synchronize` er `false`), så tabeller og data skal ind fra et dump af den fælles database.

På **den gamle server**, mens den stadig kører:

```bash
cd ~/MyDRTV-backend
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' > ~/mydrtv.sql
ls -lh ~/mydrtv.sql          # må ikke være 0 bytes
```

På **din Mac** flytter du filen fra den gamle server til den nye:

```bash
scp root@GAMMEL-IP:~/mydrtv.sql .
scp mydrtv.sql root@DIN-IP:~/
rm mydrtv.sql
```

På **den nye server**:

```bash
ls -lh ~/mydrtv.sql
cd ~/MyDRTV-backend
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1' < ~/mydrtv.sql
rm ~/mydrtv.sql
```

En vellykket import skriver linjer som `CREATE TABLE` og `COPY 20`. Dumpet indeholder tabellen `users`, så det må aldrig committes.

**6. Opret app-kontoen.** Åbn tunnelen, log ind i pgAdmin som superbrugeren, og kør SQL'en fra *To konti i databasen* med samme password som `DB_PASSWORD` i serverens `.env`.

**7. Test** `http://DIN-IP` og `http://DIN-IP/api/movies`. Kør `reboot`, vent et minut, og tjek, at siden kommer op igen af sig selv.

### Firewall

Opret en firewall i Hetzner-panelet under *Firewalls*, der kun tillader indgående **22** (SSH) og **80** (websitet). Brug Hetzners firewall frem for `ufw`, fordi Docker går uden om `ufw`.

## Nyttige kommandoer

På din Mac:

```bash
npm run start:dev    # udvikling, genindlæser automatisk
npm run lint         # find fejl i koden (oxlint)
npm run format       # ret formateringen (prettier)
npm run test         # unit-tests
npm run test:e2e     # end-to-end-tests
```

På serveren, i `~/MyDRTV-backend`:

```bash
docker compose ps                # status
docker compose logs -f backend   # følg backendens log
docker compose restart backend   # genstart kun backenden
docker compose down              # stop containerne (data bevares)
docker compose down -v           # stop OG slet al data – pas på!
```

## Hvis noget går galt

På serveren ser du fejlene med `docker compose logs backend`.

| Fejl | Det betyder |
|---|---|
| `ECONNREFUSED 127.0.0.1:5434` lokalt | Tunnelen er ikke åben. Start den (se trin 3 under *Kom i gang*) |
| Tunnelen: `bind: Address already in use` | En anden tunnel er allerede åben på 5434. Luk den først |
| `Mangler DB_PASSWORD i .env` (eller en anden variabel) | `.env` mangler linjen i mappen, hvor du kører `docker compose` |
| `relation "movies" does not exist` | Tabellerne er ikke importeret. Se trin 5 under *Opsætning af serveren* |
| `password authentication failed` | Passwordet i `.env` passer ikke med databasen. `POSTGRES_PASSWORD` kan ikke ændres, efter databasen er oprettet, så sæt det gamle tilbage. App-kontoens rettes med `ALTER ROLE mydrtv_app PASSWORD '...';` |
| `permission denied for table ...` | App-kontoen mangler adgang til tabellen. Kør `GRANT`-sætningen fra *To konti i databasen* som superbrugeren |
| `port is already allocated` | Noget andet bruger porten. Stop det først |

## Endpoints

| Metode | Route | Beskrivelse |
|---|---|---|
| `GET` | `/` | Sundhedstjek, returnerer `Hello World!` |
| `GET` | `/movies` | Alle film, sorteret efter titel |

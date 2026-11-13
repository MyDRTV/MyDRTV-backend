# Kommandoer

Alle de kommandoer, vi har kørt for at sætte MyDRTV op, og hvad de gjorde. De står i den rækkefølge, de blev kørt.

`DIN-IP` er serverens IP-adresse. Den står ikke her med vilje.

**Hvor køres den?** Hver kommando er mærket med, hvor den køres:
- 💻 **Mac**: din egen terminal. Prompten viser dit eget navn.
- 🖥️ **Server**: Hetzner-serveren, efter `ssh root@DIN-IP`. Prompten viser `root@ubuntu-...`.

---

## 1. Projektet oprettes (Mac)

| Kommando | Hvad den gør |
|---|---|
| 💻 `nest new MyDRTV-backend` | Opretter et nyt NestJS-projekt med mappestruktur, TypeScript, Jest, lint og formatering |
| 💻 `npm install @nestjs/typeorm typeorm pg @nestjs/config` | Installerer TypeORM (taler med databasen), driveren til PostgreSQL og config-modulet, der læser `.env` |
| 💻 `npm run start:dev` | Starter backenden lokalt. Den genstarter selv, når koden ændres |
| 💻 `git add .` → `git commit -m "..."` → `git push` | Gemmer ændringerne i git og sender dem til GitHub |

## 2. Log ind på serveren

| Kommando | Hvad den gør |
|---|---|
| 💻 `ssh root@DIN-IP` | Logger ind på serveren som `root` (administrator). Root-koden blev nulstillet i Hetzner-panelet: *Rescue → Reset root password* |
| 🖥️ `exit` | Logger ud af serveren og tilbage til Mac'en |

## 3. Installér Docker og git på serveren

| Kommando | Hvad den gør |
|---|---|
| 🖥️ `curl -fsSL https://get.docker.com \| sh` | Henter og kører Dockers officielle installationsscript. Installerer Docker og Docker Compose |
| 🖥️ `apt install -y git` | Installerer git, så serveren kan hente koden fra GitHub |
| 🖥️ `docker compose version` | Tjekker, at Docker Compose er installeret |

Node.js og PostgreSQL er **ikke** installeret på serveren. De kører inde i Docker-containere.

## 4. Hent koden til serveren

| Kommando | Hvad den gør |
|---|---|
| 🖥️ `git clone https://github.com/MyDRTV/MyDRTV-backend.git` | Kopierer backend-repoet ned på serveren |
| 🖥️ `git clone https://github.com/MyDRTV/MyDRTV-frontend-web.git` | Kopierer website-repoet ned ved siden af. `docker-compose.yml` bygger websitet fra `../MyDRTV-frontend-web` |
| 🖥️ `cd MyDRTV-backend` | Går ind i backend-mappen. Alle `docker compose`-kommandoer køres herfra |

## 5. Lav serverens `.env`

| Kommando | Hvad den gør |
|---|---|
| 🖥️ `cp .env.example .env` | Kopierer skabelonen til en rigtig `.env`-fil |
| 🖥️ `nano .env` | Åbner filen i teksteditoren nano. Her skrives databasens brugernavn, password og navn. Gem med `Control+O`, `Enter`, `Control+X` |

`.env` er i `.gitignore` og `.dockerignore`, så passwords aldrig kommer i git eller i et Docker-image.

## 6. Start containerne

| Kommando | Hvad den gør |
|---|---|
| 🖥️ `docker compose up -d --build` | Bygger images ud fra `Dockerfile` og starter alle containere (backend, db, web, nginx). `-d` kører dem i baggrunden, og `--build` bygger på ny ud fra den nyeste kode |
| 🖥️ `docker compose ps` | Viser containerne og deres status (`running`, `healthy`) |
| 🖥️ `docker compose logs -f backend` | Følger backendens log live. Stop med `Control+C` |

## 7. Flyt data fra Mac'en til serveren

Databasen på serveren startede tom. Tabeller og data blev kopieret fra den lokale database (Postgres.app).

| Kommando | Hvad den gør |
|---|---|
| 💻 `pg_dump -h 127.0.0.1 -p 5433 -U postgres -d postgres --no-owner --no-privileges > mydrtv.sql` | Gemmer hele den lokale database (tabeller og data) som SQL i filen `mydrtv.sql` |
| 💻 `ls -lh mydrtv.sql` | Viser filens størrelse. Den må ikke være 0 bytes |
| 💻 `scp mydrtv.sql root@DIN-IP:~/` | Kopierer filen fra Mac'en til serveren over SSH |
| 💻 `rm mydrtv.sql` | Sletter filen på Mac'en. Den indeholder brugerdata og må ikke ende i git |
| 🖥️ `docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ~/mydrtv.sql` | Kører SQL-filen inde i database-containeren, så tabeller og data bliver oprettet |
| 🖥️ `rm ~/mydrtv.sql` | Sletter filen på serveren igen |

Første forsøg importerede en tom fil, fordi `>` tømmer filen, før `pg_dump` kører, også når kommandoen fejler. Derfor tjekkes størrelsen med `ls -lh`.

## 8. Test

| Kommando / adresse | Hvad den viser |
|---|---|
| `http://DIN-IP` | Websitet (Next.js) via nginx |
| `http://DIN-IP/api/movies` | Backendens film som JSON via nginx |
| 🖥️ `reboot` | Genstarter serveren for at tjekke, at containerne starter af sig selv (`restart: unless-stopped`) |

## 9. SSH-nøgler til gruppen

| Kommando | Hvad den gør |
|---|---|
| 💻 `ssh-keygen -t ed25519 -C "dit-navn"` | Laver et nøglepar: en privat nøgle (bliver på Mac'en) og en offentlig (`.pub`) |
| 💻 `cat ~/.ssh/id_ed25519.pub` | Viser den offentlige nøgle, så den kan sendes til den, der har adgang til serveren |
| 🖥️ `echo "ssh-ed25519 AAAA... navn" >> ~/.ssh/authorized_keys` | Giver nøglen adgang til serveren. `>>` tilføjer en linje, mens `>` ville overskrive filen og slette de andre nøgler |
| 🖥️ `cat ~/.ssh/authorized_keys` | Viser, hvilke nøgler der har adgang |

## 10. SSH-tunnel til den fælles database

| Kommando | Hvad den gør |
|---|---|
| 💻 `ssh -N -L 5434:127.0.0.1:5432 root@DIN-IP` | Åbner en krypteret tunnel: port 5434 på Mac'en fører til databasen på serveren. Databasen er ikke åben mod internettet, så det er den eneste vej ind. `-N` betyder, at der ikke åbnes en terminal på serveren |

## 11. Automatisk deploy med GitHub Actions (CI/CD)

| Kommando | Hvad den gør |
|---|---|
| 💻 `ssh-keygen -t ed25519 -f ~/.ssh/mydrtv_deploy -N "" -C "github-deploy"` | Laver et nøglepar kun til GitHub. `-N ""` betyder ingen adgangskode, så GitHub kan bruge den uden et menneske |
| 💻 `cat ~/.ssh/mydrtv_deploy.pub` | Viser den offentlige nøgle |
| 🖥️ `echo "ssh-ed25519 AAAA... github-deploy" >> ~/.ssh/authorized_keys` | Giver GitHub adgang til serveren |
| 💻 `cat ~/.ssh/mydrtv_deploy` | Viser den private nøgle, som gemmes som Secret `SSH_KEY` på GitHub (sammen med `SSH_HOST`) |
| 💻 `rm ~/.ssh/mydrtv_deploy` | Sletter den private nøgle på Mac'en. Den skal kun ligge på GitHub |
| 💻 `git push` | Et push til `main` starter nu `.github/workflows/deploy.yml`, som logger ind på serveren og kører `git pull` og `docker compose up -d --build` |
| 💻 `git pull --rebase` | Henter de andres commits og lægger mine ovenpå, når GitHub afviser et push, fordi der er kommet nyt |

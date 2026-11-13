# Kommandoer

De kommandoer, vi har brugt til at sætte MyDRTV op, i den rækkefølge de blev kørt. `DIN-IP` er serverens IP-adresse.

## 1. Projektet (Mac)

```bash
nest new MyDRTV-backend                                   # opret NestJS-projektet
npm install @nestjs/typeorm typeorm pg @nestjs/config     # database og .env
npm run start:dev                                         # start backenden lokalt
```

## 2. Serveren (på serveren)

```bash
ssh root@DIN-IP                                           # log ind (fra Mac)
curl -fsSL https://get.docker.com | sh                    # installér Docker
apt install -y git                                        # installér git
git clone https://github.com/MyDRTV/MyDRTV-backend.git    # hent backend
git clone https://github.com/MyDRTV/MyDRTV-frontend-web.git   # hent website
cd MyDRTV-backend
cp .env.example .env                                      # lav .env
nano .env                                                 # udfyld .env
docker compose up -d --build                              # byg og start containerne
docker compose ps                                         # se status
docker compose logs -f backend                            # se backendens log
```

## 3. Data fra Mac til server

På Mac:

```bash
pg_dump -h 127.0.0.1 -p 5433 -U postgres -d postgres --no-owner --no-privileges > mydrtv.sql
scp mydrtv.sql root@DIN-IP:~/                             # kopiér til serveren
rm mydrtv.sql                                             # slet lokalt
```

På serveren:

```bash
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ~/mydrtv.sql
rm ~/mydrtv.sql
```

## 4. SSH-nøgler

```bash
ssh-keygen -t ed25519                                     # lav nøgle (Mac)
cat ~/.ssh/id_ed25519.pub                                 # vis offentlig nøgle (Mac)
echo "ssh-ed25519 AAAA..." >> ~/.ssh/authorized_keys      # giv adgang (server)
ssh -N -L 5434:127.0.0.1:5432 root@DIN-IP                 # tunnel til databasen (Mac)
```

## 5. Automatisk deploy med GitHub Actions

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mydrtv_deploy -N ""       # nøgle til GitHub (Mac)
echo "ssh-ed25519 AAAA..." >> ~/.ssh/authorized_keys      # giv GitHub adgang (server)
gh secret set SSH_KEY < ~/.ssh/mydrtv_deploy              # gem privat nøgle på GitHub (Mac)
rm ~/.ssh/mydrtv_deploy                                   # slet privat nøgle (Mac)
git push                                                  # starter deploy
gh run list                                               # se om deploy lykkedes
gh run view <id> --log                                    # se log fra en kørsel
gh run rerun <id>                                         # kør en fejlet kørsel igen
```

Fejl undervejs: `error in libcrypto` betød, at den private nøgle var kopieret forkert ind på GitHub. Løst med `gh secret set`, som tager filen direkte.

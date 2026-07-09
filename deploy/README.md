# Hetzner Production Deployment

## Portlar (TTEN Games ile çakışmaz)

| Servis   | Host port | Domain                      |
|----------|-----------|-----------------------------|
| Frontend | 3100      | emrekilic.web.tr            |
| Admin    | 3101      | admin.emrekilic.web.tr      |
| API      | 3102      | api.emrekilic.web.tr         |
| Postgres | 5433      | (yalnızca localhost)        |
| Redis    | 6380      | (yalnızca localhost)        |

## Sunucu kurulumu

```bash
# 1. Repoyu klonla
git clone <repo-url> /opt/portfolio
cd /opt/portfolio

# 2. Ortam dosyasını oluştur
cp deploy/.env.production.example deploy/.env
nano deploy/.env   # JWT_SECRET, DATABASE_PASSWORD, Google OAuth vb.

# 3. İlk deploy
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# 4. Nginx — TTEN ile aynı sunucudaysa (Hetzner)
#    80/443 ttengamesstudio-nginx container'ında; host nginx KULLANMAYIN.
sudo bash deploy/ttengames/install-nginx.sh
# Detay: deploy/ttengames/README.md
```

## GitHub Actions secrets

| Secret            | Açıklama                          |
|-------------------|-----------------------------------|
| `SSH_HOST`        | Hetzner sunucu IP veya hostname   |
| `SSH_USER`        | SSH kullanıcı adı                 |
| `SSH_PRIVATE_KEY` | Deploy SSH private key              |
| `SSH_PORT`        | SSH portu (varsayılan 22)         |
| `DEPLOY_PATH`     | Örn. `/opt/portfolio`             |

`main` branch'e push yapıldığında otomatik build ve deploy çalışır.

Deploy artık sunucuda `git pull` yapmaz — dosyalar GitHub Actions runner'dan SCP ile kopyalanır. Böylece sunucunun `github.com` DNS erişimi gerekmez.

## Sorun giderme

### `ssh: unexpected packet in response to channel open` (drone-scp)

`appleboy/scp-action` bazı sunucularda SSH kanal hatası verir. Workflow artık runner üzerinde `tar` + yerel `scp` kullanır.

### `Could not resolve host: github.com` (sunucuda git fetch)

Eski workflow sunucuda `git fetch` yapıyordu. Güncel workflow SCP kullanır. Hâlâ manuel git kullanıyorsan sunucuda DNS ayarla:

```bash
sudo nano /etc/resolv.conf
# nameserver 1.1.1.1
# nameserver 8.8.8.8
```

Kalıcı (systemd-resolved):

```bash
sudo mkdir -p /etc/systemd/resolved.conf.d
echo -e "[Resolve]\nDNS=1.1.1.1 8.8.8.8" | sudo tee /etc/systemd/resolved.conf.d/dns.conf
sudo systemctl restart systemd-resolved
```

### TTEN Games deploy sırasında çöküyor

Aynı sunucuda Docker build tüm RAM/CPU'yu tüketebilir. `deploy.sh` artık servisleri **sırayla** build eder (`COMPOSE_PARALLEL_LIMIT=1`).

Kontrol et:

```bash
# Port çakışması olmamalı — portfolio 3100-3102, TTEN 3000/4000
ss -tlnp | grep -E '3000|3100|4000|5432|5433|6379|6380'

# deploy/.env portları
grep HOST_PORT deploy/.env
```

TTEN container'ları:

```bash
docker ps | grep -v portfolio
```

### SSH deploy timeout

Docker build uzun sürebilir. Workflow `command_timeout: 45m` kullanır. İlk deploy en uzun olanıdır.

## Cloudflare DNS kayıtları

Aynı sunucu IP'sine gidebilir — Nginx domain'e göre ayırır.

| Tip | Ad | Hedef | Proxy |
|-----|-----|-------|-------|
| A | `@` | Sunucu IP | Proxied |
| A | `admin` | Sunucu IP | Proxied |
| A | `api` | Sunucu IP | Proxied |

**Önemli:** `api` subdomain'i şart (health check ve backend için). `ap` değil, `api`.

### Port 80/443 zaten kullanımda (`Address already in use`)

TTEN Games zaten 80/443'ü dinliyorsa **ikinci bir host nginx başlatılamaz**. Portfolio config'lerini mevcut (aktif) nginx'e eklemeniz gerekir.

```bash
cd /opt/portfolio

# Script var mı? (yoksa: git pull veya GitHub Actions deploy bekleyin)
ls -la deploy/setup-shared-nginx.sh
chmod +x deploy/setup-shared-nginx.sh deploy/setup-nginx.sh

# 80/443'ü kim dinliyor?
sudo ss -tlnp | grep -E ':80|:443'
docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E '80|443'

# Paylaşılan nginx kurulumu
sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-shared-nginx.sh

# Docker nginx container adını biliyorsanız (ör. tten-nginx):
sudo NGINX_CONTAINER=tten-nginx CERTBOT_EMAIL=senin@email.com ./deploy/setup-shared-nginx.sh
```

Config'ler varsayılan olarak `/etc/nginx/conf.d/portfolio/` altına kopyalanır. **Aktif nginx** (çoğunlukla Docker içindeki) bu dizini include etmeli:

```nginx
include /etc/nginx/conf.d/portfolio/*.conf;
```

Docker nginx host'taki `/etc/nginx` veya `conf.d` dizinini volume olarak mount ediyorsa include zaten çalışır. Mount farklı bir dizinse:

```bash
# Örnek: TTEN nginx config volume'u
docker inspect <nginx_container> --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'

# Config'leri o dizine kopyalayın
sudo NGINX_CONF_DIR=/yol/conf.d/portfolio CERTBOT_EMAIL=... ./deploy/setup-shared-nginx.sh
```

Son adım — aktif nginx'i reload:

```bash
docker exec <nginx_container> nginx -t
docker exec <nginx_container> nginx -s reload
```

`./deploy/setup-nginx.sh: command not found` görürseniz dosya deploy edilmemiş veya satır sonu bozuksa:

```bash
ls -la deploy/*.sh deploy/ttengames/
sed -i 's/\r$//' deploy/setup-nginx.sh deploy/setup-shared-nginx.sh deploy/ttengames/install-nginx.sh
chmod +x deploy/setup-nginx.sh deploy/setup-shared-nginx.sh deploy/ttengames/install-nginx.sh
```

### ttengamesstudio.com.tr `/_nuxt` 404 / MIME text/html

**Sebep:** Portfolio `docker-compose.prod.yml` içinde `ttengames` ağına `frontend` servis adıyla bağlanınca TTEN nginx upstream'i (`frontend:3000`) portfolio Next.js'e gider. HTML TTEN'den gelir gibi görünür ama `/_nuxt/*` istekleri portfolio'dan 404 HTML döner.

**Çözüm (sunucu):**

```bash
cd /opt/portfolio
git fetch origin
git checkout origin/main -- docker-compose.prod.yml deploy/sync-tten-nginx.sh deploy/fix-tten-dns.sh \
  deploy/ttengames/https/portfolio.conf.template deploy/ttengames/http/portfolio.conf.template \
  deploy/ttengames/install-nginx.sh
chmod +x deploy/fix-tten-dns.sh deploy/sync-tten-nginx.sh
bash deploy/fix-tten-dns.sh
```

Doğrulama:

```bash
docker exec ttengamesstudio-nginx getent hosts frontend
# ttengamesstudio-frontend IP'si olmalı, portfolio-prod-frontend DEĞİL
```

### ttengamesstudio.com.tr portfolio gösteriyorsa

**Sebep:** `ttengamesstudio-nginx` portfolio Docker ağına bağlandığında her iki projede de service adı `frontend` olduğu için TTEN'in `frontend:3000` upstream'i yanlışlıkla `portfolio-prod-frontend`'e gider.

**Acil düzeltme:**

```bash
# 1) Portfolio ağından ayır (TTEN hemen düzelir)
docker network disconnect portfolio-prod_portfolio ttengamesstudio-nginx
docker restart ttengamesstudio-nginx

# 2) TTEN geri geldi mi?
curl -s -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -5
```

**Portfolio için güvenli yol** — network modu yerine host gateway:

TTEN `docker-compose.yml` → nginx servisine ekle:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Sonra:

```bash
cd /opt/portfolio
sudo PORTFOLIO_MODE=host PORTFOLIO_HOST=host.docker.internal ./deploy/ttengames/install-nginx.sh http

docker exec ttengamesstudio-nginx wget -qO- http://host.docker.internal:3100/tr | head -3
curl -I -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr
curl -s -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -3
```

`host.docker.internal` çalışmazsa TTEN nginx upstream'lerini tam container adına çevirin (`ttengamesstudio-frontend:3000`), ardından `PORTFOLIO_MODE=network` kullanılabilir.

### TTEN Games ile aynı sunucu (`ttengamesstudio-nginx`)

80/443 `ttengamesstudio-nginx` container'ında. Mount'lar:

| Host | Container |
|------|-----------|
| `/opt/ttengamesstudio/docker/nginx/templates` | `/etc/nginx/templates` |
| `/var/www/certbot` | `/var/www/certbot` |
| `/etc/letsencrypt` | `/etc/letsencrypt` |

Portfolio config'leri **templates** dizinine `.conf.template` olarak eklenir.

**Önerilen:** Host gateway modu (TTEN DNS'ini bozmaz). Önce TTEN compose'a `extra_hosts` ekleyin:

```bash
cd /opt/portfolio
chmod +x deploy/ttengames/install-nginx.sh

# 1) HTTP
sudo PORTFOLIO_MODE=host PORTFOLIO_HOST=host.docker.internal ./deploy/ttengames/install-nginx.sh http

curl -I -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr
curl -s -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -3

# 2) Let's Encrypt (Cloudflare hata verirse DNS only yapın)
sudo certbot certonly --webroot -w /var/www/certbot \
  -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \
  -m senin@email.com --agree-tos --non-interactive

# 3) HTTPS
sudo PORTFOLIO_MODE=host PORTFOLIO_HOST=host.docker.internal ./deploy/ttengames/install-nginx.sh https

curl -I https://emrekilic.web.tr/tr
```

`172.17.0.1` ile host modu gerekirse:

```bash
sudo PORTFOLIO_MODE=host PORTFOLIO_HOST=host.docker.internal ./deploy/ttengames/install-nginx.sh http
```

(TTEN `docker-compose`'da `extra_hosts: ["host.docker.internal:host-gateway"]` gerekebilir.)

### `nginx.service is not active, cannot reload`

Config dosyaları kopyalanmış olabilir ama script certbot adımına geçmeden durmuş olabilir. Sunucuda:

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx
sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-nginx.sh
```

`start` başarısız olursa 80/443 portunu kim dinliyor bakın:

```bash
sudo ss -tlnp | grep -E ':80|:443'
sudo systemctl status nginx
```

### emrekilic.web.tr TTEN Games gösteriyorsa

Nginx'te `emrekilic.web.tr` için ayrı `server` bloğu yok → istek TTEN'in default server'ına düşer.

Sunucuda bir kez çalıştır (önce repo güncel olsun):

```bash
cd /opt/portfolio
git pull   # veya GitHub Actions deploy sonrası
sudo chmod +x deploy/setup-nginx.sh
sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-nginx.sh
```

Script sırası: **HTTP config** → **certbot webroot** → **HTTPS config** (sertifika yokken SSL config yüklenmez).

Certbot hata verirse Cloudflare'de `@`, `admin`, `api` kayıtlarını geçici **DNS only** (gri bulut) yap, scripti tekrar çalıştır.

Doğrula:

```bash
# Portfolio mu? (200 ve Emre/portfolio HTML gelmeli)
curl -s http://127.0.0.1:3100/tr | head -5

# Nginx emrekilic bloğu var mı?
sudo nginx -T | grep "server_name emrekilic"
```

Cloudflare SSL: **Full (strict)** + sunucuda Let's Encrypt sertifikası.

## SSL

Cloudflare **Full (strict)** modunda Origin Certificate veya Let's Encrypt kullanın:

```bash
sudo certbot certonly --nginx -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr
```

## Google OAuth

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Authorized redirect URI:

```
https://api.emrekilic.web.tr/api/v1/auth/google/callback
```

## İngilizce içerik

```bash
cd backend && yarn translate:en
```

## Yerel veritabanını production'a taşıma

Admin panelinde düzenlediğiniz CMS/CV verileri yerel Postgres'te kalır. Canlıya aktarmak için:

### 1. Yerel makine — Windows PostgreSQL (sizin kurulum)

`backend/.env` dosyanızdaki bağlantı bilgileri otomatik okunur:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=...
DATABASE_NAME=portfolio
```

**Git Bash** (proje klasöründe):

```bash
# Docker postgres çalışmıyorsa otomatik native mod kullanılır
LOCAL_PG_MODE=native bash deploy/migrate-local-to-prod.sh export
```

`pg_dump` PATH'te değilse önce ekleyin:

```bash
export PATH="/c/Program Files/PostgreSQL/16/bin:$PATH"
LOCAL_PG_MODE=native bash deploy/migrate-local-to-prod.sh export
```

**PowerShell** alternatifi:

```powershell
cd C:\Users\adorr\Downloads\portfolio
$env:PGPASSWORD = "SIFRENIZ"
& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" `
  -h localhost -p 5432 -U postgres -d portfolio `
  -Fc --no-owner --no-acl `
  -f deploy\artifacts\portfolio-local.sql
```

> **Not:** `6432` portu PgBouncer içindir; yedek için doğrudan Postgres **`5432`** kullanın.
>
> Windows PostgreSQL 18 ile sunucu PostgreSQL 18 aynı sürümdeyse custom dump da kullanılabilir:
> `LOCAL_PG_DUMP_FORMAT=custom bash deploy/migrate-local-to-prod.sh export`

Oluşan dosyalar:
- `deploy/artifacts/portfolio-local.sql` — veritabanı yedeği (önerilen, tüm sürümlerle uyumlu)
- `deploy/artifacts/portfolio-local.dump` — custom format (yalnızca PG18+ hedef)
- `deploy/artifacts/portfolio-uploads.tar.gz` — `backend/uploads/` varsa medya dosyaları

### 1b. Yerel makine — Docker Postgres

```bash
docker compose up -d
LOCAL_PG_MODE=docker bash deploy/migrate-local-to-prod.sh export
```

### 2. Sunucuya kopyala

```bash
scp deploy/artifacts/portfolio-local.sql \
    deploy/artifacts/portfolio-uploads.tar.gz \
    root@SUNUCU_IP:/opt/portfolio/deploy/artifacts/
```

(`portfolio-uploads.tar.gz` yoksa yalnızca dump yeterli.)

### 3. Sunucuda import

```bash
cd /opt/portfolio
bash deploy/migrate-local-to-prod.sh import
bash deploy/migrate-local-to-prod.sh sync-uploads   # medya arşivi varsa
```

Import işlemi:
- Mevcut production veritabanını **siler ve yerel dump ile değiştirir**
- `http://localhost:3001/...` medya URL'lerini `https://api.emrekilic.web.tr/...` olarak günceller
- Backend / frontend / admin'i yeniden başlatır

**Uyarı:** Production'daki mevcut verilerin üzerine yazılır. Önce yedek alın:

```bash
docker exec portfolio-prod-postgres pg_dump -U portfolio -d portfolio -Fc -f /tmp/backup.dump
docker cp portfolio-prod-postgres:/tmp/backup.dump ./prod-backup-$(date +%F).dump
```

### S3 kullanıyorsanız

AWS anahtarları `deploy/.env` içinde doluysa medya zaten S3'te olabilir; yalnızca DB import yeterli. Yerel `uploads/` kullanıyorsanız `sync-uploads` adımını atlamayın.

## PostgreSQL 18 yükseltmesi (production)

`docker-compose.prod.yml` artık `postgres:18-alpine` kullanır. **PG18'de volume mount yolu değişti:**

| Sürüm | Mount hedefi |
|-------|----------------|
| PG16 ve öncesi | `/var/lib/postgresql/data` |
| PG18+ | `/var/lib/postgresql` |

Eski volume yapısı PG18 ile uyumsuzdur; yükseltme volume'u siler ve yeniden oluşturur.

```bash
cd /opt/portfolio
git fetch origin
git checkout origin/main -- docker-compose.prod.yml deploy/upgrade-postgres.sh deploy/deploy.sh

chmod +x deploy/upgrade-postgres.sh

# Yedek + volume sıfırla + PG18 (yeni mount yolu)
bash deploy/upgrade-postgres.sh --postgres-only

# Yerel veriyi yükle
bash deploy/migrate-local-to-prod.sh import
```

Kontrol:

```bash
docker exec portfolio-prod-postgres psql -U portfolio -d portfolio -tAc 'SELECT version();'
docker inspect portfolio-prod-postgres --format '{{range .Mounts}}{{.Destination}} {{end}}'
# Beklenen mount: /var/lib/postgresql
```

## SEO kontrol listesi

- [ ] `NEXT_PUBLIC_SITE_URL=https://emrekilic.web.tr` production'da ayarlı
- [ ] `https://emrekilic.web.tr/sitemap.xml` erişilebilir
- [ ] `https://emrekilic.web.tr/robots.txt` erişilebilir
- [ ] `https://emrekilic.web.tr/og-image.jpg` sosyal önizleme görseli
- [ ] Google Search Console'a site ekle + sitemap gönder
- [ ] Opsiyonel: `NEXT_PUBLIC_GA_MEASUREMENT_ID` veya `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) ile JSON-LD doğrula
- [ ] Cloudflare'de Brotli + Auto Minify açık
- [ ] Cloudflare Page Rule: `www` → apex yönlendirmesi

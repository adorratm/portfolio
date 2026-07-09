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

# 4. Nginx — ZORUNLU (yoksa emrekilic.web.tr TTEN sitesini gösterir!)
sudo chmod +x deploy/setup-nginx.sh
sudo CERTBOT_EMAIL=senin@email.com ./deploy/setup-nginx.sh

# Manuel kurulum istersen:
# sudo cp deploy/nginx/*.conf /etc/nginx/sites-available/
# sudo ln -sf /etc/nginx/sites-available/emrekilic.web.tr.conf /etc/nginx/sites-enabled/
# sudo ln -sf /etc/nginx/sites-available/admin.emrekilic.web.tr.conf /etc/nginx/sites-enabled/
# sudo ln -sf /etc/nginx/sites-available/api.emrekilic.web.tr.conf /etc/nginx/sites-enabled/
# sudo certbot certonly --nginx -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr
# sudo nginx -t && sudo systemctl reload nginx
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

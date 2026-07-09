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

# 4. Nginx site konfigürasyonları
sudo cp deploy/nginx/*.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/emrekilic.web.tr.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/admin.emrekilic.web.tr.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.emrekilic.web.tr.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
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

## Cloudflare DNS kayıtları

| Tip | Ad    | Hedef          | Proxy |
|-----|-------|----------------|-------|
| A   | @     | Sunucu IP      | Proxied |
| A   | admin | Sunucu IP      | Proxied |
| A   | ap    | Sunucu IP      | Proxied |

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
- [ ] Google Search Console'a site ekle
- [ ] Cloudflare'de Brotli + Auto Minify açık
- [ ] Cloudflare Page Rule: `www` → apex yönlendirmesi

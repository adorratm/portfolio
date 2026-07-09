# İki site, tek sunucu (TTEN + Portfolio)

Aynı Hetzner sunucusunda iki ayrı repo çalışır:

| Repo | Domain | Nginx | Container port |
|------|--------|-------|----------------|
| [ttengamesstudio](https://github.com/adorratm/ttengamesstudio) | ttengamesstudio.com.tr | `ttengamesstudio-nginx` (80/443) | ttengamesstudio-frontend:3000 |
| [portfolio](https://github.com/adorratm/portfolio) | emrekilic.web.tr | aynı nginx, `server_name` ile ayrılır | host:3100-3102 |

Nginx domain'e göre yönlendirir — DNS ikisini de aynı IP'ye gidebilir.

## Mimari

```
İstek → ttengamesstudio-nginx (:80/:443)
          ├─ Host: ttengamesstudio.com.tr → ttengamesstudio-frontend
          └─ Host: emrekilic.web.tr      → host.docker.internal:3100 (portfolio)
```

## Kurulum (sunucuda bir kez)

### 1. TTEN docker-compose — nginx servisine ekle

`/opt/ttengamesstudio/docker-compose.yml`:

```yaml
  nginx:
    # ... mevcut ayarlar ...
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

```bash
cd /opt/ttengamesstudio && docker compose up -d nginx
```

### 2. Portfolio container'ları

```bash
cd /opt/portfolio
cp deploy/.env.production.example deploy/.env   # düzenle
./deploy/deploy.sh
```

### 3. Nginx domain ayrımı (portfolio tarafı)

```bash
cd /opt/portfolio
sed -i 's/\r$//' deploy/ttengames/install-nginx.sh
sudo bash deploy/ttengames/install-nginx.sh
```

Script otomatik olarak:
- Portfolio Docker ağından nginx'i ayırır (TTEN `frontend` DNS çakışmasını önler)
- `host.docker.internal:3100` üzerinden portfolio'ya bağlar
- `portfolio.conf.template` → TTEN templates dizinine yükler
- Her iki siteyi test eder

### 4. SSL (emrekilic)

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \
  -m admin@emrekilic.web.tr --agree-tos --non-interactive

sudo bash deploy/ttengames/install-nginx.sh https
```

## Önemli kurallar

1. **Host nginx başlatmayın** — 80/443 zaten `ttengamesstudio-nginx`'te.
2. **`PORTFOLIO_MODE=network` kullanmayın** — `frontend` DNS adı çakışır, TTEN bozulur.
3. **Portfolio upstream = host portları** (3100, 3101, 3102), container adları değil.

## Sorun giderme

```bash
# TTEN mi portfolio mu?
curl -sL -H 'Host: ttengamesstudio.com.tr' http://127.0.0.1/ | head -3
curl -sL -H 'Host: emrekilic.web.tr' http://127.0.0.1/tr | head -3

# Nginx'te emrekilic bloğu var mı?
docker exec ttengamesstudio-nginx nginx -T 2>/dev/null | grep server_name

# Upstream erişimi
docker exec ttengamesstudio-nginx wget -qO- http://host.docker.internal:3100/tr | head -3
```

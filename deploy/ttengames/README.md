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
          └─ Host: emrekilic.web.tr      → portfolio-prod-frontend:3000
                                             (TTEN Docker ağı üzerinden)
```

## Kurulum (sunucuda bir kez)

### 1. Portfolio container'ları

```bash
cd /opt/portfolio
cp deploy/.env.production.example deploy/.env   # düzenle
./deploy/deploy.sh
```

### 2. Nginx domain ayrımı

Script önce host gateway dener; olmazsa **docker ağ moduna** geçer (extra_hosts gerekmez):

```bash
cd /opt/portfolio
sed -i 's/\r$//' deploy/ttengames/install-nginx.sh
sudo bash deploy/ttengames/install-nginx.sh
```

Docker modunu doğrudan zorlamak için (ağ adını kendiniz bulun):

```bash
# nginx ile ttengamesstudio-frontend ortak ağ adı:
docker inspect ttengamesstudio-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{println $k}}{{end}}'

sudo PORTFOLIO_TTEN_NETWORK=ttengamesstudio_ttengamesstudio-network \
     PORTFOLIO_UPSTREAM_MODE=docker \
     bash deploy/ttengames/install-nginx.sh
```

Script otomatik olarak:
- Nginx'i portfolio ağından ayırır (TTEN `frontend` DNS çakışmasını önler)
- Portfolio container'larını TTEN ağına bağlar (`portfolio-prod-frontend:3000`)
- `portfolio.conf` yazar; TTEN template veya `entrypoint.sh` içine `include` ekler

> TTEN yalnızca kendi template'ini işler; portfolio `include /etc/nginx/templates/portfolio.conf` ile yüklenir.

### 3. SSL (emrekilic)

```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d emrekilic.web.tr -d admin.emrekilic.web.tr -d api.emrekilic.web.tr \
  -m admin@emrekilic.web.tr --agree-tos --non-interactive

sudo bash deploy/ttengames/install-nginx.sh https
```

## Önemli kurallar

1. **Host nginx başlatmayın** — 80/443 zaten `ttengamesstudio-nginx`'te.
2. **Nginx'i portfolio ağına bağlamayın** — `frontend` DNS çakışır.
3. **Portfolio container'ları TTEN ağına bağlanır** — upstream: `portfolio-prod-frontend:3000`.

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

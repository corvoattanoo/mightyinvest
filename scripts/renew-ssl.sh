# #!/bin/bash
# # Let's Encrypt SSL Sertifika Yenileme Scripti
# # /home/yigit/investingProject/scripts/renew-ssl.sh

# PROJECT_DIR="/home/yigit/investingProject"

# echo "[$(date)] SSL yenileme başladı..."

# # Nginx'i durdur (80 portunu serbest bırak)
# docker compose -f "$PROJECT_DIR/docker-compose.yml" stop nginx

# # Certbot ile yenile
# certbot renew --standalone --quiet

# # Nginx'i tekrar başlat
# docker compose -f "$PROJECT_DIR/docker-compose.yml" start nginx

# echo "[$(date)] SSL yenileme tamamlandı."

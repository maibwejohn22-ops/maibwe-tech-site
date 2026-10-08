# Site public d'Applications John Maibwe (AJM) — servi par nginx, sans Node ni base de données.
# Construit et déployé par Coolify sur le VPS (aucune GitHub Action).
# Image « unprivileged » : nginx tourne sans root et écoute le port 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

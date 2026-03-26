FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Minimal config: serve static files, no directory listing, no server tokens
RUN echo 'server { \
    listen 80; \
    server_name _; \
    server_tokens off; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ =404; } \
    location ~ /\. { deny all; } \
}' > /etc/nginx/conf.d/landing.conf

COPY index.html /usr/share/nginx/html/index.html
COPY logo-presserv.svg /usr/share/nginx/html/logo-presserv.svg

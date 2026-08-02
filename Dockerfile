FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html index.en.html app.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY dist/ /usr/share/nginx/html/dist/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1

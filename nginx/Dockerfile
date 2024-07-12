FROM nginx:alpine

COPY nginx/default.conf /tmp/nginx/nginx.conf
RUN envsubst '' < /tmp/nginx/nginx.conf > /etc/nginx/nginx.conf

COPY frontend/build /usr/share/nginx/html

CMD [ "nginx", "-g", "daemon off;"]

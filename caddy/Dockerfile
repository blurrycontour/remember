FROM caddy:builder AS builder

RUN xcaddy build \
    --with github.com/caddy-dns/duckdns \
    --with github.com/caddy-dns/desec \
    --with github.com/sablierapp/sablier-caddy-plugin

FROM caddy:latest

COPY --from=builder /usr/bin/caddy /usr/bin/caddy

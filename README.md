# Elysia with Bun runtime

## Research question

- Hoe bouw je een performante real-time livestream collaboratie
  tool met behulp van HTMX en een bun-Elysiajs backend?

### Deel vragen

1. Wat zijn de kernfunctionaliteiten van een collaborative tool
2. Hoe kan WebSocket-communicatie worden geïntegreerd in HTMX en Elysia voor realtime updates?
3. Hoe implementeer je een ElysiaJS-backend voor gegevensopslag en realtime communica-tie?
4. Hoe kan je gebruikersauthenticatie en authorizatie toepassen in de collaboration tool
5. Welk(e) live-streaming protocol of service is de beste optie, hoe implementeer ik deze?
6. Hoe kan je een realtime livestream implementeren met HTMX

## Getting Started

To start this project, you need to have [Bun](https://bun.sh/) and [Docker](https://docker.com) installed.

```bash
curl -fsSL https://bun.sh/install | bash
```

# Install dependencies

```bash
bun install
```

# start redis

```bash
docker run -d -p 6379:6379 redis
```

# start dev server

```bash
bun dev
```

```bash
curl -X POST \
-H "Authorization: Bearer QyFo_maa6jdgoZ5LRLX6En_4gR3k22LIirjVu3Gw" \
https://api.cloudflare.com/client/v4/accounts/b39625d9de23956fbb840ecb2c111dd9/stream/live_inputs

```

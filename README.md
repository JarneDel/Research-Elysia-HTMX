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



# Local development
## Prequisites

1. Supabase account: https://supabase.com/
2. Cloudflare Account && Cloudflare stream https://dash.cloudflare.com/stream/videos
3. Docker (optional) https://docs.docker.com/engine/install/

## Clone the project

```bash
git clone https://github.com/JarneDel/Research-Elysia-HTMX
cd Research-Elysia-HTMX
```

### Install dependencies

#### Bun
`curl -fsSL https://bun.sh/install | bash`

`bun install`

### env

#### Supabase env
url: supabase | project | settings | api | Project url
supabase_service_role: supabase | project | settings | api | project API Keys | service_role

#### cloudflare env
account identifier: https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/
api key: https://dash.cloudflare.com/profile/api-tokens

Create an api token with Read and Write to cloudflare Stream and Images

```dotenv
supabase_url=<Supabase-Project-URL>
supabase_service_role=<supabase-service-role>
PORT: <portyou-want-api-to-run-on>
account_identifier=<cloudflare-account-id>
cloudflare_api_key=<cloudflare-api-key>
```

## Running the project
```zsh
bun dev
```


# Docker

## Docker run

```zsh
docker run -d -p 8080:80 --env-file ../.env.production.local --name api jarnedel/research-project-api:latest
```

## docker compose

```zsh 
bun deploy:docker
```


t

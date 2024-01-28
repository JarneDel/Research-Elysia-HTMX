# Quizx: Research project Bun Elysia Htmx Live-streaming
## Research question

- How do you build a performant real-time livestream collaboration tool using HTMX and a bun-Elysiajs backend?

### Sub-questions

1. What are the core functionalities of a collaborative tool?
2. How can WebSocket communication be integrated into HTMX and Elysia for real-time updates?
3. How do you implement an ElysiaJS backend for data storage and real-time communication?
4. How can you apply user authentication and authorization in the collaboration tool?
5. Which live-streaming protocol or service is the best option, how do I implement this?
6. How can you implement a real-time live stream with HTMX?



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

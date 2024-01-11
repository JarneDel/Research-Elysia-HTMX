FROM oven/bun:latest as bun

WORKDIR /app

COPY package.json /app/package.json
COPY bun.lockb /app/bun.lockb

RUN bun install

COPY . /app


RUN bun run build
RUN bun ./build.ts

FROM oven/bun as production

COPY --from=bun /app/build /app

WORKDIR /app

CMD ["bun", "./index.js"]

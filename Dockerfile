FROM oven/bun:latest as bun


COPY package.json /app/package.json
COPY bun.lockb /app/bun.lockb
WORKDIR /app

RUN bun install

COPY / /app

RUN bun run build
RUN bun build ./src/index.ts --outdir=./build --minify --target=bun --sourcemap=external
RUN bun ./build.ts

FROM oven/bun as production

COPY --from=bun /app/build /app

WORKDIR /app

CMD ["bun", "./index.js"]

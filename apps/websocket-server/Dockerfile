FROM node:20-alpine

WORKDIR /app

COPY . .
RUN npm i pnpm -g

RUN  pnpm install

EXPOSE 4000

CMD ["pnpm", "run", "dev"]
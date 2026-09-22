FROM node:20-alpine

# git para publicar (push) desde el contenedor
RUN apk add --no-cache git && git config --global --add safe.directory '*'

WORKDIR /admin
COPY package.json ./
RUN npm install --omit=dev
COPY . .

ENV PORT=4322
ENV REPO_DIR=/repo
EXPOSE 4322
CMD ["node", "server.mjs"]

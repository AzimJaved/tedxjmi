# --- Installing stage ---
FROM node AS installer

WORKDIR /

RUN mkdir backend
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install --quiet

# ---  Building stage ---
FROM installer AS builder

WORKDIR /backend

ENV NODE_ENV=production

COPY /backend /
COPY tsconfig.json .
RUN npm run build

# --- Run ---
# Running code under slim image
FROM node:12.0-slim

WORKDIR /

# Clean new directory
RUN mkdir server
WORKDIR /server
COPY --from=builder /backend/build build
EXPOSE 3600

CMD [ "node", "build/Server.js" ]
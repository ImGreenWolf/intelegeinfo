# # syntax=docker/dockerfile:1

# # Comments are provided throughout this file to help you get started.
# # If you need more help, visit the Dockerfile reference guide at
# # https://docs.docker.com/go/dockerfile-reference/

# # Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# ARG NODE_VERSION=19.1.0

# FROM node:${NODE_VERSION}-alpine

# # Use production node environment by default.
# ENV NODE_ENV production


# WORKDIR /usr/src/app
# # RUN chown -R node:node /usr/src/app
# # Download dependencies as a separate step to take advantage of Docker's caching.
# # Leverage a cache mount to /root/.npm to speed up subsequent builds.
# # Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# # into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev

# # Run the application as a non-root user.

# # RUN npm install pm2 -g

# RUN apk add --no-cache g++ musl-dev
# RUN apk add --no-cache gdb
# RUN apt-get update && apt-get upgrade -y && apt-get -qy install openss
# # RUN pm2 link cq87kz5q8ghies6 hikp92gri5qpuzg
# # Copy the rest of the source files into the image.
# COPY . .
# COPY private.pem public.pem
# # RUN npx tsc -b
# # RUN npm install --omit=dev \
# # npm -i express
# # RUN npm install bcryptjs    
# # RUN npm install jsonwebtoken 
# # Expose the port that the application listens on.
# EXPOSE 3000
# EXPOSE 8080
# USER node

# # Run the application.
# # CMD node dist/server/server.js
# # CMD ["sh", "-c", "npm run db:deploy && npm run dev"]
# #CMD ["pm2-runtime", "ecosystem.config.js"]



ARG NODE_VERSION=19.1.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production

# Add required tools & install dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
     npm ci --omit=dev

RUN apk add --no-cache g++ musl-dev gdb openssl

# Create app directory and give permissions to 'node' user
WORKDIR /usr/src/app
COPY . .



# Generate Prisma client (must be before USER switch)
RUN npx prisma generate

# Set ownership so 'node' can write during runtime
RUN chown -R node:node /usr/src/app

# Use non-root user
USER node

EXPOSE 3000
EXPOSE 8080

CMD node dist/server/server.js
# CMD ["sh", "-c", "npm run db:deploy && npm run dev"]






# ARG NODE_VERSION=19.1.0
# # ===== STAGE 1: Build =====
# FROM node:${NODE_VERSION}-alpine AS builder

# WORKDIR /app

# # Install deps and build
# COPY package*.json tsconfig.json ./
# # RUN  npm ci --omit=dev #npm install
# COPY public ./public
# COPY server ./server
# COPY shared ./shared
# RUN npm run build    # compiles to /app/dist

# # ===== STAGE 2: Runtime =====

# FROM node:${NODE_VERSION}-alpine

# WORKDIR /app

# # Install only production deps
# COPY package*.json ./
# RUN npm install --only=production

# # Copy built code and any needed assets
# COPY --from=builder /app/dist ./dist
# COPY private.pem ./private.pem

# # Run the app
# CMD ["node", "dist/server/server.js"]

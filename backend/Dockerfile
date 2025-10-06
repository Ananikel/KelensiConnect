# backend/Dockerfile

# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock
COPY package*.json ./

# Install all dependencies (including devDependencies for 'npm run build')
RUN npm install

# Copy the rest of the application source code (including src, tsconfig.json)
COPY . .

# Build the TypeScript application (this creates the 'dist' folder)
# This will now create 'dist/server.js' and other compiled files.
RUN npm run build

#----------------------------------------------------
# Stage 2: Create the final production image
#----------------------------------------------------
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# 1. Install Production Dependencies
# Copy package.json again to install only necessary dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# 2. Copy the compiled application files
# This copies the entire 'dist' folder, which contains server.js.
COPY --from=builder /app/dist ./dist

# Expose the internal port (5000 as defined in docker-compose)
EXPOSE 5000

# Set the entry point to use the 'start' script from package.json.
# This correctly executes 'node dist/server.js' inside the container.
CMD ["npm", "start"]

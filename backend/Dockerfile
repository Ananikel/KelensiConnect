# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and install all dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code (including src/, tsconfig.json)
COPY . .

# Run the build command (this assumes it creates the 'dist' folder)
RUN npm run build

#----------------------------------------------------
# Stage 2: Create the final production image
#----------------------------------------------------
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# 1. Install Production Dependencies
# Copy package.json to install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# 2. Copy the compiled application files
# This copies the 'dist' folder created in the builder stage
COPY --from=builder /app/dist ./dist

# 3. Copy the .env.example if needed for variable loading (though not recommended for secrets)
# COPY --from=builder /app/.env.example ./.env.example

# Expose the internal port
EXPOSE 5000

# Use 'npm start' as the command. 
# This command is more reliable as it delegates the actual file path 
# (e.g., 'node dist/index.js' or 'node dist/server.js') to your package.json,
# which you control locally.
CMD ["npm", "start"]

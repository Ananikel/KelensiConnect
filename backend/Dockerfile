# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript application (creates the 'dist' folder)
RUN npm run build

#----------------------------------------------------
# Stage 2: Create the final production image (FIXED)
#----------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# 1. Copy required production files from the builder stage:
#    - package*.json: Needed for npm start/scripts if used, or just for context.
#    - node_modules: Only production dependencies.
#    - The compiled application (the 'dist' folder).
#    - The entry point file (e.g., 'index.js', 'server.js', or the compiled entry point).
#    
#    ASSUMPTION: The compiled entry file is inside 'dist', but we also need
#    package.json to run 'npm install --only=production' and perhaps a start script.

# Copy only package.json for production install
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# The CRUCIAL FIX: Copy the entire compiled 'dist' folder
COPY --from=builder /app/dist ./dist

# EXPOSE the internal port (5000)
EXPOSE 5000

# Command to run the application
# This CMD line now correctly references the file that exists inside the copied /app/dist folder.
CMD ["node", "dist/index.js"]

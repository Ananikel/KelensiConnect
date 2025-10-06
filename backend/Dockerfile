# Stage 1: Build the application
# Use the official Node image for building
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# The order matters for efficient caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript application (assuming a 'build' script exists to compile TS to JS)
# The output is typically placed in a 'dist' folder
RUN npm run build

# Stage 2: Create the final production image
# Use a smaller, secure Node runtime image
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only production dependencies from the builder stage
COPY --from=builder /app/package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy the built application files from the builder stage (e.g., the compiled JS and assets)
# Adjust the path (e.g., 'dist') if your build process uses a different directory
COPY --from=builder /app/dist ./dist

# Copy other necessary files like the .env-related settings if needed (though environment vars are usually passed at runtime)
# You might need to copy files like 'server.js' or 'index.js' if they are in the root and needed to start the app.
# Assuming the entry file is within 'dist', or a separate 'start' script exists.
# For typical Express/Node projects, the entry point is often in the compiled 'dist' folder.

# Expose the internal port (as defined in docker-compose: 'PORT: 5000')
EXPOSE 5000

# Command to run the application
# Assuming the main compiled file is 'dist/index.js' or a similar entry point.
CMD ["node", "dist/index.js"]

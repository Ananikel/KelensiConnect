# Stage 1: Build the React application
# Use the official Node image for building
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# The build argument VITE_API_KEY is passed during the docker-compose build
ARG VITE_API_KEY

# Build the React application (typically creates a 'dist' or 'build' folder)
# Pass the build-time argument as an environment variable for Vite
RUN npm run build

# Stage 2: Serve the application with Nginx
# Use a minimal Nginx image
FROM nginx:stable-alpine AS production

# Copy the custom Nginx configuration file
# This file is created in the next section (nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application's static files from the builder stage
# Assuming the build output is in 'dist', which is the default for Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port Nginx is configured to listen on (port 80 is the default)
EXPOSE 80

# The default command for the Nginx image is sufficient to start the web server.
# CMD ["nginx", "-g", "daemon off;"]

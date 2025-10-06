# frontend/Dockerfile

# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# The build argument VITE_API_KEY is passed during the docker-compose build
ARG VITE_API_KEY

# Build the React application (Vite default output is 'dist')
# We explicitly pass the build argument as an environment variable to the build process
RUN npm run build

#----------------------------------------------------
# Stage 2: Serve the application with Nginx
#----------------------------------------------------
FROM nginx:stable-alpine AS production

# Copy the custom Nginx configuration file
# This file handles routing and API proxy (see next section)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application's static files from the builder stage
# Assuming the build output is in 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port Nginx is configured to listen on (port 80)
EXPOSE 80

# The default command for the Nginx image is sufficient to start the web server.

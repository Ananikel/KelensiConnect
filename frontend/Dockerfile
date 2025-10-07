# frontend/Dockerfile

# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code (including tsconfig.node.json now!)
COPY . .

# Pass the API_KEY from the root .env file as a build argument
ARG VITE_API_KEY

# Build the React application (Vite default output is 'dist')
# We pass the VITE_API_KEY environment variable to the build process
# NOTE: The command is executed by the shell, and Vite picks up VITE_* variables
RUN VITE_API_KEY=${VITE_API_KEY} npm run build

#----------------------------------------------------
# Stage 2: Serve the application with Nginx
#----------------------------------------------------
FROM nginx:stable-alpine AS production

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application's static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port Nginx is configured to listen on (port 80)
EXPOSE 80

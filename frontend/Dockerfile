# --- STAGE 1: BUILDER (Compilation de l'application React/Vite) ---
FROM node:20-alpine AS builder

# Définition de l'environnement de travail dans le conteneur
WORKDIR /app

# Copie des fichiers de configuration pour la gestion des dépendances et de TypeScript
COPY package*.json ./
COPY tsconfig*.json ./

# Installation des dépendances (y compris le @types/node qui était manquant)
RUN npm install

# Copie de tous les fichiers du projet (src/, public/, etc.)
COPY . .

# Définition de l'argument pour la clé API (passé par docker-compose)
ARG VITE_API_KEY
# Exécution de la compilation TypeScript et Vite, en passant la clé API
RUN VITE_API_KEY=${VITE_API_KEY} npm run build


# --- STAGE 2: PRODUCTION (Serveur Nginx léger) ---
FROM nginx:stable-alpine AS production

# Copie de la configuration Nginx personnalisée pour gérer le routage SPA (React)
# Ce fichier 'nginx.conf' doit se trouver à côté de ce Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie du résultat de la compilation (le dossier 'dist') depuis le stage 'builder'
COPY --from=builder /app/dist /usr/share/nginx/html

# Le frontend écoute sur le port 80 (mappé au port 8080 par le docker-compose)
EXPOSE 80

# Commande de démarrage par défaut de Nginx
CMD ["nginx", "-g", "daemon off;"]

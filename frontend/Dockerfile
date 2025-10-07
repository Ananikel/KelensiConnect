# --- STAGE 1: BUILDER (pour compiler le code React/Vite) ---
FROM node:20-alpine AS builder

# Définition de l'environnement de travail
WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances (les étapes CACHED que nous avions vues)
RUN npm install

# Copie de tous les fichiers du projet
COPY . .

# Construction de l'application
# NOTE : La variable VITE_API_KEY doit être passée à l'étape de build.
# Utilisez l'ARG VITE_API_KEY pour la recevoir.
ARG VITE_API_KEY
RUN VITE_API_KEY=${VITE_API_KEY} npm run build


# --- STAGE 2: PRODUCTION (pour servir le site statique avec Nginx) ---
FROM nginx:stable-alpine AS production

# Copie de la configuration Nginx personnalisée
# Assurez-vous que ce fichier 'nginx.conf' se trouve à la racine de votre projet
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers statiques construits depuis le stage 'builder'
# Le dossier de sortie de Vite est généralement 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Le port 80 est le port par défaut de Nginx
EXPOSE 80

# Démarre Nginx
CMD ["nginx", "-g", "daemon off;"]

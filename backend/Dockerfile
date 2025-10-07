# --- STAGE 1: BUILDER (Compilation de TypeScript) ---
FROM node:20-alpine AS builder

# Crée et définit le répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances pour l'installation
COPY package*.json ./
COPY tsconfig.json ./

# Installation de TOUTES les dépendances (y compris typescript, ts-node, etc.)
RUN npm install

# Copie du code source complet
COPY . .

# Compilation de TypeScript en JavaScript (crée le dossier 'dist/')
# Assurez-vous que votre package.json backend a un script "build" valide
RUN npm run build


# --- STAGE 2: PRODUCTION (Runtime léger) ---
FROM node:20-alpine AS production

# Crée et définit le répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances pour le runtime (package.json est copié deux fois, pour une meilleure gestion du cache)
COPY package*.json ./
# Installation des dépendances de PRODUCTION SEULEMENT
RUN npm install --production

# Copie du code compilé (dist/) depuis l'étape de construction
COPY --from=builder /app/dist ./dist

# Le port d'écoute interne du backend est 5000 (comme dans docker-compose)
EXPOSE 5000

# Commande de démarrage : exécute le fichier compilé
CMD ["npm", "start"]

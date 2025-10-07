FROM node:20-alpine

# Crée et définit le répertoire de travail
# Le chemin dans le conteneur doit correspondre au contexte du build dans le docker-compose
WORKDIR /app

# Copie des fichiers de dépendances et installation
COPY package*.json ./

RUN npm install --production

# Copie du code source du backend
COPY . .

# Le port d'écoute interne du backend est 5000
EXPOSE 5000

# Commande de démarrage du backend
# NOTE : Si vous utilisez TypeScript directement sans build, remplacez par la commande appropriée (ex: 'npm run start:dev')
CMD ["npm", "start"] 

FROM node:20-alpine

# Crée et définit le répertoire de travail
WORKDIR /app/backend

# Copie des fichiers de dépendances et installation
COPY backend/package*.json ./

RUN npm install

# Copie du code source du backend
COPY backend/ .

# Le port par défaut du backend (ajustez si nécessaire, ex: 3000 ou 8000)
EXPOSE 8000

# Commande de démarrage du backend
CMD ["npm", "start"] 
# Si votre script de démarrage est 'npm run dev', modifiez la ligne ci-dessus
# Si vous utilisez Typescript, la commande serait plus complexe (ex: "node dist/server.js")

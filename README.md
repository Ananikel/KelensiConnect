# KelensiConnect

KelensiConnect est une application web conçue pour simplifier et moderniser la gestion quotidienne d'une association.

## Architecture

L'application est maintenant structurée avec une architecture moderne, prête pour le déploiement :

-   **`frontend/`**: Une application React (Vite + TypeScript) qui constitue l'interface utilisateur. Elle est servie par Nginx en production.
-   **`backend/`**: Une API RESTful (Node.js + Express + TypeScript) qui gère la logique métier et communique avec la base de données.
-   **`db`**: Une base de données PostgreSQL pour la persistance des données.

L'ensemble de l'application est orchestré à l'aide de Docker et Docker Compose, ce qui la rend portable et facile à déployer sur des plateformes comme Coolify.

## Prérequis

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   Un fichier `.env` à la racine du projet.

## Installation et Lancement

1.  **Cloner le dépôt**
    ```bash
    git clone <repository_url>
    cd kelensiconnect
    ```

2.  **Configurer les variables d'environnement**

    Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example`. Remplissez les valeurs requises.

    ```bash
    cp .env.example .env
    # Editez le fichier .env avec vos propres valeurs
    ```
    
    Vous devrez fournir une clé API valide pour l'API Gemini dans la variable `API_KEY`.

3.  **Lancer l'application avec Docker Compose**

    Cette commande va construire les images Docker pour le frontend et le backend, et démarrer tous les services.

    ```bash
    docker-compose up --build
    ```

    -   Le frontend sera accessible à l'adresse `http://localhost:8080` (ou le port que vous avez défini dans `.env`).
    -   Le backend sera accessible à l'adresse `http://localhost:5000` (ou le port que vous avez défini dans `.env`).

4.  **Initialiser la base de données (Seed)**

    Après le premier lancement, ouvrez un nouveau terminal et exécutez la commande suivante pour peupler la base de données avec les données de démonstration :

    ```bash
    docker-compose exec backend npm run seed
    ```

    Cette commande va créer les tables nécessaires et insérer les données initiales (membres, événements, etc.).

## Déploiement sur Coolify

Cette application est optimisée pour Coolify. Vous pouvez déployer ce dépôt directement. Coolify détectera le fichier `docker-compose.yml` et configurera les services pour vous. Assurez-vous de configurer les variables d'environnement nécessaires dans l'interface de Coolify.

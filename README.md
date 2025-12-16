# Instagram Feed Meta API

Backend Node.js pour récupérer les derniers posts Instagram d'un compte via l'API Meta/Facebook.

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Configuration Meta/Facebook API
META_APP_ID=your_meta_app_id
META_SECRET_KEY=your_meta_secret_key
META_ACCESS_TOKEN=your_meta_access_token

# Configuration Serveur
PORT=5000
NODE_ENV=development
```

## 📝 Utilisation

### Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur le port 5000 par défaut (ou le port défini dans `PORT`).

### Endpoints principaux

#### 1. Récupérer les posts Instagram directement (Recommandé - Simple)

**GET** `/api/v1/instagram/posts?token=YOUR_TOKEN&limit=6`

- `token` (query param ou header `x-instagram-token`, optionnel) : Token d'accès Instagram. Si non fourni, utilise `INSTAGRAM_ACCESS_TOKEN` du .env
- `limit` (query param, optionnel) : Nombre de posts à récupérer (défaut: 6)

**Exemple :**
```bash
GET http://localhost:5000/api/v1/instagram/posts?token=IGQWRNUzRHOU4tZAldGcTV0MHVxSFJUeWRVdUQwUFdXOFliRGNDNVNYTkhuNjJmbkJ1cEZAucXBGQm9uVVk0QVhiOEdYT3o5ZATRxYnNSUHEwZA0ZAuV016U3lheTAyZA19xM3hMMTB6bmlYYkJyZAFctZAU5NVi1taHlhTFEZD&limit=6
```

**Ou avec le token dans le header :**
```bash
GET http://localhost:5000/api/v1/instagram/posts?limit=6
Header: x-instagram-token: YOUR_TOKEN
```

**Réponse :**
```json
{
  "statusCode": 200,
  "message": "Posts Instagram récupérés avec succès",
  "count": 6,
  "data": [
    {
      "id": "post_id",
      "caption": "Description du post",
      "media_type": "IMAGE",
      "media_url": "https://...",
      "thumbnail_url": "https://...",
      "permalink": "https://...",
      "timestamp": "2024-01-01T00:00:00+0000",
      "comments_count": 10,
      "like_count": 50
    }
  ],
  "paging": { ... }
}
```

**Comment obtenir le token Instagram ?**
- Via Facebook Graph API Explorer : https://developers.facebook.com/tools/explorer/
- Sélectionnez votre app et générez un User Token avec les permissions `instagram_basic`, `instagram_content_publish`
- Ou utilisez un Long-Lived Token pour une utilisation permanente

#### 2. Récupérer les posts Instagram par page_id Facebook

**GET** `/api/v1/instagram/page/:pageid/posts?limit=10`

- `pageid` : L'ID de la page Facebook liée au compte Instagram
- `limit` (query param, optionnel) : Nombre de posts à récupérer (défaut: 10)
- Cette méthode récupère automatiquement l'ig_account_id depuis la page Facebook

#### 3. Récupérer les médias Instagram (Endpoint complet)

**POST** `/api/v1/page/:pageid/ig_media`

#### 4. Récupérer les informations du compte Instagram

**POST** `/api/v1/page/:pageid/ig_data`

#### 5. Vérifier le profil Meta

**GET** `/api/v1/me`

## 🔧 Configuration

### Variables d'environnement requises

- `INSTAGRAM_ACCESS_TOKEN` : Token d'accès Instagram (obtenu via Facebook Graph API Explorer)
  - Ou passez le token en paramètre : `?token=YOUR_TOKEN`
  - Ou via header : `x-instagram-token: YOUR_TOKEN`

### Variables d'environnement optionnelles

- `META_APP_ID` : ID de votre application Meta (pour les autres endpoints)
- `META_SECRET_KEY` : Clé secrète de votre application Meta (pour les autres endpoints)
- `META_ACCESS_TOKEN` : Token d'accès Meta (pour les autres endpoints)

- `PORT` : Port du serveur (défaut: 5000)
- `NODE_ENV` : Environnement (development/production)

## 📦 Dépendances

- **express** : Framework web
- **fb** : SDK Facebook/Meta
- **dotenv** : Gestion des variables d'environnement
- **cors** : Gestion CORS
- **body-parser** : Parser pour les requêtes HTTP

## 🐛 Résolution de problèmes

### Erreur "Couldn't retrieve access Token"
- Vérifiez que votre `META_ACCESS_TOKEN` est valide
- Assurez-vous que la page Facebook est liée à votre application Meta

### Erreur "No Instagram page linked" ou erreur d'accès
- Vérifiez que la page Facebook a un compte Instagram Business associé
- Assurez-vous que les permissions Instagram sont accordées à votre application
- Vérifiez que l'ig_account_id est correct
- Pour obtenir l'ig_account_id : utilisez `/api/v1/page/:pageid/ig_data` ou l'API Meta directement

## 📄 Licence

ISC


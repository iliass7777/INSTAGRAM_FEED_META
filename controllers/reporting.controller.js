require("dotenv").config();
const f = require("../functions");
const https = require('https');
const http = require('http');

// Endpoint pour récupérer les posts d'un compte Instagram PUBLIC
exports.getInstagramPosts = async (req, res) => {
  try {
    const username = req.query.username;
    const limit = parseInt(req.query.limit) || 12;
    
    if (!username) {
      return res.status(400).json({ 
        error: "Username requis: ?username=NOM_UTILISATEUR",
        example: "/api/v1/instagram/posts?username=instagram&limit=10"
      });
    }
    
    const result = await f.getPublicInstagramPosts(username, limit);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message || error 
    });
  }
};

// Proxy pour les images Instagram (évite les problèmes CORS)
exports.proxyImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ error: "URL requise: ?url=IMAGE_URL" });
    }

    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/'
      }
    }, (proxyRes) => {
      res.set('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=86400');
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.status(500).json({ error: 'Erreur proxy image' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Endpoint pour récupérer VOS propres posts (via API officielle)
exports.getMyInstagramPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const access_token = req.query.token || req.headers['x-instagram-token'] || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!access_token) {
      return res.status(400).json({ error: "Token requis: ?token=VOTRE_TOKEN" });
    }
    
    const result = await f.getInstagramMedia(access_token, limit);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
};

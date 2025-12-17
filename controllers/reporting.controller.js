require("dotenv").config();
const f = require("../functions");
const https = require('https');
const http = require('http');
const db = require('../db/db');

// Générer un ID court unique
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

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

// ========== EMBED MANAGEMENT (SQLite) ==========

// Créer ou mettre à jour un embed (un seul par username)
exports.createEmbed = async (req, res) => {
  try {
    const { username, limit } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username requis" });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const id = generateId();
    const result = db.createEmbed(id, username, limit || 12, baseUrl);
    
    res.json({
      success: true,
      id: result.id,
      embedUrl: result.embedUrl,
      iframeCode: result.iframeCode,
      scriptCode: result.scriptCode,
      updated: result.updated || false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un embed par ID
exports.getEmbed = async (req, res) => {
  try {
    const { id } = req.params;
    const embed = db.getEmbed(id);
    
    if (!embed) {
      return res.status(404).json({ error: "Embed non trouvé" });
    }
    
    res.json({ 
      success: true, 
      embed: {
        id: embed.id,
        username: embed.username,
        limit: embed.limit_count,
        createdAt: embed.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lister tous les embeds
exports.listEmbeds = async (req, res) => {
  try {
    const embeds = db.listEmbeds().map(e => ({
      id: e.id,
      username: e.username,
      limit: e.limit_count,
      createdAt: e.created_at
    }));
    res.json({ success: true, embeds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un embed
exports.deleteEmbed = async (req, res) => {
  try {
    const { id } = req.params;
    const embed = db.getEmbed(id);
    
    if (!embed) {
      return res.status(404).json({ error: "Embed non trouvé" });
    }
    
    db.deleteEmbed(id);
    res.json({ success: true, message: "Embed supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

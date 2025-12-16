require("dotenv").config();
const f = require("../functions");

// Endpoint simple : Appel direct à graph.instagram.com/me/media et retourne la réponse
// Supporte username ou ig_account_id
exports.getInstagramPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const username = req.query.username; // Username Instagram (optionnel)
    const ig_account_id = req.query.ig_account_id; // ID du compte Instagram (optionnel)
    const access_token = req.query.token || req.headers['x-instagram-token'] || process.env.INSTAGRAM_ACCESS_TOKEN;
    
    if (!access_token) {
      return res.status(400).json({ error: "Token requis: ?token=VOTRE_TOKEN" });
    }
    
    let result;
    
    // Si username est fourni, on récupère d'abord l'ig_account_id
    if (username) {
      const ig_id = await f.getInstagramAccountIdFromUsername(username, access_token);
      if (!ig_id) {
        return res.status(400).json({ error: `Impossible de trouver le compte Instagram pour le username: ${username}` });
      }
      result = await f.getInstagramMediaByAccountId(ig_id, access_token, limit);
    }
    // Si ig_account_id est fourni directement
    else if (ig_account_id) {
      result = await f.getInstagramMediaByAccountId(ig_account_id, access_token, limit);
    }
    // Sinon, utilise /me/media (posts du compte associé au token)
    else {
      result = await f.getInstagramMedia(access_token, limit);
    }
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
};

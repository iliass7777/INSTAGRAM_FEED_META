const controller = require("../controllers/reporting.controller");

module.exports = function (app, pre) {
  // Endpoint principal : Récupérer les posts d'un compte Instagram PUBLIC
  app.get(`/${pre}/instagram/posts`, [], controller.getInstagramPosts);
  
  // Proxy pour les images Instagram (évite CORS)
  app.get(`/${pre}/proxy/image`, [], controller.proxyImage);
  
  // Endpoint secondaire : Récupérer VOS propres posts (nécessite token)
  app.get(`/${pre}/instagram/me`, [], controller.getMyInstagramPosts);
  
  // ========== AUTHENTICATION ==========
  app.post(`/${pre}/auth/login`, [], controller.login);
  
  // ========== EMBED MANAGEMENT ==========
  app.post(`/${pre}/embeds`, [], controller.createEmbed);
  app.get(`/${pre}/embeds`, [], controller.listEmbeds);
  app.get(`/${pre}/embeds/:id`, [], controller.getEmbed);
  app.delete(`/${pre}/embeds/:id`, [], controller.deleteEmbed);
};

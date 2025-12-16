const controller = require("../controllers/reporting.controller");

module.exports = function (app, pre) {
  // Endpoint principal : Récupérer les posts Instagram via Instagram Graph API
  // Appel direct à graph.instagram.com/me/media
  app.get(`/${pre}/instagram/posts`, [], controller.getInstagramPosts);
};

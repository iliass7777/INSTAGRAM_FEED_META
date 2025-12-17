const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'embeds.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS embeds (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    limit_count INTEGER DEFAULT 12,
    iframe_code TEXT,
    script_code TEXT,
    embed_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ajouter index unique sur username si pas existe
try {
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON embeds(username)');
} catch(e) {}

module.exports = {
  // Créer ou mettre à jour (un seul embed par username)
  createEmbed: (id, username, limit, baseUrl) => {
    const existing = db.prepare('SELECT * FROM embeds WHERE username = ?').get(username);
    const embedUrl = `${baseUrl}/embed/${existing ? existing.id : id}`;
    
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border-radius: 12px; max-width: 800px;"></iframe>`;
    
    const scriptCode = `<div id="instagram-feed-${existing ? existing.id : id}"></div>
<script>
(function() {
  var container = document.getElementById('instagram-feed-${existing ? existing.id : id}');
  var iframe = document.createElement('iframe');
  iframe.src = '${embedUrl}';
  iframe.width = '100%';
  iframe.height = '600';
  iframe.frameBorder = '0';
  iframe.style.borderRadius = '12px';
  iframe.style.maxWidth = '800px';
  container.appendChild(iframe);
})();
</script>`;
    
    if (existing) {
      db.prepare('UPDATE embeds SET limit_count = ?, iframe_code = ?, script_code = ?, embed_url = ? WHERE username = ?')
        .run(limit, iframeCode, scriptCode, embedUrl, username);
      return { id: existing.id, username, limit, iframeCode, scriptCode, embedUrl, updated: true };
    } else {
      db.prepare('INSERT INTO embeds (id, username, limit_count, iframe_code, script_code, embed_url) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, username, limit, iframeCode, scriptCode, embedUrl);
      return { id, username, limit, iframeCode, scriptCode, embedUrl, updated: false };
    }
  },
  
  getEmbedByUsername: (username) => {
    return db.prepare('SELECT * FROM embeds WHERE username = ?').get(username);
  },

  // Récupérer un embed par ID
  getEmbed: (id) => {
    const stmt = db.prepare('SELECT * FROM embeds WHERE id = ?');
    return stmt.get(id);
  },

  // Lister tous les embeds
  listEmbeds: () => {
    const stmt = db.prepare('SELECT * FROM embeds ORDER BY created_at DESC');
    return stmt.all();
  },

  // Supprimer un embed
  deleteEmbed: (id) => {
    const stmt = db.prepare('DELETE FROM embeds WHERE id = ?');
    return stmt.run(id);
  }
};


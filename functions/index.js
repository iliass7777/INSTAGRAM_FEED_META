// Fonctions pour récupérer les posts Instagram
const https = require('https');
const fetch = require('node-fetch');

module.exports = {
  
    getInstagramMedia: async function (access_token, limit = 6) {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,permalink&access_token=${access_token}&limit=${limit}`;
        return this.makeHttpsRequest(url);
    },

    getPublicInstagramPosts: async function (username, limit = 12) {
        try {
            // Méthode 1: Via l'endpoint web d'Instagram
            const posts = await this.scrapeInstagramProfile(username, limit);
            return {
                success: true,
                username: username,
                count: posts.length,
                data: posts
            };
        } catch (error) {
            return {
                success: false,
                username: username,
                error: error.message || 'Erreur lors de la récupération des posts',
                data: []
            };
        }
    },

    // Scrape le profil Instagram public
    scrapeInstagramProfile: async function (username, limit = 12) {
        // Utilise l'API web d'Instagram (endpoint public)
        const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-IG-App-ID': '936619743392459',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `https://www.instagram.com/${username}/`,
                'Origin': 'https://www.instagram.com'
            }
        });

        if (!response.ok) {
            // Si l'API web échoue, essayer la méthode alternative
            return await this.scrapeInstagramProfileAlt(username, limit);
        }

        const data = await response.json();
        
        if (!data.data || !data.data.user) {
            throw new Error('Utilisateur non trouvé ou profil privé');
        }

        const user = data.data.user;
        const edges = user.edge_owner_to_timeline_media?.edges || [];
        
        const posts = edges.slice(0, limit).map(edge => {
            const node = edge.node;
            return {
                id: node.id,
                shortcode: node.shortcode,
                media_type: node.is_video ? 'VIDEO' : 'IMAGE',
                media_url: node.display_url,
                video_url: node.is_video ? node.video_url : null,
                thumbnail_url: node.thumbnail_src || node.display_url,
                caption: node.edge_media_to_caption?.edges[0]?.node?.text || '',
                timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
                permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                likes: node.edge_liked_by?.count || 0,
                comments: node.edge_media_to_comment?.count || 0
            };
        });

        return posts;
    },

    // Méthode alternative de scraping
    scrapeInstagramProfileAlt: async function (username, limit = 12) {
        // Essayer via la page HTML
        const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error(`Impossible d'accéder au profil @${username}. Le compte est peut-être privé ou n'existe pas.`);
        }

        const text = await response.text();
        
        // Essayer de parser le JSON si c'est une réponse JSON
        try {
            const data = JSON.parse(text);
            if (data.graphql && data.graphql.user) {
                const user = data.graphql.user;
                const edges = user.edge_owner_to_timeline_media?.edges || [];
                
                return edges.slice(0, limit).map(edge => {
                    const node = edge.node;
                    return {
                        id: node.id,
                        shortcode: node.shortcode,
                        media_type: node.is_video ? 'VIDEO' : 'IMAGE',
                        media_url: node.display_url,
                        video_url: node.is_video ? node.video_url : null,
                        thumbnail_url: node.thumbnail_src || node.display_url,
                        caption: node.edge_media_to_caption?.edges[0]?.node?.text || '',
                        timestamp: new Date(node.taken_at_timestamp * 1000).toISOString(),
                        permalink: `https://www.instagram.com/p/${node.shortcode}/`,
                        likes: node.edge_liked_by?.count || 0,
                        comments: node.edge_media_to_comment?.count || 0
                    };
                });
            }
        } catch (e) {
            // Ce n'est pas du JSON, continuer avec le HTML
        }

        throw new Error(`Impossible de récupérer les posts de @${username}. Instagram bloque peut-être les requêtes.`);
    },

    // Fonction utilitaire pour les requêtes HTTPS
    makeHttpsRequest: function (url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (result.error) {
                            reject(result.error);
                        } else {
                            resolve(result);
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    },
};

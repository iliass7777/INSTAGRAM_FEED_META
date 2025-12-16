// Fonction simple : Appel direct à l'API Instagram Graph
// Exactement comme le code JavaScript : graph.instagram.com/me/media
const https = require('https');

module.exports = {
    // Récupère les posts du compte associé au token (/me/media)
    getInstagramMedia: async function (access_token, limit = 6) {
        const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_url,timestamp,permalink&access_token=${access_token}&limit=${limit}`;
        return this.makeHttpsRequest(url);
    },

    // Récupère les posts d'un compte Instagram spécifique par ig_account_id
    getInstagramMediaByAccountId: async function (ig_account_id, access_token, limit = 6) {
        const url = `https://graph.instagram.com/${ig_account_id}/media?fields=id,media_type,media_url,timestamp,permalink&access_token=${access_token}&limit=${limit}`;
        return this.makeHttpsRequest(url);
    },

    // Récupère l'ig_account_id à partir d'un username Instagram
    getInstagramAccountIdFromUsername: async function (username, access_token) {
        // Méthode 1: Via Facebook Graph API (si le username est une page Facebook)
        try {
            const url = `https://graph.facebook.com/v18.0/${username}?fields=instagram_business_account&access_token=${access_token}`;
            const result = await this.makeHttpsRequest(url);
            if (result.instagram_business_account && result.instagram_business_account.id) {
                return result.instagram_business_account.id;
            }
        } catch (error) {
            // Si ça ne fonctionne pas, on essaie la méthode 2
        }

        // Méthode 2: Recherche directe via Instagram Graph API
        try {
            // Note: Cette méthode nécessite que le username soit un compte Business/Creator
            const url = `https://graph.instagram.com/${username}?fields=id&access_token=${access_token}`;
            const result = await this.makeHttpsRequest(url);
            return result.id;
        } catch (error) {
            // Si les deux méthodes échouent, on retourne null
            return null;
        }
    },

    // Fonction utilitaire pour faire des requêtes HTTPS
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

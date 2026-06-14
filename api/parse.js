const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    const { qr_url } = req.body;
    try {
        // Το axios θα ακολουθήσει αυτόματα το redirect της ΑΑΔΕ
        const response = await axios.get(qr_url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 5 
        });
        
        const $ = cheerio.load(response.data);
        
        // Ψάχνουμε για το ποσό στη σελίδα του παρόχου
        // Πρέπει να δοκιμάσουμε ένα generic pattern που πιάνει τα περισσότερα sites
        let total = "0";
        $('div, span, td, b').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes("Συνολική Αξία") || text.includes("Τελικό Ποσό")) {
                total = $(el).next().text().trim() || $(el).parent().text().trim();
            }
        });

        return res.status(200).json({ found_total: total });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

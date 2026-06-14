const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    const { qr_url, row_id } = req.body;
    try {
        const response = await axios.get(qr_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = response.data;
        const $ = cheerio.load(html);

        // Βρίσκουμε το κείμενο που περιέχει τα νούμερα
        const text = $('body').text();

        // Εδώ χρησιμοποιούμε "μαγνήτες" (Regular Expressions) για να βρούμε τα ποσά
        // Ψάχνει για τη λέξη Τελικό και παίρνει το νούμερο μετά
        const totalMatch = text.match(/Τελικό\s*[\d\.,]+/i);
        const total = totalMatch ? totalMatch[0].replace(/[^0-9,]/g, '').replace(',', '.') : "0";

        // Επιστρέφουμε τα αποτελέσματα στο AppSheet (προαιρετικά για debug)
        return res.status(200).json({
            message: "Success",
            found_total: total
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const axios = require('axios');

module.exports = async (req, res) => {
    const { qr_url } = req.body;
    try {
        // 1. Παίρνουμε το αρχικό link της ΑΑΔΕ και αναγκάζουμε το axios να ακολουθήσει το redirect
        const response = await axios.get(qr_url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            maxRedirects: 5 
        });

        // 2. Επειδή η σελίδα της Impact έχει τα δεδομένα σε μορφή JSON μέσα στο HTML, 
        // θα τα "ψαρέψουμε" με ένα pattern
        const html = response.data;
        const jsonMatch = html.match(/var\s+model\s*=\s*(\{.*?\});/s);

        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[1]);
            
            // 3. Εξάγουμε τα στοιχεία
            return res.status(200).json({
                found_total: data.TotalAmount || "0",
                supplier: data.IssuerName || "",
                invoice_number: data.InvoiceNumber || ""
            });
        }

        return res.status(200).json({ error: "Δεν βρέθηκαν δεδομένα στη σελίδα" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};const axios = require('axios');
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

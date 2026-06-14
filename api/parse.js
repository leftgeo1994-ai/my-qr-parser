const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    const { qr_url } = req.body;
    try {
        const response = await axios.get(qr_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);
        
        // Ψάχνουμε το τελευταίο κελί που περιέχει την ένδειξη Τελικό
        // Στην Impact, τα ποσά είναι μέσα σε κελιά (td) ή divs
        const texts = [];
        $('div, td').each((i, el) => {
            const val = $(el).text().trim();
            if (val) texts.push(val);
        });

        // Ψάχνουμε για τη λέξη "Τελικό" και παίρνουμε την αμέσως επόμενη τιμή που μοιάζει με ποσό
        let total = "0";
        for (let i = 0; i < texts.length; i++) {
            if (texts[i] === "Τελικό") {
                total = texts[i + 1]; // Το ποσό είναι συνήθως ακριβώς μετά
                break;
            }
        }

        return res.status(200).json({
            found_total: total
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

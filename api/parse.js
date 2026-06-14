const axios = require('axios');

module.exports = async (req, res) => {
    const { qr_url } = req.body;
    
    // Αν δεν έρθει URL, μην κρασάρεις
    if (!qr_url) return res.status(200).json({ error: "Δεν λήφθηκε URL" });

    try {
        const response = await axios.get(qr_url, { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            maxRedirects: 5 
        });
        
        // Παίρνουμε όλο το HTML σε κείμενο
        const html = response.data;
        
        // Στέλνουμε πίσω ένα κομμάτι του κώδικα για να δούμε τι βλέπει το Vercel
        return res.status(200).json({
            status: "OK",
            preview: html.substring(0, 500) 
        });
    } catch (error) {
        // Αν κρασάρει, στείλε το σφάλμα στο AppSheet αντί να το πετάξεις
        return res.status(200).json({ error: error.message });
    }
};

const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send("Μόνο POST");
    
    try {
        const { qr_url } = req.body;
        const response = await axios.get(qr_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        // Επιστρέφει το πρώτο κομμάτι της σελίδας για να δούμε αν συνδέθηκε
        const preview = response.data.substring(0, 500); 
        return res.status(200).json({ status: "OK", preview: preview });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

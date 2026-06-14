const axios = require('axios');

module.exports = async (req, res) => {
    try {
        const { qr_url } = req.body;
        
        // Χρησιμοποιούμε headers που κάνουν το αίτημα να φαίνεται 100% σαν κανονικός browser
        const response = await axios.get(qr_url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'el-GR,el;q=0.9,en;q=0.8'
            },
            maxRedirects: 5 
        });

        // Αν όλα πάνε καλά, στέλνουμε το status 200
        return res.status(200).json({ 
            status: "Success",
            final_url: response.request.res.responseUrl // Θα μας πει πού ακριβώς μας έστειλε η ΑΑΔΕ
        });
    } catch (error) {
        // Αν αποτύχει, θα μας πει γιατί ακριβώς απέτυχε
        return res.status(200).json({ 
            error: "Το αίτημα απέτυχε",
            details: error.message 
        });
    }
};

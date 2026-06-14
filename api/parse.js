const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: "Μόνο POST επιτρέπεται" });

    const { qr_url, row_id } = req.body;
    try {
        const response = await axios.get(qr_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);
        const pageText = $('body').text();

        // Εξαγωγή βασικών στοιχείων
        let προμηθευτής = ($('div:contains("Στοιχεία Πελάτη")').prev().text() || "").trim();
        let ημερομηνία = (pageText.match(/Ημερομηνία Έκδοσης\s*(\d{2}\/\d{2}\/\d{4})/i) || ["", ""])[1];
        let αρ_παραστατικού = (pageText.match(/Αριθμός\s*([A-Za-z0-9]+)/i) || ["", ""])[1];

        // Υπολογισμός συνόλων από τον πίνακα
        let καθαρή = 0, φπα24 = 0, σύνολο = 0;
        
        // Ψάχνουμε τα κελιά του πίνακα. Οι τιμές "Καθαρή Αξία", "ΦΠΑ", "Τελικό" είναι σειριακά.
        // Αυτή είναι μια απλή προσέγγιση για να πιάσουμε τα νούμερα του πίνακα:
        const rows = $('div.row'); // Προσαρμογή ανάλογα με τη δομή της Impact
        
        // Εναλλακτικά, επειδή η δομή είναι συγκεκριμένη, ας πάρουμε τα νούμερα από το κείμενο:
        const amounts = pageText.match(/[\d\.,]{4,}/g).map(n => parseFloat(n.replace(/\./, '').replace(',', '.')));
        
        // Σημείωση: Τα παραστατικά της Impact έχουν το τελικό ποσό συνήθως στο τέλος
        σύνολο = amounts[amounts.length - 1]; // Το τελευταίο μεγάλο νούμερο είναι το τελικό

        const appId = "YOUR_APP_ID"; 
        const accessKey = "YOUR_ACCESS_KEY";

        await axios.post(`https://api.appsheet.com/api/v2/apps/${appId}/tables/ΚΙΝΗΣΕΙΣ/Action`, {
            "Action": "Edit",
            "Properties": { "Locale": "en-US" },
            "Rows": [{
                "ID": row_id,
                "ΠΡΟΜΗΘΕΥΤΗΣ": "ΑΝΔΡΕΑΚΟΣ ΔΗΜΗΤΡΙΟΣ",
                "ΗΜΕΡΟΜΗΝΙΑ": ημερομηνία,
                "ΑΡ. ΠΑΡΑΣΤΑΤΙΚΟΥ": αρ_παραστατικού,
                "ΤΕΛΙΚΗ ΑΞΙΑ": σύνολο.toFixed(2)
            }]
        }, { headers: { 'ApplicationAccessKey': accessKey } });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

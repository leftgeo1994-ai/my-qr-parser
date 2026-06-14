const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: "Μόνο POST επιτρέπεται" });

    const { qr_url, row_id } = req.body;
    if (!qr_url || !row_id) return res.status(400).json({ error: "Λείπουν στοιχεία" });

    try {
        // 1. Κατέβασμα της σελίδας του τιμολογίου
        const response = await axios.get(qr_url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const pageText = $('body').text();

        // 2. Έξυπνη ανάγνωση με βάση τις στήλες σου
        let προμηθευτής = (pageText.match(/(?:Εκδότης|Επωνυμία|Προμηθευτής)\s*:?\s*([^\n\r]+)/i) || [])[1] || "";
        let ημερομηνία = (pageText.match(/(?:Ημερομηνία|Ημ\/νία)\s*:?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i) || [])[1] || "";
        let αρ_παραστατικού = (pageText.match(/(?:Αριθμός|Αρ\.\s*Παραστατικού|Αρ\.Παρ\.)\s*:?\s*([A-Za-z0-9\-]+)/i) || [])[1] || "";
        
        // Καθαρισμός και μετατροπή αριθμών (από 1.000,00 σε 1000.00)
        const parseAmount = (regex) => {
            const match = pageText.match(regex);
            if (!match) return "0.00";
            return match[1].replace(/\./g, '').replace(',', '.').trim();
        };

        let καθαρή_αξία = parseAmount(/(?:Καθαρή Αξία|Καθαρό Ποσό)\s*:?\s*([\d\.,]+)/i);
        let τελική_αξία = parseAmount(/(?:Σύνολο Πληρωτέο|Τελικό Σύνολο|Πληρωτέο|Σύνολο|Τελική Αξία)\s*:?\s*([\d\.,]+)/i);
        
        // Διαχωρισμός ΦΠΑ ανά συντελεστή
        let φπα_6 = parseAmount(/(?:ΦΠΑ\s*6%|6%\s*ΦΠΑ|Φ\.Π\.Α\.\s*6%)\s*:?\s*([\d\.,]+)/i);
        let φπα_13 = parseAmount(/(?:ΦΠΑ\s*13%|13%\s*ΦΠΑ|Φ\.Π\.Α\.\s*13%)\s*:?\s*([\d\.,]+)/i);
        let φπα_24 = parseAmount(/(?:ΦΠΑ\s*24%|24%\s*ΦΠΑ|Φ\.Π\.Α\.\s*24%)\s*:?\s*([\d\.,]+)/i);

        // 3. Απευθείας ενημέρωση του AppSheet στις δικές σου στήλες
        // ⚠️ Βάλε εδώ το δικό σου App ID και Access Key από το Βήμα 1
        const appId = "6bf9bcfa-57dc-4091-a38e-10e1d7d6c3e5"; 
        const accessKey = "V2-rrGHx-ovpvS-ZtzJA-mkJTX-bkpsd-CNxJz-NyxUT-rDbG7";

        await axios.post(`https://api.appsheet.com/api/v2/apps/${appId}/tables/ΚΙΝΗΣΕΙΣ/Action`, {
            "Action": "Edit",
            "Properties": { "Locale": "en-US" },
            "Rows": [{
                "ID": row_id,
                "ΠΡΟΜΗΘΕΥΤΗΣ": προμηθευτής.trim().substring(0, 50),
                "ΗΜΕΡΟΜΗΝΙΑ": ημερομηνία,
                "ΑΡ. ΠΑΡΑΣΤΑΤΙΚΟΥ": αρ_παραστατικού,
                "ΚΑΘΑΡΗ ΑΞΙΑ": καθαρή_αξία,
                "ΑΞΙΑ ΦΠΑ 6": φπα_6,
                "ΑΞΙΑ ΦΠΑ 13": φπα_13,
                "ΑΞΙΑ ΦΠΑ 24": φπα_24,
                "ΤΕΛΙΚΗ ΑΞΙΑ": τελική_αξία
            }]
        }, {
            headers: { 'ApplicationAccessKey': accessKey }
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

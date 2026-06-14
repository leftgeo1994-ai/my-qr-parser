module.exports = async (req, res) => {
    try {
        const { qr_url } = req.body;
        // Δεν κάνουμε κλήση στη σελίδα, απλά επιστρέφουμε το QR Link
        // για να δούμε αν η επικοινωνία AppSheet -> Vercel είναι σταθερή.
        return res.status(200).json({
            message: "Το Vercel ζει!",
            url_received: qr_url
        });
    } catch (error) {
        return res.status(200).json({ error: "Κάτι πήγε στραβά" });
    }
};

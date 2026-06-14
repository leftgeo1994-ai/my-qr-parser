module.exports = async (req, res) => {
    // Απλή απάντηση για να δούμε αν το Webhook του AppSheet φτάνει ποτέ στο Vercel
    return res.status(200).json({ 
        message: "Το Webhook έφτασε!", 
        data_received: req.body 
    });
};

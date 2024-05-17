function getSessionMessage(req, res) {
    if (!req.session.message) {
        return res.json({});
    }
    return res.json({ message: req.session.message, isError: req.session.isError });
}

function clearSessionMessage(req, res) {
    req.session.message = null;
    req.session.isError = null;
    return res.json(true);
}

module.exports = {
    getSessionMessage,
    clearSessionMessage,
};

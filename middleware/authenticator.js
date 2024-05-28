// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    // Check if user is authenticated
    if (!req.session.user) {
        return res.redirect("/login");
    }

    // Check if session has expired
    if (req.session.cookie.expires < Date.now()) {
        req.session.destroy();
        return res.redirect("/login");
    }
    return next();
};

const forceLogout = (req, res, next) => {
    if (req.session.user) {
        req.session.destroy();
    }
    if (next) {
        return next();
    }
};

module.exports = {
    checkAuth,
    forceLogout,
};

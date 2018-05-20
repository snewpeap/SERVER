module.exports = {
    checkLogin: function checkLogin (req, res, next) {
        if (!req.session.user) {
            return next(new Error('未处于登陆状态'));
        }
        next();
    },

    checkNotLogin: function checkNotLogin (req, res, next) {
        if (req.session.user) {
            return next(new Error('已处于登陆状态'));
        }
        next();
    }
};

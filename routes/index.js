module.exports = function (app) {
    app.get('/', function (req, res) {
    });
    app.use('/signup', require('./signup'));
    app.use('/signin', require('./signin'));
    app.use('/signout', require('./signout'));
    app.use('/posts', require('./posts'));
    app.use('/comments', require('./comments'));
    app.use('/historys',require('./historys'));
    app.use(function (err, req, res, next) {
        let error = err.message;
        if (res.headersSent){
            return next(err);
        } else {
            res.status(500).json({error: error});
        }
    })
};

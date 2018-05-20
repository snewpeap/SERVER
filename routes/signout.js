const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', checkLogin, function (req, res, next) {
    // 清空 session 中用户信息
    try {
        req.session.user = null;
        res.status(200).end();
    }catch (e) {
        return next(e);
    }
});


module.exports = router;

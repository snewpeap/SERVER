const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
    console.log('Someone is login');
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
    const name = req.fields.name? req.fields.name : req.session.name;
    const password = req.fields.password? sha1(req.fields.password) : req.session.password;
    console.log(`raw:     ${name}     ${password}`);
    // 校验参数
    try {
        if (!name.length) {
            throw new Error('请填写用户名');
        }
        if (!password.length) {
            throw new Error('请填写密码');
        }
    } catch (e) {
        return next(e);
    }

    UserModel.getUserByName(name)
        .then(function (user) {
            console.log(`database:${user.name}     ${user.password}`);
            if (!user) {
                throw new Error('用户不存在');
            }
            // 检查密码是否匹配
            if (password !== user.password) {
                throw new Error('密码错误');
            }
            // 用户信息写入 session
            req.session.user = user;
            res.status(200).send({message:"登陆成功",nickname:user.nickname});
        })
        .catch(next);
});

module.exports = router;

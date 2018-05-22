const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function (err, req, res, next) {
    if (req.cookies.user) {
        if (err.message.match('已处于登陆状态')) {
            console.log('logged user logging');
        }
        if (req.session.id === req.cookies.user.id) {
            res.status(200).send({message: "登陆成功",userData:{id:req.session.user._id,nickname:req.session.user.nickname}});
            return;
        }else {
            res.status(666).send({message: "登录失败"});
            return;
        }
    } else{
        res.status(666).send({message:"登陆过期，请重新登陆"});
        return;
    }
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
    const name = req.fields.name;
    const password = sha1(req.fields.password);
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
            delete user.password;
            req.session.user = user;
            res.cookie('user',{id:req.session.id},{maxAge:604800000});
            res.status(200).send({message:"登陆成功",userData:{id:req.session.user._id,nickname:req.session.user.nickname}});
        })
        .catch(next);
});

module.exports = router;

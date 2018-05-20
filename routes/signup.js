const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const express = require('express');
const router = express.Router();

const UserModel = require('../models/users');
//const checkNotLogin = require('../middlewares/check').checkNotLogin;

router.get('/', function (req, res, next) {
    console.log('Someone is registering');
});

// POST /signup 用户注册
router.post('/', function (req, res, next) {
    console.log(`Registering,username:${req.fields.username},nickname:${req.fields.nickname},password:${req.fields.password}`);
    const username = req.fields.username;
    const nickname = req.fields.nickname;
    //const avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;

    // 校验参数
    try {
        if (!(username.length >= 5 && username.length <= 10)) {
            throw new Error('用户名限制在 5-10 个英文字母');
        }
        if (!(/^[A-z]{5,20}$/.test(username))) {
            throw new Error('用户名不符合格式');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (nickname.length === 0 || nickname.replace(/(^\s*)|(\s*$)/g, "") === '') {
            throw new Error('昵称不能为空');
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        //fs.unlink(req.files.avatar.path);
        return next(e);
    }

    // 明文密码加密
    password = sha1(password);
    console.log(`sha1:${sha1(password)}`);

    // 待写入数据库的用户信息
    let user = {
        name: username,
        password: password,
        nickname: nickname,
    };
    console.log('making');
    // 用户信息写入数据库
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            console.log('inserting');
            user = result.ops[0];
            // 删除密码这种敏感信息，将用户信息存入 session
            console.log('success');
            res.status(200).send({message:'注册成功'});
        })
        .catch(function (e) {
            // 注册失败，异步删除上传的头像
            //fs.unlink(req.files.avatar.path);
            if (e.message.match('duplicate key')) {
                let err = new Error('用户名已存在');
                return next(err);
            }
        })
});

module.exports = router;

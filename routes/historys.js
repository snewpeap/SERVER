const express = require('express');
const router = express.Router();
const HistoryModel = require('../models/historys');
const checkLogin = require('../middlewares/check').checkLogin;

// GET /historys/get 当前用户的所有历史
router.get('/get', checkLogin, function (req, res, next) {
    const author = req.session.user._id;

    HistoryModel.getHistory(author)
        .then(function (history) {
            res.status(200).json({history:history});
        })
        .catch(next)
});

// POST /historys/create 上传一条历史
router.post('/create', checkLogin, function (req, res, next){
    const author = req.session.user._id;
    const title = req.fields.title;
    const length = req.fields.length;
    let date = new Date();

    let history = {
        author: author,
        title: title,
        length:length,
        date: date,
    };

    HistoryModel.create(history)
        .then(function (result) {
            history = result.ops[0];
            res.status(200).send({message:"上传专注完成"});
        })
        .catch(next);
});

// GET /historys/:historyId/remove 删除一条历史
router.get('/:historyId/remove', checkLogin, function (req, res, next) {
    const historyId = req.params.historyId;
    const author = req.session.user._id;

    HistoryModel.getHistoryById(historyId)
        .then(function (history) {
            if (!history){
                throw new Error('历史不存在或已被删除');
            }
            if (history.author.toString() !== author.toString()){
                throw new Error('没有权限');
            }
            HistoryModel.delHistoryById(historyId)
                .then(function () {
                    res.status(200).send({message:'删除成功'});
                })
                .catch(next);
        })
        .catch(next);
});

module.exports = router;

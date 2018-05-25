const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;
const FavoriteModel = require('../models/favorite');

// POST /favorite/:postId/create 收藏
router.post('/:postId/create', checkLogin,function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;

    const favorite = {
        author:author,
        postId: postId,
    };

    FavoriteModel.getFavoriteByPostIdAndAuthor(postId, author)
        .then(function (favor) {
            if (favor){
                throw new Error('收藏失败，请尝试刷新');
            }
        FavoriteModel.create(favorite)
            .then(function () {
                res.status(200).send({message:'收藏成功'});
        }).catch(next)
    }).catch(next);
});

//GET /favorite/:postId/remove
router.get('/:postId/remove', checkLogin,function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;

    FavoriteModel.getFavoriteByPostIdAndAuthor(postId, author)
        .then(function (favor) {
            if (!favor){
                throw new Error('取消收藏失败，请尝试刷新');
            }
            if (favor.author.toString() !== author.toString()) {
                throw new Error('没有权限取消收藏');
            }
            FavoriteModel.delFavoriteByPostIdAndAuthor(postId,author)
                .then(function () {
                    res.status(200).send({message:'取消收藏成功'});
                }).catch(next)
        }).catch(next)
});

//GET /favorite/get
router.get('/get', checkLogin,function (req, res, next) {
    const author = req.session.user._id;

    FavoriteModel.getFavorite()
        .then(function (favors) {
            res.status(200).send({favorites:favors});
        })
        .catch(next)
});

module.exports = router;

const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;
const CommentModel = require('../models/comments');

// POST /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const postId = req.fields.postId;
    const content = req.fields.content;

    // 校验参数
    try {
        if (!content.length) {
            throw new Error('请填写内容');
        }
    } catch (e) {
        return next(e);
    }

    const comment = {
        author: author,
        postId: postId,
        content: content
    };

    CommentModel.create(comment)
        .then(function () {
            res.status(200).send({message:'评论成功'});
        })
        .catch(next);
});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
    const commentId = req.params.commentId;
    const author = req.session.user._id;

    CommentModel.getCommentById(commentId)
        .then(function (comment) {
            if (!comment) {
                throw new Error('不存在');
            }
            if (comment.author.toString() !== author.toString()) {
                throw new Error('没有权限删除');
            }
            CommentModel.delCommentById(commentId)
                .then(function () {
                    res.status(200).send({message:'删除成功'});
                })
                .catch(next);
        })
});

module.exports = router;

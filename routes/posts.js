const express = require('express');
const router = express.Router();
const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
const checkLogin = require('../middlewares/check').checkLogin;
const moment = require('moment');

// GET /posts 所有用户的文章页
// GET /posts?type=normal&author=balabala
router.get('/', function (req, res, next) {
    const type = req.query.type;
    const author = req.query.author;

    PostModel.getPosts(type,author)
        .then(function (posts) {
            res.status(200).json({posts:posts});
        })
        .catch(next)
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const content = req.fields.content;
    const type = req.fields.type;
    let date = moment().toDate();

    // 校验参数
    try {
        if (!content.length) {
            throw new Error('请填写内容');
        }
        if (['normal', 'jingyan'].indexOf(type) === -1){
            throw new Error('非法的类型');
        }
    } catch (e) {
        return next(e);
    }

    let post = {
        author: author,
        content: content,
        type: type,
        date: date,
    };

    PostModel.create(post)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            post = result.ops[0];
            res.status(200).send({message:"发布成功"});
        })
        .catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
    console.log('Someone is writing');
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
    const postId = req.params.postId;

    Promise.all([
        PostModel.getPostById(postId), // 获取文章信息
        CommentModel.getComments(postId), // 获取该文章所有留言
    ])
        .then(function (result) {
            const post = result[0];
            const comments = result[1];
            if (!post) {
                throw new Error('不存在')
            }

            res.status(200).send({
                post: post,
                comments: comments
            })
        })
        .catch(next)
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;

    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('不存在')
            }
            if (author.toString() !== post.author._id.toString()) {
                throw new Error('权限不足')
            }
            res.status(200).send({post:post});
        })
        .catch(next)
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;
    const content = req.fields.content;

    // 校验参数
    try {
        if (!content.length) {
            throw new Error('请填写内容')
        }
    } catch (e) {
        return next(e);
    }

    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('不存在')
            }
            if (post.author._id.toString() !== author.toString()) {
                throw new Error('没有权限')
            }
            PostModel.updatePostById(postId, { content: content })
                .then(function () {
                    res.status(200).send({message:'修改成功'});
                })
                .catch(next)
        })
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;

    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('不存在')
            }
            if (post.author._id.toString() !== author.toString()) {
                throw new Error('没有权限')
            }
            PostModel.delPostById(postId)
                .then(function () {
                    res.status(200).send({message:'删除成功'});
                })
                .catch(next)
        })
});

module.exports = router;

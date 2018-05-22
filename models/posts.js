const Post = require('../lib/mongo').Post;
const CommentModel = require('./comments');

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
    afterFind: function (posts) {
        return Promise.all(posts.map(function (post) {
            return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                post.commentsCount = commentsCount;
                return post;
            })
        }))
    },
    afterFindOne: function (post) {
        if (post) {
            return CommentModel.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count;
                return post;
            })
        }
        return post;
    }
});
module.exports = {
    // 创建一篇文章
    create: function create (post) {
        return Post.create(post).exec();
    },
    // 通过文章 id 获取一篇文章
    getPostById: function getPostById (postId) {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .addCreatedAt()
            .addCommentsCount()
            .exec()
    },
    getRawPostById: function getRawPostById (postId) {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .exec()
    },

// 通过文章 id 更新一篇文章
    updatePostById: function updatePostById (postId, data) {
        return Post.update({ _id: postId }, { $set: data }).exec()
    },

// 通过文章 id 删除一篇文章
    delPostById: function delPostById (postId) {
        return Post.deleteOne({ _id: postId })
            .exec()
            /*
            .then(function (res) {
                // 文章删除后，再删除该文章下的所有留言
                if (res.result.ok && res.result.n > 0) {
                    return CommentModel.delCommentsByPostId(postId)
                }
            })
            */
    },

    // 按创建时间降序获取所有用户文章或者某个特定类型的所有文章
    getPosts: function getPosts (author,type) {
        const query = {};
        if (author){
            query.author = author;
        }
        if (type) {
            query.type = type;
        }
        return Post
            .find(query)
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: -1 })
            .addCreatedAt()
            //.addCommentsCount()
            .exec()
    },
};

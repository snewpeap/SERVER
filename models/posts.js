const Post = require('../lib/mongo').Post;
const FavoriteModel = require('../models/favorite');

// 给 post 添加数 FavoriteCount
Post.plugin('addFavoriteCount', {
    afterFind: function (posts) {
        return Promise.all(posts.map(function (post) {
            return FavoriteModel.getFavoriteCount(post._id.toString()).then(function (favoriteCount) {
                post.favoriteCount = favoriteCount;
                return post;
            })
        }))
    },
    afterFindOne: function (post) {
        if (post) {
            return FavoriteModel.getFavoriteCount(post._id.toString()).then(function (count) {
                post.favoriteCount = count;
                return post;
            })
        }
        return post;
    }
});
Post.plugin('addIsFavorite',{
    afterFind: function (posts, opt) {
        return Promise.all(posts.map(function (post) {
            return FavoriteModel.getFavoriteByPostIdAndAuthor(post._id.toString(), opt.author)
                .then(function (favor) {
                    if (favor){
                        post.isFavorite = true;
                    } else {
                        post.isFavorite = false;
                    }
                    return post;
            })
        }))
    },
    afterFindOne: function (post, opt) {
        if (post) {
            return FavoriteModel.getFavoriteByPostIdAndAuthor(post._id.toString(),opt.author)
                .then(function (favor) {
                    if (favor){
                        post.isFavorite = true;
                    } else {
                        post.isFavorite = false;
                    }
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
    getPostById: function getPostById (postId,requester) {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .addIsFavorite({author:requester})
            .addFavoriteCount()
            .addCreatedAt()
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
            .then(function (res) {
                // 文章删除后，再删除该文章下的所有收藏
                if (res.result.ok && res.result.n > 0) {
                    return FavoriteModel.delFavoriteByPostId(postId)
                }
            })

    },

    // 按创建时间降序获取所有用户文章或者某个特定类型的所有文章
    getPosts: function getPosts (type,author,requester) {
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
            .addIsFavorite({author:requester})
            .addFavoriteCount()
            .addCreatedAt()
            .exec()
    },

    getPosts2: function getPosts2 (requester, count) {
        return Post
            .find({type:'jingyan'})
            .populate({ path: 'author', model: 'User' })
            .sort({ _id:-1})
            .limit(parseInt(count))
            .addIsFavorite({author:requester})
            .addFavoriteCount()
            .addCreatedAt()
            .exec()
    },

    getPosts3: function getPosts3 (requester, tag, type, count) {
        const query = {};
        if (tag){
            query.tag = tag;
        }
        if (type){
            query.type = type;
        }

        return Post
            .find(query)
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: -1 })
            .addIsFavorite({author:requester})
            .limit(count?parseInt(count):0)
            .addFavoriteCount()
            .addCreatedAt()
            .exec()
    }
};

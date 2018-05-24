const Favorite = require('../lib/mongo').Favorite;

module.exports = {
    //点赞收藏
    create: function create (favorite) {
        return Favorite.create(favorite).exec();
    },

    //删除推文的所有收藏
    delFavoriteByPostId: function delFavoriteByPostId (postId) {
        return Favorite.deleteMany({ postId: postId.toString() }).exec();
    },

    //获取推文时获取收藏
    getFavorite: function getFavorite (author) {
        return Favorite
            .find({author:author})
            .populate({ path:'postId', model: 'Post' })
            .addCreateAt()
            .exec();
    },

    //获得一条收藏
    getFavoriteByPostIdAndAuthor:function getFavoriteByPostIdAndAuthor (postId, author){
        return Favorite.findOne({postId:postId.toString(), author:author}).exec();
    },

    //取消收藏
    delFavoriteByPostIdAndAuthor: function delFavoriteByPostIdAndAuthor (postId, author){
        return Favorite.deleteOne({postId:postId.toString(), author:author}).exec();
    },

    //推文的收藏数
    getFavoriteCount: function getFavoriteCount (postId) {
        return Favorite.count({postId:postId.toString()}).exec();
    },
};

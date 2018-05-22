const config = require('config-lite')(__dirname);
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
mongolass.connect(config.mongodb);
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');

exports.User = mongolass.model('User', {
    name: { type: 'string', required: true },
    password: { type: 'string', required: true },
    nickname: { type: 'string', required: true },
    //avatar: { type: 'string', required: false },
    //gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId, required: true },
    content: { type: 'string', required: true },
    type: {type: 'string', enum:['normal', 'jingyan'], default: 'normal'},
    date: {type: Mongolass.Types.Date, required: true },
    //like: { type: 'number', default: 0 }, TODO
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.Comment = mongolass.model('Comment', {
    author: { type: Mongolass.Types.ObjectId, required: true },
    content: { type: 'string', required: true },
    postId: { type: Mongolass.Types.ObjectId, required: true }
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序

exports.History = mongolass.model('History', {
    author:{ type: Mongolass.Types.ObjectId, required: true },
    title:{type: 'string', required:true},
    length:{ type: Mongolass.Types.Number, required:true},
    date: {type: Mongolass.Types.Date, required: true },
    //todo tags
});
exports.History.index({author: 1, _id: -1}).exec();//通过用户id获取用户的专注历史，按降序查看

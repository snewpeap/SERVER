const History = require('../lib/mongo').History;

module.exports = {
    //创建一条专注历史
    create: function create (history) {
        return History.create(history).exec();
    },

    //通过历史id获取一条历史
    getHistoryById: function getHistoryById(historyId) {
        return History.findOne({ _id: historyId }).exec();
    },

    //通过历史id删除一条历史
    delHistoryById: function delHistoryById (historyId){
        return History.deleteOne({_id: historyId}).exec();
    },

    //通过用户id获取用户所有历史，按降序排列
    getHistory: function getHistory (author){
        return History
            .find({author:author})
            .populate({ path: 'author', model: 'User'})
            .sort({_id:-1})
            .addCreatedAt()
            .exec()
    },
};

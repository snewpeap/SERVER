module.exports = {
    port: 8888,
    session: {
        secret: 'ELContest',
        key: 'ELContest',
        maxAge: 2592000000
    },
    mongodb: 'mongodb://localhost:27017/ELContest'
};

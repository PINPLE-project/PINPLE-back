module.exports = function(app) {
    const user = require('./userController');

    // 테스트용 API
    app.get('/app/test', user.test);
}
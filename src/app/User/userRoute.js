const jwtMiddleware = require('../../../config/jwtMiddleware');

module.exports = function(app) {
    const user = require('./userController');

    // 테스트용 API
    app.get('/app/test', user.test);
    
    // 테스트용 화면
    app.get('/', (req, res) => {
        res.send(`
            <h1>회원가입 및 로그인</h1>
            <a href="/google/login">Log in</a><br>
            <a href="/google/signup">Sign up</a><br>
            <a href="/auth/kakao">카카오 Log in</a><br>
        `);
    });

    // 구글 로그인 API
    // 로그인할 때 jwt 발급
    app.get('/google/login', user.googleLogin);
    app.get('/google/login/redirect', user.googleLoginRe);

    // 구글 회원가입 API
    app.get('/google/signup', user.googleSignup);
    app.get('/google/signup/redirect', user.googleSignupRe);

    // 카카오 로그인 및 회원가입 API
    app.get('/auth/kakao', user.kakaoLogin);
    app.get('/auth/kakao/callback', user.kakaoLoginRe);
}
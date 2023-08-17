const jwtMiddleware = require('../../../config/jwtMiddleware');

module.exports = function(app) {
    const user = require('./userController');

    // 테스트용 API
    app.get('/app/test', user.test);
    
    // 테스트용 화면
    app.get('/login', (req, res) => {
        // res.send(`
        //     <h1>회원가입 및 로그인</h1>
        //     <a href="/google/login">구글 Log in</a><br>
        //     <a href="/google/signup">Sign up</a><br>
        //     <a href="/auth/kakao">카카오 Log in</a><br>
        //     <a href="/auth/kakao/unlink">카카오 탈퇴</a>
        // `);
        res.send(`
        <h1>회원가입 및 로그인</h1>
        <a href="/google/login">구글 Log in</a><br>
        <a href="/auth/kakao">카카오 Log in</a><br>
        <a href="/auth/kakao/unlink">Logout</a>
    `);
    });

    // 구글 로그인 API
    // 로그인할 때 jwt 발급
    app.get('/google/login', user.googleLogin); // 사용 안해도 자동으로 회원가입 기능에서 로그인까지 작동
    app.get('/google/login/redirect', user.googleLoginRe);

    // 구글 로그인 및 회원가입 API
    app.get('/google/signup', user.googleSignup);
    app.get('/google/signup/redirect', user.googleSignupRe);

    // 카카오 로그인 및 회원가입 API
    app.get('/auth/kakao', user.kakaoLogin);
    app.get('/auth/kakao/callback', user.kakaoLoginRe);

    // 닉네임 및 캐릭터 설정 회원가입
    app.patch('/app/users', jwtMiddleware, user.patchSignup);

    // 카카오 로그아웃 API
    app.get('/app/users/logout/kakao', jwtMiddleware, user.kakaoLogout);

    // 구글 로그아웃 API
    app.get('/app/users/logout/google', jwtMiddleware, user.googleLogout);

    // app.get('/auth/kakao/unlink', user.kakaoDelete);
}
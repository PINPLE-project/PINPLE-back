module.exports = {
    // 성공
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "DB 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    SIGNIN_ID_WRONG : { "isSuccess": false, "code": 3002, "message": "아이디가 잘못 되었습니다." },

    SIGNUP_NICKNAME_EMPTY: { "isSuccess": false, "code": 2001, "message": "닉네임을 입력해주세요." },
    SIGNUP_NICKNAME_EXIST: { "isSuccess": false, "code": 2002, "message": "중복된 닉네임입니다." },
    SIGNUP_NICKNAME_IMPERTINENCE: { "isSuccess": false, "code": 2003, "message": "부적절한 닉네임입니다." },
    SIGNUP_CHARACTER_EMPTY: { "isSuccess": false, "code": 2004, "message": "가 잘못 되었습니다." },
}
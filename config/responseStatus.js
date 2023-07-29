module.exports = {
    // 성공
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "DB 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
    
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    SIGNIN_ID_WRONG : { "isSuccess": false, "code": 3002, "message": "아이디가 잘못 되었습니다." },
}
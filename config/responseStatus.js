module.exports = {
    // 성공
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "DB 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"}
}
const { pool } = require("../../../config/database");
const userDao = require("./userDao");
const userProvider = require("./userProvider");
const baseResponse = require("../../../config/responseStatus");
const {response, errResponse} = require("../../../config/response");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");

exports.postSignIn = async function(id) {
    try {
        // 아이디 존재 확인
        const idRows = await userProvider.idCheck(id);
        if (idRows.length < 1)
            return errResponse(baseResponse.SIGNIN_ID_WRONG);

        // 계정 상태 확인
        // const userInfoRows = await userProvider.accountCheck(id);

        // // 0: 탈퇴, 1: 활성
        // if (userInfoRows[0].status === 0) {
        //     return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        // } 

        // console.log(userInfoRows[0].userId)

        // 토큰 생성
        let token = await jwt.sign(
            {
                userId: id,
            }, // 토큰 내용
            secret_config.jwtsecret, 
            // 유효기간 365일
            {
                expiresIn: "365d",
                subject: "user"
            }
        );

        return response(baseResponse.SUCCESS, {'userId': id, 'jwt': token});

    } catch (err) {
        console.log(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
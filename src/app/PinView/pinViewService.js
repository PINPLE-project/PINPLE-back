const { pool } = require("../../../config/database");
const pinViewDao = require("./pinViewDao");
const pinViewProvider = require("./pinViewProvider");
const baseResponse = require("../../../config/responseStatus");
const {response, errResponse} = require("../../../config/response");

//핀지도 생성
exports.createPin = async function (userId, longitude, latitude, address, pinCongest, pinFeeling, contents) {
    try {

        const insertPinParams = [userId, longitude, latitude, address, pinCongest, pinFeeling, contents];

        const connection = await pool.getConnection(async (conn) => conn);

        const pinIdResult = await pinViewDao.insertPin(connection, insertPinParams);
        const nearByPinIdResult = await pinViewDao.insertNearByPin(connection);
        // console.log(`추가된 핀지도 : ${pinIdResult[0]}`)
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createPin Service error\n: ${err.message}`);
        console.log("createPin error");
        return errResponse(baseResponse.DB_ERROR);
    }
};

//핀지도 삭제
exports.deletePin = async function(pinId){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const pinIdResult = await pinViewDao.deletePin(connection, pinId);
        // console.log(`삭제된 핀지도 : ${pinIdResult[0]}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - deletePin Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

//도움이 되었어요
exports.postPinLike = async function(pinId, userId){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const likeCountResult = await pinViewDao.updatePinLikeCount1(connection, pinId);
        const likeUserResult = await pinViewDao.insertPinLikeUser(connection, pinId, userId);
        
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - postPinLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

//도움이 되었어요 취소
exports.deletePinLike = async function(pinId, userId){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const likeCountResult = await pinViewDao.updatePinLikeCount2(connection, pinId);
        const likeUserResult = await pinViewDao.deletePinLikeUser(connection, pinId, userId);

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - deletePinLike Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


//최근 조회한 핀지도 삭제
exports.deleteMyPin = async function(userId, pinId){
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const myPinIdResult = await pinViewDao.deleteMyPin(connection, userId, pinId);
        // console.log(`삭제된 핀지도 : ${pinIdResult[0]}`)
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - deleteMyPin Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
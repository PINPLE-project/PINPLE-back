const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");
const dmProvider = require("./dmProvider");
const baseResponse = require("../../../config/responseStatus");
const {response, errResponse} = require("../../../config/response");


exports.createScrap = async function (userId, placeId){
    try{
        const connection = await pool.getConnection(async (conn) => conn);
        const insertScrapParams = [userId, placeId];
        const creatScrapResult = await dmDao.insertScrap(connection, insertScrapParams);
        console.log(`스크랩 : ${creatScrapResult[0]}`)
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch(err){
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.deleteScrap = async function (userId, placeId){
    try{
        // const roleRows = await userProvider.scrapWriterCheck(userId, placeId);
        //const writerCheck = roleRows[0].writer_id
        // if (writer_id !== writerCheck){
        //     return errResponse(baseResponse.QUESTION_AUTH);
        // }
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteScrapParams = [userId, placeId];
        const deleteScrapResult = await dmDao.deleteScrap(connection, deleteScrapParams);
        console.log(deleteScrapResult);
        connection.release();
        return response(baseResponse.SUCCESS);

    }catch(err){
        return errResponse(baseResponse.DB_ERROR);
    }
}
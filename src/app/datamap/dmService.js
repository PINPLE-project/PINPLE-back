const responseStatus = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const axios = require("axios");
const convert = require("xml-js");
const dmProvider = require("./dmProvider");
const dmDao = require("./dmDao");
const dmController = require("./dmController");
const { pool } = require("../../../config/database");

//마커 클릭했을 때, 해당 장소 데이터 불러오기
async function createclickPin(placeCode) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    //클릭한 장소 정보 불러오기
    const placeData = await dmDao.selectPinDataByCode(connection, placeCode);
    //클릭한 장소 스크랩

    connection.release();
    return placeData;
  } catch (error) {
    throw error;
  }
}

/*
 *  장소 스크랩
 */
async function createScrap(userId, placeId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertScrapParams = [userId, placeId];
    const creatScrapResult = await dmDao.insertScrap(
      connection,
      insertScrapParams
    );
    console.log(`스크랩 : ${creatScrapResult[0]}`);
    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    return errResponse(baseResponse.DB_ERROR);
  }
}

async function deleteScrap(userId, placeId) {
  try {
    // const roleRows = await userProvider.scrapWriterCheck(userId, placeId);
    //const writerCheck = roleRows[0].writer_id
    // if (writer_id !== writerCheck){
    //     return errResponse(baseResponse.QUESTION_AUTH);
    // }
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteScrapParams = [userId, placeId];
    const deleteScrapResult = await dmDao.deleteScrap(
      connection,
      deleteScrapParams
    );
    console.log(deleteScrapResult);
    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    return errResponse(baseResponse.DB_ERROR);
  }
}

//상세보기
async function createDetails(placeCode) {
  try {
    const { markerDetails, recommendationPlaces } =
      await dmProvider.retrieveDetails(placeCode);
    return { markerDetails, recommendationPlaces };
  } catch (error) {
    throw error;
  }
}

// 장소 목록
async function createCityList(sortBy) {
  const cityList = await dmProvider.retrieveCityList(sortBy);
  return cityList;
}

module.exports = {
  createclickPin,
  createScrap,
  deleteScrap,
  createDetails,
  createCityList,
};

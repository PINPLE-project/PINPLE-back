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
async function createScrap(placeCode) {
  const connection = await pool.getConnection();
  try {
    // 스크랩 가능한 장소 개수 확인 (최대 3개)
    const canScrap = await dmDao.checkScrapLimit(connection);
    // 최대 스크랩 개수 초과인 경우 스크랩 불가능
    if (!canScrap) {
      connection.release();
      return false;
    }

    // 이미 스크랩한 장소인지 확인
    const isAlreadyScrapped = await dmDao.checkIfAlreadyScrapped(
      connection,
      placeCode
    );
    // 이미 스크랩한 장소인 경우 스크랩 불가능
    if (isAlreadyScrapped) {
      connection.release();
      return false;
    }

    //스크랩 가능한 경우, 장소를 스크랩 테이블에 추가
    await dmDao.insertScrappedPlace(connection, placeCode);

    connection.release();
    return true; // 장소 스크랩 성공
  } catch (error) {
    connection.release();
    throw error;
  }
}

module.exports = {
  createclickPin,
  createScrap,
};

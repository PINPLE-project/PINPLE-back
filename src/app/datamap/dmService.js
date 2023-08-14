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

module.exports = {
  createclickPin,
};

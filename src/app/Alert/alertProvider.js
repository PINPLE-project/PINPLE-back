const axios = require("axios");
const convert = require("xml-js");
const { pool } = require("../../../config/database");
const alertDao = require("./alertDao");

exports.retrieveSetupAlertList = async function (userIdFromJWT) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertListResult = await alertDao.selectSetupAlert(
    connection,
    userIdFromJWT
  );
  connection.release();

  return alertListResult;
};

exports.retrieveRecordAlertList = async function (userIdFromJWT) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertListResult = await alertDao.selectRecordAlert(
    connection,
    userIdFromJWT
  );
  connection.release();

  return alertListResult;
};

exports.retrieveRecordAlertListByDate = async function (userIdFromJWT, date) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertListResult = await alertDao.selectRecordAlertByDate(
    connection,
    userIdFromJWT,
    date
  );
  connection.release();

  return alertListResult;
};

exports.retrievePlaceList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const placeListResult = await alertDao.selectPlaces(connection);
  connection.release();

  return placeListResult;
};

exports.retrievePlaceId = async function (placeName) {
  const connection = await pool.getConnection(async (conn) => conn);
  const placeId = await alertDao.selectPlaceId(connection, placeName);
  connection.release();

  return placeId[0][0]["place_id"];
};

exports.retrieveDeviceToken = async function (userIdFromJWT) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deviceToken = await alertDao.selectDeviceToken(
    connection,
    userIdFromJWT
  );
  connection.release();

  return deviceToken[0][0]["deviceToken"];
};

exports.getCongestionInfo = async function (placeName) {
  const url = `http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/${placeName}`;
  const response = await axios.get(url);
  const xmlData = response.data;
  const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
  const citydata = JSON.parse(jsonData);
  const cityData = citydata["SeoulRtd.citydata"]["CITYDATA"];

  // cityData가 undefined인 경우 빈 객체로 초기화
  const extractedData = {
    AREA_NM: "",
    AREA_CONGEST_LVL: "",
    AREA_CONGEST_MSG: "",
    AREA_DATA_TIME: "",
  };

  if (cityData) {
    extractedData.AREA_NM = cityData["AREA_NM"]["_text"];
    extractedData.AREA_CONGEST_LVL =
      cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["AREA_CONGEST_LVL"][
        "_text"
      ];
    extractedData.AREA_CONGEST_MSG =
      cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["AREA_CONGEST_MSG"][
        "_text"
      ];
    extractedData.AREA_DATA_TIME =
      cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["PPLTN_TIME"]["_text"];
  }

  return extractedData;
};

exports.alertCheck = async function (AlertParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alertCheckResult = await alertDao.selectSetupAlertForCheck(
    connection,
    AlertParams
  );
  connection.release();

  return alertCheckResult;
};

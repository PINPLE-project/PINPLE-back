const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const alertDao = require("./alertDao");
const alertProvider = require("./alertProvider");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

exports.createAlert = async function (userId, placeName, time) {
  try {
    const placeId = await alertProvider.retrievePlaceId(placeName);
    AlertParams = [userId, placeId, time];

    // 알림 중복 확인
    const alertRows = await alertProvider.alertCheck(AlertParams);
    if (alertRows[0].length) {
      console.log("중복된 알림");
      return errResponse(baseResponse.ALERT_REDUNDANT);
    }

    const connection = await pool.getConnection(async (conn) => conn);
    const createAlertResult = await alertDao.insertAlert(
      connection,
      AlertParams
    );

    console.log(`추가된 알림 : ${createAlertResult[0].insertId}`);

    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - createAlert Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

exports.deleteAlert = async function (alertId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const deleteAlertResult = await alertDao.deleteAlert(connection, alertId);

    console.log(`삭제된 알림 : ${deleteAlertResult[0][0]["alertId"]}`);

    connection.release();
    return response(baseResponse.SUCCESS, deleteAlertResult[0]);
  } catch (err) {
    logger.error(`App - deleteAlert Service error\n: ${err.message}`);
    return errResponse(baseResponse.ALERT_EMPTY);
  }
};

exports.updateAlert = async function (congestionInfo, AlertParams) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const updateAlertResult = await alertDao.updateCongestionInfo(
      connection,
      congestionInfo,
      AlertParams
    );
    connection.release();

    return updateAlertResult;
  } catch (err) {
    logger.error(`App - EditAlert Service error\n: ${err.message}`);
    return errResponse(baseResponse.ALERT_EMPTY);
  }
};

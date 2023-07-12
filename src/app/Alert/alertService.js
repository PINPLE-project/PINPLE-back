const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const alertDao = require("./alertDao");
const alertProvider = require("./alertProvider");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

exports.createAlert = async function (userIdFromJWT, place, time) {
  try {
    const AlertParams = [userIdFromJWT, place, time];

    // 알림 중복 확인
    const alertRows = await alertProvider.alertCheck(AlertParams);
    if (alertRows[0].length) {
      console.log("중복된 알림");
      return errResponse(baseResponse.ALERT_REDUNDANT);
    }

    const connection = await pool.getConnection(async (conn) => conn);
    const alertIdResult = await alertDao.insertAlert(connection, AlertParams);

    console.log(`추가된 알림 : ${alertIdResult[0].insertId}`);

    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - createAlert Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

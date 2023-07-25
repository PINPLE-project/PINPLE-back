const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const reportDao = require("./reportDao");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

exports.createReport = async function (pinviewId, userIdFromJWT, reason) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const reportParams = [pinviewId, userIdFromJWT, ...reason];
    const createReportResult = await reportDao.insertReport(
      connection,
      reportParams
    );

    console.log(`추가된 신고 : ${createReportResult[0].insertId}`);

    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - createReport Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

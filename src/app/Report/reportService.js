const { logger } = require("../../../config/winston");
const { pool } = require("../../../config/database");
const reportDao = require("./reportDao");
const reportProvider = require("./reportProvider");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

exports.createReport = async function (pinviewId, userId, reason) {
  try {
    // 신고 중복 확인
    const reportRows = await reportProvider.reportCheck(userId, pinviewId);
    if (reportRows[0].length) {
      console.log("중복된 신고");
      return errResponse(baseResponse.REPORT_REDUNDANT);
    }

    const connection = await pool.getConnection(async (conn) => conn);
    const reportParams = [pinviewId, userId, ...reason];
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

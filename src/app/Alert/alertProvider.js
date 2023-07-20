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

exports.retrieveDeviceToken = async function (userIdFromJWT) {
  const connection = await pool.getConnection(async (conn) => conn);
  const deviceToken = await alertDao.selectDeviceToken(
    connection,
    userIdFromJWT
  );
  connection.release();

  return deviceToken[0][0]["deviceToken"];
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

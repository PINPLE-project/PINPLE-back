const { pool } = require("../../../config/database");
const pinViewDao = require("./pinViewDao");

//전체 핀지도 조회
exports.retrievePinList = async function () {

    const connection = await pool.getConnection(async (conn) => conn);
    const pinListResult = await pinViewDao.selectPin(connection);
    connection.release();

    return pinListResult;
};
//특정 핀지도 조회
exports.retrievePin = async function (pinId, userId) {

    const connection = await pool.getConnection(async (conn) => conn);
    const recentPinIdResult1 = await pinViewDao.deleteRecentPin(connection, pinId, userId);
    const recentPinIdResult2 = await pinViewDao.insertRecentPin(connection, pinId, userId);
    await pinViewDao.deleteOldMyPin(connection);
    const pinByIdResult = await pinViewDao.selectPinById(connection, pinId, userId);
    connection.release();
  
    return pinByIdResult;
  };

//my pin 핀지도 조회
exports.retrieveMyPinList = async function (userId) {

  const connection = await pool.getConnection(async (conn) => conn);
  const recentPinListResult = await pinViewDao.selectRecentPin(connection, userId);
  connection.release();

  return recentPinListResult;
};
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
  const recentPinIdResult1 = await pinViewDao.deleteRecentPin(
    connection,
    pinId,
    userId
  );
  const recentPinIdResult2 = await pinViewDao.insertRecentPin(
    connection,
    pinId,
    userId
  );
  const pinByIdResult = await pinViewDao.selectPinById(
    connection,
    pinId,
    userId
  );
  connection.release();

  return pinByIdResult;
};

//my pin 핀지도 조회
exports.retrieveMyPinList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const recentPinListResult = await pinViewDao.selectRecentPin(
    connection,
    userId
  );
  connection.release();

  return recentPinListResult;
};

//핀 지도 알림 설정 여부 조회
exports.retrievePinNotiStatus = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const pinAlarmStatusResult = await pinViewDao.selectPinAlarmStatus(
    connection,
    userId
  );
  connection.release();

  return pinAlarmStatusResult[0][0]["pinAlarm"];
};

// 핀 알림을 전송할 유저 정보 조회
exports.retrieveUserInfoForPinNoti = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const UserInfoForPinNotiResult = await pinViewDao.selectUserInfoForPinNoti(
    connection,
    userId
  );
  connection.release();

  return {
    nickname: UserInfoForPinNotiResult[0][0]["nickname"],
    deviceToken: UserInfoForPinNotiResult[0][0]["deviceToken"],
  };
};

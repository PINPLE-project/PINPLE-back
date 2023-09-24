const { pool } = require("../../../config/database");
const userDao = require("./userDao");
const userProvider = require("./userProvider");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const jwtMiddleware = require("../../../config/jwtMiddleware");
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");

exports.postSignIn = async function (id, nickname) {
  try {
    // 토큰 생성
    let token = await jwt.sign(
      {
        userId: id,
      }, // 토큰 내용
      secret_config.jwtsecret,
      // 유효기간 365일
      {
        expiresIn: "365d",
        subject: "user",
      }
    );

    return response(baseResponse.SUCCESS, { userId: id, jwt: token });
  } catch (err) {
    console.log(
      `App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(
        err
      )}`
    );
    return errResponse(baseResponse.DB_ERROR);
  }
};

exports.postSignUp = async function (id, nickname) {
  // const insertUserParams = [id, nickname];
  const connection = await pool.getConnection(async (conn) => conn);

  const createUserResult = await userDao.insertUser(connection, id, nickname);
  console.log(`삽입된 유저 : ${createUserResult[0]}`);
  connection.release();
};

exports.updateSignUp = async function (
  userId,
  nickname,
  character,
  congestionAlarm,
  pinAlarm,
  deviceToken
) {
  try {
    //const updateUserParams = [userId, nickname, character, congestionAlarm, pinAlarme];
    const connection = await pool.getConnection(async (conn) => conn);
    const updateUserResult = await userDao.updatetUser(
      connection,
      userId,
      nickname,
      character,
      congestionAlarm,
      pinAlarm,
      deviceToken
    );
    console.log(`삽입된 유저 : ${updateUserResult[0]}`);
    connection.release();
    return response(baseResponse.SUCCESS);
  } catch (err) {
    console.log(
      `App - updateComment Service error\n: ${err.message} \n${JSON.stringify(
        err
      )}`
    );
    return errResponse(baseResponse.DB_ERROR);
  }
};

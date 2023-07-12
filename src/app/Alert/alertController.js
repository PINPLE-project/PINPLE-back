const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const alertService = require("../../app/Alert/alertService");
const alertProvider = require("../../app/Alert/alertProvider");

/**
 * API No. 0
 * Name: 테스트용 API
 * [GET] /app/test
 */

exports.test = async function (req, res) {
  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 1
 * Name: 설정된 알림 전체 조회
 * [GET] /app/alert
 */

exports.getAlert = async function (req, res) {
  /**
   * JWT: userIdFromJWT
   */
  const { userIdFromJWT } = req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  const alertList = await alertProvider.retrieveAlertList(userIdFromJWT);
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 2
 * Name: 알림 설정
 * [POST] /app/alert
 */

exports.postAlert = async function (req, res) {
  /**
   * Body: place, time
   * JWT: userIdFromJWT
   */
  const { userIdFromJWT, place, time } = req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  const isValidateTime = (time) => {
    return /([0-2][0-9]{3})-([0-1][0-9])-([0-3][0-9]) ([0-5][0-9]):([0-5][0-9]):([0-5][0-9])(([\-\+]([0-1][0-9])\:00))?/.test(
      time
    );
  };

  const isProperTime = (time) => {
    const rYY = Number(time.substring(0, 4));
    const rMM = Number(time.substring(5, 7)) - 1;
    const rDD = Number(time.substring(8, 10));
    const tHH = Number(time.substring(11, 13));
    const tMM = Number(time.substring(14, 16));

    const now = new Date();
    const ntime = new Date(rYY, rMM, rDD, tHH, tMM);

    if (ntime - now > 0) return true;
    else return false;
  };

  // 장소 빈 값 체크
  if (!place) return res.send(errResponse(baseResponse.ALERT_PLACE_EMPTY));
  // 시간 빈 값 체크
  if (!time) return res.send(errResponse(baseResponse.ALERT_TIME_EMPTY));
  // 시간 형식 체크
  if (!isValidateTime(time))
    return res.send(errResponse(baseResponse.ALERT_TIME_ERROR_TYPE));
  // 시간이 현재보다 이전인지 체크
  if (!isProperTime(time))
    return res.send(errResponse(baseResponse.ALERT_TIME_WRONG));

  const alertResponse = await alertService.createAlert(
    userIdFromJWT,
    place,
    time
  );
  return res.send(alertResponse);
};

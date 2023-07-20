const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const admin = require("../../../config/pushConnect");
const { pushAlertMessage } = require("../../../config/pushMessage");
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
 * Name: 설정된 알림 전체 조회 API
 * [GET] /app/alert/setup
 */

exports.getSetupAlert = async function (req, res) {
  /**
   * JWT: userIdFromJWT
   */
  const { userIdFromJWT } = req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  const alertList = await alertProvider.retrieveSetupAlertList(userIdFromJWT);
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 2
 * Name: 알림 추가 API
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
  // 시간 유효성 체크
  if (!isProperTime(time))
    return res.send(errResponse(baseResponse.ALERT_TIME_WRONG));

  const alertResponse = await alertService.createAlert(
    userIdFromJWT,
    place,
    time
  );
  return res.send(alertResponse);
};

/**
 * API No. 3
 * Name: 알림 삭제 API
 * [DELETE] /app/alert/:alertId
 */

exports.deleteAlert = async function (req, res) {
  /**
   * Path Variable: alertId
   */
  const alertId = req.params.alertId;

  const alertResponse = await alertService.deleteAlert(alertId);
  return res.send(alertResponse);
};

/**
 * API No. 4
 * Name: 알림 기록 전체 조회 API
 * [GET] /app/alert/record
 */

exports.getRecordAlert = async function (req, res) {
  /**
   * JWT: userIdFromJWT
   */
  const { userIdFromJWT } = req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  const alertList = await alertProvider.retrieveRecordAlertList(userIdFromJWT);
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 5
 * Name: 알림 기록 날짜별 조회 API
 * [GET] /app/alert/record/:date
 */

exports.getRecordAlertByDate = async function (req, res) {
  /**
   * JWT: userIdFromJWT
   * Path Variable: date
   */
  const { userIdFromJWT } = req.body;
  const date = req.params.date;
  // const userIdFromJWT = req.verifiedToken.userId;

  const isValidateDate = (date) => {
    return /^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/.test(date);
  };

  const isProperDate = (date) => {
    const rYY = Number(date.substring(0, 4));
    const rMM = Number(date.substring(4, 6)) - 1;
    const rDD = Number(date.substring(6, 8));

    const now = new Date();
    const ndate = new Date(rYY, rMM, rDD);

    if (ndate - now <= 0) return true;
    else return false;
  };

  // 날짜 형식 체크
  if (!isValidateDate(date))
    return res.send(errResponse(baseResponse.ALERT_DATE_ERROR_TYPE));
  // 날짜 유효성 체크
  if (!isProperDate(date))
    return res.send(errResponse(baseResponse.ALERT_DATE_WRONG));

  date.replace(/(\d{4})(\d{2})(\d{2})/g, "$1-$2-$3");

  const alertList = await alertProvider.retrieveRecordAlertListByDate(
    userIdFromJWT,
    date
  );
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 6
 * Name: 알림 울림 API
 * [GET] /app/alert/push
 */

exports.getPushAlert = async function (req, res) {
  /**
   * JWT: userIdFromJWT
   */
  let deviceToken = `토큰값입력`; // userId를 이용하여 db에서 가져온다.

  let message = {
    notification: {
      title: pushAlertMessage.title,
      body: pushAlertMessage.body,
    },
    token: deviceToken,
  };

  admin
    .messaging()
    .send(message)
    .then(function (response) {
      console.log("Successfully sent message: : ", response);
      return res.send(response(baseResponse.SUCCESS));
    })
    .catch(function (err) {
      console.log("Error Sending message!!! : ", err);
      return res.send(errResponse(baseResponse.PUSH_ALERT_FAIL));
    });
};

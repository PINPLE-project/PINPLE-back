const schedule = require("node-schedule");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const admin = require("../../../config/pushConnect");
const alertService = require("../../app/Alert/alertService");
const alertProvider = require("../../app/Alert/alertProvider");

/**
 * API No. 1
 * Name: 설정된 알림 전체 조회 API
 * [GET] /app/alert/setup
 */

exports.getSetupAlert = async function (req, res) {
  /**
   * JWT: userId
   */
  const userId = req.verifiedToken.userId;

  const alertList = await alertProvider.retrieveSetupAlertList(userId);
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 2
 * Name: 알림 추가 API
 * [POST] /app/alert
 */

exports.postAlert = async function (req, res) {
  /**
   * Body: placeName, time
   * JWT: userId
   */
  const { placeName, time } = req.body;
  const userId = req.verifiedToken.userId;

  const placeList = await alertProvider.retrievePlaceList();
  const isValidPlace = (placeName) => {
    const isExistPlace = placeList[0].find(function (place) {
      return place["AREA_NM"] === placeName;
    });
    if (isExistPlace) return true;
    else return false;
  };

  const isValidTime = (time) => {
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
  if (!placeName) return res.send(errResponse(baseResponse.ALERT_PLACE_EMPTY));
  // 시간 빈 값 체크
  if (!time) return res.send(errResponse(baseResponse.ALERT_TIME_EMPTY));
  // 유효한 장소인지 체크
  if (!isValidPlace(placeName))
    return res.send(errResponse(baseResponse.ALERT_PLACE_NONEXISTENT));
  // 시간 형식 체크
  if (!isValidTime(time))
    return res.send(errResponse(baseResponse.ALERT_TIME_ERROR_TYPE));
  // 현재 시간보다 이전의 시간으로 알림을 설정하는지 체크
  if (!isProperTime(time))
    return res.send(errResponse(baseResponse.ALERT_TIME_WRONG));

  // 사용자가 설정한 시간에 알림 푸시
  schedule.scheduleJob(new Date(time), async function () {
    const placeId = await alertProvider.retrievePlaceId(placeName);
    const AlertParams = [userId, placeId, time];

    // 알림이 유효한지 확인
    const alertRows = await alertProvider.alertCheck(AlertParams);
    if (alertRows[0].length) {
      const congestionInfo = await alertProvider.getCongestionInfo(placeName);
      const deviceToken = await alertProvider.retrieveDeviceToken(userId);

      // 혼잡도 정보가 비어있지 않은지 확인
      if (
        congestionInfo["AREA_CONGEST_LVL"] != "" &&
        congestionInfo["AREA_CONGEST_MSG"] != ""
      ) {
        const message = {
          notification: {
            title:
              "현재 " +
              placeName +
              "의 혼잡도는 " +
              congestionInfo["AREA_CONGEST_LVL"] +
              "입니다.",
            body: congestionInfo["AREA_CONGEST_MSG"],
          },
          token: deviceToken,
        };

        // Alert 테이블에 혼잡도 정보 반영
        await alertService.updateAlert(congestionInfo, AlertParams);

        // 푸시 알림 전송
        admin
          .messaging()
          .send(message)
          .then(function (response) {
            console.log("Successfully sent message: : ", response);
          })
          .catch(function (err) {
            console.log("Error Sending message!!! : ", err);
          });
      } else {
        console.log("혼잡도 정보가 존재하지 않습니다.");
      }
    } else {
      console.log("설정된 알림이 삭제되어 PUSH 알림이 발송되지 않았습니다.");
    }
  });

  const alertResponse = await alertService.createAlert(userId, placeName, time);

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
   * JWT: userId
   */
  const userId = req.verifiedToken.userId;

  const alertList = await alertProvider.retrieveRecordAlertList(userId);
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

/**
 * API No. 5
 * Name: 알림 기록 날짜별 조회 API
 * [GET] /app/alert/record/:date
 */

exports.getRecordAlertByDate = async function (req, res) {
  /**
   * JWT: userId
   * Path Variable: date
   */
  const date = req.params.date;
  const userId = req.verifiedToken.userId;

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
    userId,
    date
  );
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

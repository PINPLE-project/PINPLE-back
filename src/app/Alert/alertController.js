const schedule = require("node-schedule");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const admin = require("../../../config/pushConnect");
const alertService = require("../../app/Alert/alertService");
const alertProvider = require("../../app/Alert/alertProvider");
const dmController = require("../datamap/dmController");

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
  // 설정한 알림이 없는 경우
  if (!alertList[0].length) {
    return res.send(errResponse(baseResponse.ALERT_SETUP_EMPTY));
  }
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
   * JWT: userIdFromJWT
   */
  const { userIdFromJWT, placeName, time } = req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  const placeList = await alertProvider.retrievePlaceList();
  const isValidPlace = (placeName) => {
    const isExistPlace = placeList[0].find(function (place) {
      return place["placeName"] === placeName;
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

  const datetime = new Date(time);
  // 사용자가 설정한 시간에 알림 푸시
  schedule.scheduleJob(datetime, async function () {
    const placeId = await alertProvider.retrievePlaceId(placeName);
    const AlertParams = [userIdFromJWT, placeId, time];

    // 알림이 유효하다면 푸시 알림 전송
    const alertRows = await alertProvider.alertCheck(AlertParams);
    if (alertRows[0].length) {
      // 실시간 공공도시데이터 가져와서 CityData 테이블에 업데이트
      dmController.getAllCityData();

      const deviceToken = await alertProvider.retrieveDeviceToken(
        userIdFromJWT
      );
      const congestionInfo = await alertProvider.retrieveCongestionInfo(
        placeName
      );

      const message = {
        notification: {
          title:
            "현재" +
            placeName +
            "의 혼잡도는" +
            congestionInfo[0][0]["placeCongestLVL"] +
            "입니다.",
          body: congestionInfo[0][0]["placeCongestMSG"],
        },
        token: deviceToken,
      };

      // Alert 테이블에 혼잡도 정보 반영
      await alertService.editAlert(congestionInfo, AlertParams);

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
      console.log("Alert is deleted!!!");
    }
  });

  const alertResponse = await alertService.createAlert(
    userIdFromJWT,
    placeName,
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
  // 알림 기록이 없는 경우
  if (!alertList[0].length) {
    return res.send(errResponse(baseResponse.ALERT_RECORD_EMPTY));
  }
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
  // 해당 날짜에 대한 알림 기록이 없는 경우
  if (!alertList[0].length) {
    return res.send(errResponse(baseResponse.ALERT_EMPTY));
  }
  return res.send(response(baseResponse.SUCCESS, alertList[0]));
};

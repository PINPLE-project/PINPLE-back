const baseResponse = require("../../../config/responseStatus");
const pinViewProvider = require("../../app/PinView/pinViewProvider");
const pinViewService = require("../../app/PinView/pinViewService");
const { response, errResponse } = require("../../../config/response");
const admin = require("../../../config/pushConnect");

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
 * Name: 핀지도 작성 API
 * [POST] /app/pinView
 */
exports.postPin = async function (req, res) {
  /**
   * Body: longitude, latitude, address, pinCongest, pinFeeling, contents
   */
  const { longitude, latitude, address, pinCongest, pinFeeling, contents } =
    req.body;
  const userId = req.params.userId;

  // 빈 값 체크
  if (!longitude) {
    return res.send(errResponse(baseResponse.PINVIEW_LONGITUDE_EMPTY));
  } else if (!latitude) {
    return res.send(errResponse(baseResponse.PINVIEW_LATITUDE_EMPTY));
  } else if (!address) {
    return res.send(errResponse(baseResponse.PINVIEW_ADDRESS_EMPTY));
  } else if (!pinCongest) {
    return res.send(errResponse(baseResponse.PINVIEW_PINCONGEST_EMPTY));
  } else if (!pinFeeling) {
    return res.send(errResponse(baseResponse.PINVIEW_PINFEELING_EMPTY));
  }
  // 길이 체크
  if (contents) {
    if (contents.length > 300) {
      return res.send(errResponse(baseResponse.PINVIEW_CONTENTS_LENGTH));
    }
  }

  const postPinResponse = await pinViewService.createPin(
    userId,
    longitude,
    latitude,
    address,
    pinCongest,
    pinFeeling,
    contents
  );

  return res.send(postPinResponse);
};

/**
 * API No. 2
 * Name: 전체 핀지도 조회 API (최신순)
 * [GET] /app/pinView
 */
exports.getPins = async function (req, res) {
  const pinListResult = await pinViewProvider.retrievePinList();
  return res.send(response(baseResponse.SUCCESS, pinListResult));
};

/**
 * API No. 3
 * Name: 특정 핀지도 조회 API
 * [GET] /app/pinView/:pinId
 */

exports.getPinById = async function (req, res) {
  /**
   * Path Variable: pinId
   */
  const pinId = req.params.pinId;
  const userId = req.params.userId;

  if (!pinId) return res.send(errResponse(baseResponse.PINVIEW_PINID_EMPTY));

  const pinById = await pinViewProvider.retrievePin(pinId, userId);
  return res.send(response(baseResponse.SUCCESS, pinById));
};

/**
 * API No. 4
 * Name: 특정 핀지도 삭제 API
 * [PATCH] /app/pinView/:pinId
 */

exports.deletePin = async function (req, res) {
  const userId = req.params.userId;
  const pinId = req.params.pinId;

  if (!pinId) return res.send(errResponse(baseResponse.PINVIEW_PINID_EMPTY));

  const deletePinResponse = await pinViewService.deletePin(pinId, userId);
  return res.send(deletePinResponse);
};

/**
 * API No. 5
 * Name: 도움이 되었어요 API
 * [PATCH] /app/pinview/:pinId/likes
 */

exports.postPinLike = async function (req, res) {
  const pinId = req.params.pinId;
  const userId = req.verifiedToken.userId;

  if (!userId) return res.send(errResponse(baseResponse.PINVIEW_USERID_EMPTY));
  if (!pinId) return res.send(errResponse(baseResponse.PINVIEW_PINID_EMPTY));

  // 핀 작성자의 핀 알림 설정 여부 확인
  const pinAlarmStatus = await pinViewProvider.retrievePinNotiStatus(userId);
  // 핀 알림이 켜져있을 경우 푸시 알림 전송
  if (pinAlarmStatus) {
    // 핀 작성자의 디바이스 토큰, 닉네임 가져오기
    const userInfo = await pinViewProvider.retrieveUserInfoForPinNoti(userId);

    // 푸시 알림 메시지 구성
    const message = {
      notification: {
        title:
          userInfo["nickname"] +
          "님이 작성해주신 핀이 다른 사람들에게 도움이 되었어요!",
      },
      token: userInfo["deviceToken"],
    };

    // 푸시 알림 발송
    admin
      .messaging()
      .send(message)
      .then(function (response) {
        console.log("Successfully sent message: : ", response);
      })
      .catch(function (err) {
        console.log("Error Sending message!!! : ", err);
      });
  }

  const postPinLikeResponse = await pinViewService.postPinLike(pinId, userId);
  return res.send(postPinLikeResponse);
};

/**
 * API No. 6
 * Name: 도움이 되었어요 취소 API
 * [PATCH] /app/pinView/:pinId/liked
 */

exports.deletePinLike = async function (req, res) {
  const userId = req.params.userId;
  const pinId = req.params.pinId;

  if (!userId) return res.send(errResponse(baseResponse.PINVIEW_USERID_EMPTY));
  if (!pinId) return res.send(errResponse(baseResponse.PINVIEW_PINID_EMPTY));

  const deletePinLikeResponse = await pinViewService.deletePinLike(
    pinId,
    userId
  );
  return res.send(deletePinLikeResponse);
};

/**
 * API No.
 * Name: 최근 조회한 핀지도 조회 API
 * [GET] /app/myPage/myPin
 */

exports.getMyPin = async function (req, res) {
  const userId = req.params.userId;

  if (!userId) return res.send(errResponse(baseResponse.PINVIEW_USERID_EMPTY));

  const myPin = await pinViewProvider.retrieveMyPinList(userId);
  return res.send(response(baseResponse.SUCCESS, myPin));
};

/**
 * API No.
 * Name: 최근 조회한 핀지도 삭제 API
 * [DELETE] /app/myPage/myPin/:pinId
 */

exports.deleteMyPin = async function (req, res) {
  const userId = req.params.userId;
  const pinId = req.params.pinId;

  if (!userId) return res.send(errResponse(baseResponse.PINVIEW_USERID_EMPTY));
  if (!pinId) return res.send(errResponse(baseResponse.PINVIEW_PINID_EMPTY));

  const deleteMyPinResponse = await pinViewService.deleteMyPin(userId, pinId);
  return res.send(deleteMyPinResponse);
};

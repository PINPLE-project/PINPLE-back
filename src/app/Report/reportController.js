const reportService = require("./reportService");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

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
 * Name: 신고 API
 * [POST] /app/pinview/:pinId/report
 */

exports.postReport = async function (req, res) {
  /**
   * Path Variable: pinviewId
   * JWT: userIdFromJWT
   * Body: reason1, reason2, reason3, reason4, reason5
   */
  const pinviewId = req.params.pinId;
  const { userIdFromJWT, reason1, reason2, reason3, reason4, reason5 } =
    req.body;
  // const userIdFromJWT = req.verifiedToken.userId;

  reason = [reason1, reason2, reason3, reason4, reason5];

  // reason이 모두 선택 안되었지는 않은지 체크
  if (reason.every((r) => r == 0)) {
    return res.send(errResponse(baseResponse.REPORT_EMPTY));
  }

  const reportResponse = await reportService.createReport(
    pinviewId,
    userIdFromJWT,
    reason
  );
  return res.send(reportResponse);
};

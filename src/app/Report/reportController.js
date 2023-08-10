const reportService = require("./reportService");
const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");

/**
 * API No. 1
 * Name: 신고 API
 * [POST] /app/pinview/:pinId/report
 */

exports.postReport = async function (req, res) {
  /**
   * Path Variable: pinviewId
   * JWT: userId
   * Body: reason1, reason2, reason3, reason4, reason5
   */
  const pinviewId = req.params.pinId;
  const { reason1, reason2, reason3, reason4, reason5 } = req.body;
  const userId = req.verifiedToken.userId;

  reason = [reason1, reason2, reason3, reason4, reason5];

  // reason이 모두 선택 안되었지는 않은지 체크
  if (reason.every((r) => r == 0)) {
    return res.send(errResponse(baseResponse.REPORT_EMPTY));
  }

  const reportResponse = await reportService.createReport(
    pinviewId,
    userId,
    reason
  );
  return res.send(reportResponse);
};

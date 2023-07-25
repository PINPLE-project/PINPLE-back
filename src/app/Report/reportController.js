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

const responseStatus = require("/Users/moonyaeyoon/PINPLE-back/config/responseStatus.js");
const { response, errResponse } = require("../../../config/response");
const axios = require('axios');
/**
 * API No. 0
 * Name: 테스트용 API
 * [GET] /app/test
 */


exports.getUsers = async function (req, res) {
    try {
        // 공공데이터 요청을 수행하고 데이터를 받아옴
        const response = await axios.get('http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/POI095');
        console.log(response);


        // 성공 응답을 보냄
        return res.send(response(responseStatus.SUCCESS));
    } catch (error) {
        // 에러 응답을 보냄
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};

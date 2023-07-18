
const responseStatus = require("/Users/moonyaeyoon/PINPLE-back/config/responseStatus.js");
const { response, errResponse } = require("../../../config/response");
const axios = require('axios');
const convert = require('xml-js');
const userProvider = require("./userProvider");
/**
 * API No. 0
 * Name: 테스트용 API
 * [GET] /app/test
 */


exports.getUsers = async function (req, res) {
    try {
        // 공공데이터 요청을 수행하고 데이터를 받아옴
        const response = await axios.get('http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/POI095');
        const xmlData = response.data;

        // XML 데이터를 JSON으로 변환
        const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });

        // JSON 데이터를 가공하거나 필요한 처리를 수행
        const users = JSON.parse(jsonData);

        // 필요한 정보 추출하여 콘솔에 출력
        const cityData = users['SeoulRtd.citydata']['CITYDATA'];

        const extractedData = {
            AREA_NM: cityData['AREA_NM']['_text'],
            AREA_CONGEST_LVL: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_LVL']['_text'],
            AREA_CONGEST_MSG: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_MSG']['_text']
        };

        console.log("Extracted Data:", extractedData);
        
        // 프론트엔드에 전송할 데이터 구성
        const responseData = {
            AREA_NM: cityData['AREA_NM']['_text'],
            AREA_CONGEST_LVL: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_LVL']['_text'],
            AREA_CONGEST_MSG: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_MSG']['_text']
        };

       return res.send(response(responseStatus.SUCCESS));
    } catch (error) {
        // 에러 응답을 보냄
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
}

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

        // 성공 응답을 보냄
        console.log(JSON.stringify(users, null, 4)); // JSON 데이터 콘솔 출력

        // 필요한 데이터 추출
        const extractedData = users.SeoulRtd.citydata.map(item => ({
            areaName: item.AREA_NM._text,
            congestionLevel: item.AREA_CONGEST_LVL._text
        }));

        // 데이터베이스에 저장
        for (const data of extractedData) {
            await userProvider.insertUser(data.areaName, data.congestionLevel);
        }

        // 성공 응답을 보냄
        console.log('데이터가 MySQL에 저장되었습니다.');

        return res.send(response(responseStatus.SUCCESS));
    } catch (error) {
        // 에러 응답을 보냄
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
}
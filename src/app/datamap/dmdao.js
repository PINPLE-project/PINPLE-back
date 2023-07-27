module.exports = {};
const axios = require('axios');
const convert = require('xml-js');
const { urls } = require("./dmController");
const { pool } = require("../../../config/database");

//장소 데이터를 가져오는 함수 
async function getCategoryData(category) {
    let categoryUrls = [];
    if (category === "all") {
        categoryUrls = Object.values(urls).flat();
    } else {
        categoryUrls = urls[category] || [];
    }
    const responsePromises = categoryUrls.map(async (code) => {
        const url = `http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/${code}`;
        const response = await axios.get(url);
        const xmlData = response.data;
        const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
        const users = JSON.parse(jsonData);
        // cityData가 undefined인 경우 빈 객체로 초기화
        const cityData = users['SeoulRtd.citydata']['CITYDATA'];
        // cityData가 undefined인 경우 빈 객체로 초기화
        const extractedData = {
            AREA_NM: '',
            AREA_CONGEST_LVL: '',
            AREA_CONGEST_MSG: '',
            AREA_DATA_TIME: '',
            FCST_PPLTN: [],
        };

        if (cityData) {
            extractedData.AREA_NM = cityData['AREA_NM']['_text'];
            extractedData.AREA_CONGEST_LVL = cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_LVL']['_text'];
            extractedData.AREA_CONGEST_MSG = cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_MSG']['_text'];
            extractedData.AREA_DATA_TIME = cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['PPLTN_TIME']['_text'];
            extractedData.FCST_PPLTN = cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['FCST_PPLTN'];
        }

        return extractedData;
    });
    const extractedDataArray = await Promise.all(responsePromises);
    return extractedDataArray;
}
module.exports = {
    getCategoryData
};
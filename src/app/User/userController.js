
const responseStatus = require("/Users/moonyaeyoon/PINPLE-back/config/responseStatus.js");
const { response, errResponse } = require("../../../config/response");
const axios = require('axios');
const convert = require('xml-js');
const userProvider = require("./userProvider");
const { pool } = require("/Users/moonyaeyoon/PINPLE-back/config/database")

const urls = {
    park: ['POI089', 'POI091', 'POI092', 'POI093', 'POI094', 'POI095', 'POI096', 'POI099', 'POI100', 'POI106', 'POI108', 'POI109', 'POI110'],
    tourist: ['POI001', 'POI002', 'POI003', 'POI004', 'POI005', 'POI006', 'POI007'],
    culture: ['POI008', 'POI009', 'POI012'],
    station: ['POI013', 'POI014', 'POI015', 'POI016', 'POI017', 'POI018', 'POI033', 'POI034', 'POI038', 'POI039', 'POI040', 'POI042', 'POI043', 'POI045', 'POI046'],
    popular: ['POI062', 'POI063', 'POI066', 'POI068', 'POI069', 'POI070', 'POI071', 'POI072', 'POI074', 'POI078', 'POI079', 'POI084']
};
async function getCategoryData(category) {
    const categoryUrls = urls[category];
    const responsePromises = categoryUrls.map(async (code) => {
        const url = `http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/${code}`;
        const response = await axios.get(url);
        const xmlData = response.data;
        const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
        const users = JSON.parse(jsonData);
        const cityData = users['SeoulRtd.citydata']['CITYDATA'];
        return {
            AREA_NM: cityData['AREA_NM']['_text'],
            AREA_CONGEST_LVL: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_LVL']['_text'],
            AREA_CONGEST_MSG: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['AREA_CONGEST_MSG']['_text'],
            AREA_DATA_TIME: cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['PPLTN_TIME']['_text']
        };
    });
    const extractedDataArray = await Promise.all(responsePromises);
    return extractedDataArray;
}
/**
 * API No. 1
 * Name: 장소 혼잡도 API (전체)
 * [GET] /app/citydata
 */

exports.getAllCityData = async function (req, res) {
    try {
        const allCategoryData = {};
        const categoryPromises = Object.keys(urls).map(async (category) => {
            const categoryData = await getCategoryData(category);
            allCategoryData[category] = categoryData;
        });

        await Promise.all(categoryPromises);

        console.log("All Category Data:", allCategoryData); // 콘솔에 출력

        return res.send(response(responseStatus.SUCCESS, allCategoryData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};
/**
 * API No. 2
 * Name: 상세보기_혼잡도전망 API 
 * [GET] /app/citydata/details/fccst
 */
//(cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['FCST_PPLTN']) {
//    const fcstData = cityData['LIVE_PPLTN_STTS']['LIVE_PPLTN_STTS']['FCST_PPLTN'];
//    extractedData['FCST_PPLTN'] = fcstData.map((data) => {
//        return {
//            FCST_TIME: data['FCST_TIME']['_text'],
//            FCST_CONGEST_LVL: data['FCST_CONGEST_LVL']['_text'],
//            FCST_PPLTN_MIN: parseInt(data['FCST_PPLTN_MIN']['_text']),
//            FCST_PPLTN_MAX: parseInt(data['FCST_PPLTN_MAX']['_text'])
//        };
//    });

/**
 * API No. 3
 * Name: 상세보기_인근핀 API 
 * [GET] /app/citydata/details/pin
 */

/**
 * API No. 4
 * Name: 상세보기_추천장소 API
 * [GET] /app/citydata/details/:category
 */
exports.getCityDataByCategory = async function (req, res) {
    try {
        const category = req.params.category;
        const categoryData = await getCategoryData(category);

        console.log(`Category Data for ${category}:`, categoryData); // 콘솔에 출력

        return res.send(response(responseStatus.SUCCESS, categoryData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};



const responseStatus = require("/Users/moonyaeyoon/PINPLE-back/config/responseStatus.js");
const { response, errResponse } = require("../../../config/response");
const axios = require('axios');
const convert = require('xml-js');
const dmProvider = require("./dmProvider");
const dmDao = require("./dmDao");
const { pool } = require("/Users/moonyaeyoon/PINPLE-back/config/database")

const urls = {
    park: ['POI089', 'POI091', 'POI092', 'POI093', 'POI094', 'POI095', 'POI096', 'POI099', 'POI100', 'POI106', 'POI108', 'POI109', 'POI110'],
    tourist: ['POI001', 'POI002', 'POI003', 'POI004', 'POI005', 'POI006', 'POI007'],
    culture: ['POI008', 'POI009', 'POI012'],
    station: ['POI013', 'POI014', 'POI015', 'POI016', 'POI017', 'POI018', 'POI033', 'POI034', 'POI038', 'POI039', 'POI040', 'POI042', 'POI043', 'POI045', 'POI046'],
    popular: ['POI062', 'POI063', 'POI066', 'POI068', 'POI069', 'POI070', 'POI071', 'POI072', 'POI074', 'POI078', 'POI079', 'POI084']
};
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
        const citydata = JSON.parse(jsonData);
        // cityData가 undefined인 경우 빈 객체로 초기화
        const cityData = citydata['SeoulRtd.citydata']['CITYDATA'];
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

        console.log("Category FcstData:", allCategoryData); // 콘솔에 출력

        return res.send(response(responseStatus.SUCCESS, allCategoryData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};

/**
 * API No. 2
 * Name: 상세보기_혼잡도전망 API
 * [GET] /app/citydata/details/fcst
 */
exports.getFcstData = async function (req, res) {
    try {
        const fcstData = await dmProvider.getFcstData();
        console.log("Forecast Data:", fcstData);

        return res.send(response(responseStatus.SUCCESS, fcstData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};



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
        const randomLocations = await dmProvider.getRandomLocationsByCategory(category, 3);

        console.log(`Category Data for ${category}:`, randomLocations);

        return res.send(response(responseStatus.SUCCESS, randomLocations));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};


/**
 * API No. 5
 * Name: 장소 목록 API (혼잡도 높은순, 혼잡도 낮은순, 가나다순)
 * [GET] /app/citydata/list?sortby={}
 */

exports.getCityDataSorted = async function (req, res) {
    try {
        const sortBy = req.query.sortby;
        const cityData = await dmDao.selectCityData();
        const sortedData = await dmProvider.sortDataByCongestion(cityData, sortBy);

        console.log(`Sorted Data (Sort By: ${sortBy}):`, sortedData); // 콘솔에 정렬된 데이터 출력

        return res.send(response(responseStatus.SUCCESS, sortedData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};
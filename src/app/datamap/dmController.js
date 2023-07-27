
const responseStatus = require("/Users/moonyaeyoon/PINPLE-back/config/responseStatus.js");
const { response, errResponse } = require("../../../config/response");
const axios = require('axios');
const convert = require('xml-js');
const dmDao = require("./dmDao");
const dmProvider = require("./dmProvider");
const { pool } = require("/Users/moonyaeyoon/PINPLE-back/config/database")

const urls = {
    park: ['POI089', 'POI091', 'POI092', 'POI093', 'POI094', 'POI095', 'POI096', 'POI099', 'POI100', 'POI106', 'POI108', 'POI109', 'POI110'],
    tourist: ['POI001', 'POI002', 'POI003', 'POI004', 'POI005', 'POI006', 'POI007'],
    culture: ['POI008', 'POI009', 'POI012'],
    station: ['POI013', 'POI014', 'POI015', 'POI016', 'POI017', 'POI018', 'POI033', 'POI034', 'POI038', 'POI039', 'POI040', 'POI042', 'POI043', 'POI045', 'POI046'],
    popular: ['POI062', 'POI063', 'POI066', 'POI068', 'POI069', 'POI070', 'POI071', 'POI072', 'POI074', 'POI078', 'POI079', 'POI084']
};

/**
 * API No. 1
 * Name: 장소 혼잡도 API (전체)
 * [GET] /app/citydata
 */

exports.getAllCityData = async function (req, res) {
    try {
        const allCategoryData = {};
        const categoryPromises = Object.keys(urls).map(async (category) => {
            const categoryData = await userDao.getCategoryData(category);
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
 * [GET] /app/citydata/details/fcst
 */
// Assuming you already have the XML data in a variable named `jsonData`

exports.getCityDataForecast = async function (req, res) {
    try {
        const category = req.params.category; // Assuming the category is passed as a parameter, adjust this line if needed
        const categoryData = await getCategoryData(category);

        // Assuming you want to get the forecast data for the first location in the categoryData array
        const firstLocationForecast = categoryData[0];

        // Extract the forecast data
        const forecastData = {
            AREA_NM: firstLocationForecast.AREA_NM,
            FCST_TIME: [],
            FCST_CONGEST_LVL: []
        };

        for (const forecast of firstLocationForecast.FCST_PPLTN) {
            forecastData.FCST_TIME.push(forecast.FCST_TIME);
            forecastData.FCST_CONGEST_LVL.push(forecast.FCST_CONGEST_LVL);
        }

        console.log(`Forecast Data for ${category} - ${forecastData.AREA_NM}:`, forecastData); // Log the forecast data

        return res.send(response(responseStatus.SUCCESS, forecastData));
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
        const categoryData = await getCategoryData(category);

        // Shuffle the categoryData array to get a random order of locations
        shuffleArray(categoryData);

        // Get the first 3 locations from the shuffled array
        const randomLocations = categoryData.slice(0, 3);

        console.log(`Category Data for ${category}:`, randomLocations); // Log the randomly selected locations

        return res.send(response(responseStatus.SUCCESS, randomLocations));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};

// Function to shuffle an array randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


/**
 * API No. 5
 * Name: 장소 목록 API (혼잡도 높은순, 혼잡도 낮은순, 가나다순)
 * [GET] /app/citydata/list?sortby={}
 */

// 혼잡도 레벨에 따라 우선순위를 반환하는 함수
function getCongestLevelPriority(congestLvl) {
    switch (congestLvl) {
        case '상당히혼잡':
            return 3;
        case '다소혼잡':
            return 2;
        case '원활':
            return 1;
        default:
            return 0;
    }
}
// 혼잡도에 따라 데이터를 정렬하는 함수
async function sortDataByCongestion(dataArray, sortBy) {
    switch (sortBy) {
        case "congestion_high": // 혼잡도 높은 순으로 정렬
            dataArray.sort((a, b) => {
                const aCongestLvl = getCongestLevelPriority(a.AREA_CONGEST_LVL);
                const bCongestLvl = getCongestLevelPriority(b.AREA_CONGEST_LVL);
                return bCongestLvl - aCongestLvl;
            });
            break;
        case "congestion_low": // 혼잡도 낮은 순으로 정렬
            dataArray.sort((a, b) => {
                const aCongestLvl = getCongestLevelPriority(a.AREA_CONGEST_LVL);
                const bCongestLvl = getCongestLevelPriority(b.AREA_CONGEST_LVL);
                return aCongestLvl - bCongestLvl;
            });
            break;
        case "area_name": // 지역명 가나다 순으로 정렬
            dataArray.sort((a, b) => {
                return a.AREA_NM.localeCompare(b.AREA_NM);
            });
            break;
        default:
            // 기본은 혼잡도 높은 순으로 정렬
            dataArray.sort((a, b) => {
                const aCongestLvl = getCongestLevelPriority(a.AREA_CONGEST_LVL);
                const bCongestLvl = getCongestLevelPriority(b.AREA_CONGEST_LVL);
                return bCongestLvl - aCongestLvl;
            });
    }
    return dataArray;
}
exports.getCityDataSorted = async function (req, res) {
    try {
        const sortBy = req.query.sortby;
        const categoryData = await getCategoryData("all"); // 모든 카테고리의 데이터를 가져옵니다.
        const sortedData = await sortDataByCongestion(categoryData, sortBy); // 혼잡도에 따라 데이터를 정렬합니다.

        console.log(`Sorted Data (Sort By: ${sortBy}):`, sortedData); // 콘솔에 정렬된 데이터 출력

        return res.send(response(responseStatus.SUCCESS, sortedData));
    } catch (error) {
        console.error("Error:", error);
        return res.send(errResponse(responseStatus.SERVER_ERROR));
    }
};
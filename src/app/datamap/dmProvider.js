const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");

// citydata 테이블의 모든 데이터를 삭제하고 새로운 데이터를 추가하는 함수
async function updateAllCityData(cityData) {
    try {
        await dmDao.deleteAllCityData();
        await dmDao.updateCityData(cityData);
    } catch (error) {
        throw error;
    }
}
// 혼잡도 레벨에 따라 우선순위를 반환하는 함수
function getCongestLevelPriority(congestLvl) {
    switch (congestLvl) {
        case '붐빔':
            return 4;
        case '약간 붐빔':
            return 3;
        case '보통':
            return 2;
        case '여유' :
            return 1;
        default:
            return 0;
    }
}

// 혼잡도에 따라 데이터를 정렬하는 함수
function sortDataByCongestion(dataArray, sortBy) {
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
//장소 목록 업데이트 
async function updatePlaceList(dataArray) {
    try {
        await dmDao.insertPlaceListData(dataArray);
    } catch (error) {
        throw error;
    }
}
//혼잡도전망 데이터를 반환하는 함수 
async function getFcstData() {
    try {
        const fcstData = await dmDao.selectFcstData();
        return fcstData;
    } catch (error) {
        throw error;
    }
}

exports.retrieveScrap = async function(userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const scrapResult = await userDao.selectScraps(connection, userId);
    connection.release();

    return scrapResult;
}



module.exports = {
    updateAllCityData, sortDataByCongestion, getFcstData, updatePlaceList
};


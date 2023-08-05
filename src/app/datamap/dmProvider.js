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
// 추천장소 (랜덤3개)를 반환하는 함수
async function getRandomLocationsByCategory(category) {
    try {
        const categoryData = await dmDao.selectCityDataByCategory(category);
        // 배열을 랜덤으로 섞음
        const randomLocations = shuffleArray(categoryData);
        // 상위 3개의 요소를 추출
        const selectedLocations = randomLocations.slice(0, count);
        await dmDao.updateRecommendationPlace(selectedLocations);
        return selectedLocations;
    } catch (error) {
        throw error;
    }
}

// 배열을 랜덤으로 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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


module.exports = {
    updateAllCityData, getRandomLocationsByCategory, sortDataByCongestion, getFcstData, updatePlaceList
};


const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");

//추천장소 (랜덤3개)를 반환하는 함수
async function getRandomLocationsByCategory(category, count) {
    try {
        const categoryData = await dmDao.selectRecommendation(category);
        const randomLocations = shuffleArray(categoryData).slice(0, count);
        return randomLocations;
    } catch (error) {
        throw error;
    }
}

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

module.exports = {
    sortDataByCongestion, getRandomLocationsByCategory
};


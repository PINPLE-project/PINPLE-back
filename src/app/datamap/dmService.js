const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");
const dmProvider = require("./dmProvider");
const baseResponse = require("../../../config/responseStatus");
const {response, errResponse} = require("../../../config/response");

// 추천장소 (랜덤3개)를 반환하는 함수
async function getRandomLocationsByCategory(category) {
    try {
        const count = 3; // 항상 3으로 고정
        const categoryData = await dmDao.selectCityDataByCategory(category);
        const randomLocations = shuffleArray(categoryData).slice(0, count);
        await dmDao.updateRecommendationPlace(randomLocations);
        return randomLocations;
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
module.exports = { getRandomLocationsByCategory };
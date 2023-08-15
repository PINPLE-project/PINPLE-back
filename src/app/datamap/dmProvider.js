const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");

// citydata 테이블의 모든 데이터를 삭제하고 새로운 데이터를 추가하는 함수
async function updateAllCityData(categoryData) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    await dmDao.deleteAllCityData(connection);
    const updatedata = await dmDao.updateCityData(connection, categoryData);
    connection.release();
    return updatedata;
  } catch (error) {
    throw error;
  }
}

//스크랩
async function retrieveScrap(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const scrapResult = await dmDao.selectScraps(connection, userId);
  connection.release();

  return scrapResult;
}

//상세보기 조회 (장소 정보, 혼잡도 전망, 추천장소)
async function retrieveDetails(placeCode) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);

    const markerDetails = await dmDao.selectMarkerDetails(
      connection,
      placeCode
    );
    const category = markerDetails[0].CATEGORY;
    console.log("마커카테고리", category);
    const recommendationPlaces = await dmDao.selectRecommendationPlaces(
      connection,
      category
    );
    connection.release();

    return { markerDetails, recommendationPlaces };
  } catch (error) {
    throw error;
  }
}
//장소 목록
async function retrieveCityList(sortBy) {
  const connection = await pool.getConnection(async (conn) => conn);
  const cityDataList = await dmDao.selectCityList(connection, sortBy);
  connection.release();
  return cityDataList;
}

module.exports = {
  updateAllCityData,
  retrieveScrap,
  retrieveDetails,
  retrieveCityList,
};

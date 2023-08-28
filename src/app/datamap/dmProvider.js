const { pool } = require("../../../config/database");
const dmDao = require("./dmDao");
const pinViewDao = require("../../app/PinView/pinViewDao");

// citydata 테이블 업데이트
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

//스크랩 조회 (mypage)
async function retrieveScrap(userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const scrapResult = await dmDao.selectScraps(connection, userId);
  connection.release();

  return scrapResult;
}

//상세보기 조회 (장소 정보, 혼잡도 전망, 작성된 인근핀, 추천장소)
//12시간 전 혼잡도는 공공데이터 출력값에 없어서 구현 고민 중입니다... DB에 시간대별로 저장해두고 업데이트 하는 방식...?
//
async function retrieveDetails(placeId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);

    //장소 정보
    const markerDetails = await dmDao.selectMarkerDetails(connection, placeId);

    //혼잡도 전망 : 그래프
    const fcstData = [];
    for (let index = 0; index < 12; index++) {
      const result = await dmDao.selectFcstData(connection, index, placeId);
      fcstData.push(result[0]);
    }

    //혼잡도 전망 : 향후 12시간 중 최대 혼잡 시간
    let maxfcst = fcstData[0];
    for (let i = 1; i < fcstData.length; i++) {
      if (fcstData[i].fcstMax > maxfcst.fcstMax) {
        maxfcst = fcstData[i];
      }
    }

    //작성된 인근핀
    const nearbyPins = await pinViewDao.selectNearbyPins(connection, pinId);

    //추천 장소
    const category = markerDetails[0].category;
    console.log("마커카테고리", category);
    const recommendationPlaces = await dmDao.selectRecommendationPlaces(
      connection,
      category
    );
    connection.release();

    return {
      markerDetails,
      fcstData,
      maxfcst,
      nearbyPins,
      recommendationPlaces,
    };
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

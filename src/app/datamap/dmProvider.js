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
// 혼잡도 레벨에 따라 우선순위를 반환하는 함수
function getCongestLevelPriority(congestLvl) {
  switch (congestLvl) {
    case "붐빔":
      return 4;
    case "약간 붐빔":
      return 3;
    case "보통":
      return 2;
    case "여유":
      return 1;
    default:
      return 0;
  }
}

// 혼잡도에 따라 데이터를 정렬하는 함수
async function sortDataByCongestion(sortBy) {
  const dataArray = await dmDao.selectCityData();
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
  // 정렬된 데이터를 PlaceList 테이블에 삽입
  await dmDao.insertPlaceListData(dataArray);
  return dataArray;
}

//혼잡도전망 데이터를 반환하는 함수
async function selectFcstData() {
  const connection = await pool.getConnection(async (conn) => conn);
  const fcstData = await dmDao.insertFcstData(connection);
  connection.release();
  return fcstData;
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

module.exports = {
  updateAllCityData,
  sortDataByCongestion,
  selectFcstData,
  retrieveScrap,
  retrieveDetails,
};

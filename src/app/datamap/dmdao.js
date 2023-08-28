const axios = require("axios");
const convert = require("xml-js");
const { pool } = require("../../../config/database");

// 공공데이터 불러오기
async function updateCityData(connection, extractedDataArray) {
  try {
    const insertcitydataquery = `
      INSERT INTO citydata (placeId,category, placeName, congestLVL, congestFgrs, congestMSG, dataTime, fcstData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    // 모든 데이터를 Promise.all로 처리하여 데이터베이스에 저장
    const savePromises = extractedDataArray.map(async (data) => {
      const values = [
        data.placeId,
        data.category,
        data.placeName,
        data.congestLVL,
        data.congestFgrs,
        data.congestMSG,
        data.dataTime,
        JSON.stringify(data.fcstData),
      ];
      return connection.query(insertcitydataquery, values);
    });

    // 모든 저장 프로미스를 병렬로 실행
    await Promise.all(savePromises);

    // 성공적으로 저장된 경우 반환
    return true;
  } catch (error) {
    // 저장 중 오류가 발생한 경우 에러를 던짐
    throw error;
  }
}

// citydata테이블 데이터 삭제 (업데이트 위해)
async function deleteAllCityData(connection) {
  const delectecityDataquery = "DELETE FROM citydata";
  const deletecitydatarows = await connection.query(delectecityDataquery);
  return deletecitydatarows;
}

//전체 도시데이터 조회
async function selectCityData() {
  try {
    const selectCityDataquery = "SELECT * FROM citydata";
    const result = await pool.query(selectCityDataquery);
    return result;
  } catch (error) {
    throw error;
  }
}

//클릭한 마커의 장소 정보 조회 (by placeId)
async function selectPinDataByplaceId(connection, placeId) {
  const selectpinquery = `
      SELECT c.placeId, c.category, c.placeName, c.congestLVL, c.congestMSG
      FROM citydata c
      WHERE c.placeId = ?
    `;
  const [selectpinrows] = await connection.query(selectpinquery, [placeId]);
  return selectpinrows;
}

// 상세보기_클릭한 장소 정보
async function selectMarkerDetails(connection, placeId) {
  const selectMarkerDetailsQuery = `
    SELECT c.placeId, c.category, c.placeName, c.congestLVL, c.congestMSG
    FROM citydata c
    WHERE c.placeId = ?;
  `;
  const [markerDetailsRows] = await connection.query(selectMarkerDetailsQuery, [
    placeId,
  ]);
  return markerDetailsRows;
}

// 상세보기_클릭한 장소와 동일 카테고리 장소 추천 (3곳)
async function selectRecommendationPlaces(connection, category, limit = 3) {
  const selectRecommendationPlacesQuery = `
    SELECT c.category, c.placeName, c.congestLVL
    FROM citydata c
    WHERE c.category = ?
    ORDER BY RAND()
    LIMIT ?;
  `;
  const [recommendationPlacesRows] = await connection.query(
    selectRecommendationPlacesQuery,
    [category, limit]
  );
  return recommendationPlacesRows;
}

//혼잡도 전망 조회 (12시간 후 까지)
async function selectFcstData(connection, index, placeId) {
  const selectFcstquery = `
    SELECT
        JSON_UNQUOTE(JSON_EXTRACT(fcstData, CONCAT('$.FCST_PPLTN[', ? ,'].FCST_TIME._text'))) AS fcstTime,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(fcstData, CONCAT('$.FCST_PPLTN[', ? ,'].FCST_PPLTN_MAX._text'))) AS UNSIGNED) AS fcstMax,
        CAST(JSON_UNQUOTE(JSON_EXTRACT(fcstData, CONCAT('$.FCST_PPLTN[', ? ,'].FCST_PPLTN_MIN._text'))) AS UNSIGNED) AS fcstMin,
        JSON_UNQUOTE(JSON_EXTRACT(fcstData, CONCAT('$.FCST_PPLTN[', ? ,'].FCST_CONGEST_LVL._text'))) AS fcstCongestLVL
    FROM citydata c
    WHERE c.placeId = ?;
  `;
  const values = [placeId];
  try {
    const [fcstRows] = await connection.query(selectFcstquery, [
      index,
      index,
      index,
      index,
      values,
    ]);
    return fcstRows;
  } catch (error) {
    throw error;
  }
}

// 인근 핀 조회
async function selectNearbyPins(connection, placeId) {
  const selectNearbyPinsQuery = `
    SELECT n.pinId, n.pinCongest, n.createdAt
    FROM nearByPin n
    WHERE placeId = ?;
  `;
  try {
    const [nearbyPinsRows] = await connection.query(
      selectNearbyPinsQuery,
      placeId
    );
    return nearbyPinsRows;
  } catch (error) {
    throw error;
  }
}

// erd cloud에 업로드한 table 형태 참고해서 insert하고 select하도록 했습니다! 편하신대로 수정하셔도 괜찮습니다!
async function insertScrap(connection, insertScrapParams) {
  const insertQuestionQuery = `
          INSERT INTO scrap(userId, placeId) 
          VALUES(?, ?);
  `;
  const insertScrapRows = await connection.query(
    insertQuestionQuery,
    insertScrapParams
  );
  return insertScrapRows;
}

// 스크랩 가능한 장소 개수 확인 (최대 3개)
async function selectScrapLimit(connection, userId) {
  const selectScrapCountQuery = `
    SELECT COUNT(*) AS count 
    FROM scrap s
    WHERE s.userId = ?
  `;
  const [selectScrapCountrows] = await connection.query(
    selectScrapCountQuery,
    userId
  );
  const currentScrapCount = selectScrapCountrows[0].count;
  return currentScrapCount < 3; // 최대 스크랩 가능 개수는 3개
}

// 이미 스크랩한 장소인지 확인
async function selectisScrapped(connection, placeId) {
  const selectisScrappedQuery = `
    SELECT * FROM scrap WHERE userId = ? AND placeId =?
  `;
  const [isScrappedrows] = await connection.query(selectisScrappedQuery, [
    placeId,
  ]);
  return isScrappedrows.length > 0;
}

// scrap 테이블에 저장된 place_id로 db에 저장된 citydata를 조회하도록 했습니다!
async function selectScraps(connection, userId) {
  const selectScrapsQuery = `
      SELECT c.placeName, c.congestLVL
      FROM citydata c JOIN scrap s ON c.placeId = s.placeId
      where s.userId = ?;
  `;
  const [questionRow] = await connection.query(selectScrapsQuery, userId);
  return questionRow;
}
//스크랩 삭제
async function deleteScrap(connection, deleteScrapParams) {
  const deleteQuestionQuery = `
      DELETE FROM scrap
      WHERE userId = ? AND placeId =?;
  `;
  const deleteQuestionRows = await connection.query(
    deleteQuestionQuery,
    deleteScrapParams
  );
  return deleteQuestionRows;
}

//장소 목록 (혼잡도 높은 순(default), 낮은 순, 가나다 순)
async function selectCityList(connection, sortBy) {
  let orderByClause = "";
  if (sortBy === "high") {
    orderByClause =
      'ORDER BY FIELD(congestLVL, "붐빔", "약간 붐빔", "보통", "여유"), congestFgrs DESC'; //congestLVL이 동일한 경우 congestFgrs 숫자가 큰 순서대로
  } else if (sortBy === "low") {
    orderByClause = orderByClause =
      'ORDER BY FIELD(congestLVL, "여유", "보통", "약간 붐빔", "붐빔"), congestFgrs ASC'; //congestLVL이 동일한 경우 congestFgrs 숫자가 작은 순서대로
  } else if (sortBy === "name") {
    orderByClause = "ORDER BY placeName";
  }
  const selectCityListQuery = `
    SELECT c.placeName, c.congestLVL
    FROM citydata c
    ${orderByClause};
  `;
  const [cityListRows] = await connection.query(selectCityListQuery);
  return cityListRows;
}

module.exports = {
  deleteAllCityData,
  updateCityData,
  selectCityData,
  selectPinDataByplaceId,
  selectScrapLimit,
  selectisScrapped,
  insertScrap,
  selectScraps,
  deleteScrap,
  selectMarkerDetails,
  selectFcstData,
  selectNearbyPins,
  selectRecommendationPlaces,
  selectCityList,
};

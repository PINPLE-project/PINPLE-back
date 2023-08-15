const axios = require("axios");
const convert = require("xml-js");
const { pool } = require("../../../config/database");

// 공공데이터 불러오기
async function updateCityData(connection, extractedDataArray) {
  try {
    // 쿼리문 작성
    const insertcitydataquery = `
      INSERT INTO citydata (CATEGORY,CODE, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    // 모든 데이터를 Promise.all로 처리하여 데이터베이스에 저장
    const savePromises = extractedDataArray.map(async (data) => {
      const values = [
        data.CATEGORY,
        data.CODE,
        data.AREA_NM,
        data.AREA_CONGEST_LVL,
        data.AREA_CONGEST_MSG,
        data.AREA_DATA_TIME,
        JSON.stringify(data.FCST_PPLTN),
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

//클릭한 마커의 장소 데이터만 불러오기 (by code)
async function selectPinDataByCode(connection, placeCode) {
  const selectpinquery = `
      SELECT CODE, CATEGORY, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG
      FROM citydata
      WHERE CODE = ?
    `;
  const [selectpinrows] = await connection.query(selectpinquery, [placeCode]);
  return selectpinrows;
}

/*
 *  장소 스크랩
 */
//스크랩 가능한 장소 개수 확인 (최대 3개)

// 상세보기_클릭한 장소 정보
async function selectMarkerDetails(connection, placeCode) {
  const selectMarkerDetailsQuery = `
    SELECT c.CODE, c.CATEGORY, c.AREA_NM, c.AREA_CONGEST_LVL, c.AREA_CONGEST_MSG, c.FCST_PPLTN
    FROM citydata c
    WHERE c.CODE = ?;
  `;
  const [markerDetailsRows] = await connection.query(selectMarkerDetailsQuery, [
    placeCode,
  ]);
  return markerDetailsRows;
}

// 상세보기_클릭한 장소와 동일 카테고리 장소 추천 (3곳)
async function selectRecommendationPlaces(connection, category, limit = 3) {
  const selectRecommendationPlacesQuery = `
    SELECT c.CATEGORY, c.AREA_NM, c.AREA_CONGEST_LVL
    FROM citydata c
    WHERE c.CATEGORY = ?
    ORDER BY RAND()
    LIMIT ?;
  `;
  const [recommendationPlacesRows] = await connection.query(
    selectRecommendationPlacesQuery,
    [category, limit]
  );
  return recommendationPlacesRows;
}

// 데이터를 PlaceList 테이블에 삽입하는 함수
async function insertPlaceListData(dataArray) {
  try {
    // 모든 삽입 프로미스를 저장할 배열
    const insertPromises = [];
    // dataArray를 map으로 순회하며 각 데이터를 삽입
    dataArray.forEach((data) => {
      const insertDataQuery = `
        INSERT INTO PlaceList (CATEGORY, CODE,  AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        data.CATEGORY,
        data.CODE,
        data.AREA_NM,
        data.AREA_CONGEST_LVL,
        data.AREA_CONGEST_MSG,
        data.AREA_DATA_TIME,
        JSON.stringify(data.FCST_PPLTN),
      ];
      console.log(values);

      // 각 데이터에 대한 삽입 프로미스를 생성하여 배열에 추가
      insertPromises.push(pool.query(insertDataQuery, values));
    });

    // 모든 삽입 프로미스를 병렬로 실행
    await Promise.all(insertPromises);

    // 성공적으로 삽입된 경우 반환
    return true;
  } catch (error) {
    // 삽입 중 오류가 발생한 경우 에러를 던짐
    throw error;
  }
}

// PlaceList 테이블에서 데이터를 조회하는 함수
async function selectPlaceListData() {
  try {
    const selectDataQuery = "SELECT * FROM PlaceList";
    const result = await pool.query(selectDataQuery);
    return result.rows;
  } catch (error) {
    throw error;
  }
}
// erd cloud에 업로드한 table 형태 참고해서 insert하고 select하도록 했습니다! 편하신대로 수정하셔도 괜찮습니다!
async function insertScrap(connection, insertScrapParams) {
  const insertQuestionQuery = `
          INSERT INTO scrap(userId, place_id) 
          VALUES(?, ?);
  `;

  const insertScrapRows = await connection.query(
    insertQuestionQuery,
    insertScrapParams
  );
  return insertScrapRows;
}

// scrap 테이블에 저장된 place_id로 db에 저장된 citydata를 조회하도록 했습니다!
async function selectScraps(connection, userId) {
  const selectScrapsQuery = `
      SELECT c.area_nm, c.road_addr, c.area_congest_lvl
      FROM citydata c JOIN scrap s ON c.place_id = s.place_id
      where s.userId = ?;
  `;
  const [questionRow] = await connection.query(selectScrapsQuery, userId);
  return questionRow;
}

async function deleteScrap(connection, deleteScrapParams) {
  const deleteQuestionQuery = `
      DELETE FROM scrap
      WHERE userId = ? AND place_id =?;
  `;
  const deleteQuestionRows = await connection.query(
    deleteQuestionQuery,
    deleteScrapParams
  );
  return deleteQuestionRows;
}

module.exports = {
  deleteAllCityData,
  updateCityData,
  selectCityData,
  selectPinDataByCode,
  insertScrap,
  selectScraps,
  deleteScrap,
  selectMarkerDetails,
  selectRecommendationPlaces,
  insertPlaceListData,
  selectPlaceListData,
};

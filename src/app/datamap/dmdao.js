const axios = require("axios");
const convert = require("xml-js");
const { pool } = require("../../../config/database");

//전체 도시데이터 삽입
async function insertCityData(extractedDataArray) {
  try {
    // 쿼리문 작성
    const insertcitydataquery = `
      INSERT INTO citydata (CATEGORY, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    // 모든 데이터를 Promise.all로 처리하여 데이터베이스에 저장
    const savePromises = extractedDataArray.map(async (data) => {
      const values = [
        data.CATEGORY,
        data.AREA_NM,
        data.AREA_CONGEST_LVL,
        data.AREA_CONGEST_MSG,
        data.AREA_DATA_TIME,
        JSON.stringify(data.FCST_PPLTN),
      ];
      return pool.query(insertcitydataquery, values);
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
// citydata 테이블에 있는 모든 데이터 삭제
async function deleteAllCityData() {
  try {
    const query = "DELETE FROM citydata";
    await pool.query(query);
  } catch (error) {
    throw error;
  }
}

// citydata 테이블에 데이터를 업데이트하는 함수
async function updateCityData(dataArray) {
  try {
    const insertCityDataQuery = `
      INSERT INTO citydata (CATEGORY, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const savePromises = dataArray.map(async (data) => {
      const values = [
        data.CATEGORY,
        data.AREA_NM,
        data.AREA_CONGEST_LVL,
        data.AREA_CONGEST_MSG,
        data.AREA_DATA_TIME,
        JSON.stringify(data.FCST_PPLTN),
      ];
      return pool.query(insertCityDataQuery, values);
    });

    await Promise.all(savePromises);
    return true;
  } catch (error) {
    throw error;
  }
}

// 추천장소 테이블에 데이터를 업데이트하는 함수
async function updateRecommendationPlace(values) {
  try {
    const insertRecommendationQuery = `
      INSERT INTO recommendationPlace (CATEGORY, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // const values = [
    //   data.CATEGORY,
    //   data.AREA_NM,
    //   data.AREA_CONGEST_LVL,
    //   data.AREA_CONGEST_MSG,
    //   data.AREA_DATA_TIME,
    //   JSON.stringify(data.FCST_PPLTN),
    // ];
    await pool.query(insertRecommendationQuery, values);
    // dataArray.map(async (data) => {
    //   console.log(data);
    //   const values = [
    //     data.CATEGORY,
    //     data.AREA_NM,
    //     data.AREA_CONGEST_LVL,
    //     data.AREA_CONGEST_MSG,
    //     data.AREA_DATA_TIME,
    //     JSON.stringify(data.FCST_PPLTN),
    //   ];
    //   await pool.query(insertRecommendationQuery, values);
    // });

    // const updatePromises = dataArray.map(async (data) => {
    //     const values = [
    //         data.CATEGORY,
    //         data.AREA_NM,
    //         data.AREA_CONGEST_LVL,
    //         data.AREA_CONGEST_MSG,
    //         data.AREA_DATA_TIME,
    //         JSON.stringify(data.FCST_PPLTN),
    //     ];
    //     return pool.query(insertRecommendationQuery, values);
    // });

    // await Promise.all(updatePromises);

    // 성공적으로 저장된 경우 반환
    return true;
  } catch (error) {
    // 저장 중 오류가 발생한 경우 에러를 던짐
    throw error;
  }
}

// citydata 테이블에서 해당 카테고리 데이터를 추출하는 함수
async function selectCityDataByCategory(category) {
  try {
    const selectCityDatabyCategoryquery =
      "SELECT * FROM citydata WHERE CATEGORY = ?";
    const values = [category];
    const result = await pool.query(selectCityDatabyCategoryquery, values);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

// 추천장소 테이블에 데이터를 업데이트하는 함수
async function updateRecommendationPlace(dataArray) {
  try {
    const insertRecommendationQuery = `
      INSERT INTO recommendationPlace (CATEGORY, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    // 성공적으로 저장된 경우 반환
    return pool.query(insertRecommendationQuery, dataArray);
  } catch (error) {
    // 저장 중 오류가 발생한 경우 에러를 던짐
    throw error;
  }
}
// 데이터를 FcstData 테이블에 삽입하는 함수
async function insertFcstData(dataArray) {
  try {
    const insertDataQuery = `
            INSERT INTO FcstData (AREA_NM, FCST_PPLTN)
            VALUES (?, ?)
        `;

    // dataArray를 map으로 순회하며 각 데이터를 삽입
    const insertPromises = dataArray.map(async (data) => {
      const values = [data.AREA_NM, JSON.stringify(data.FCST_PPLTN)];

      return pool.query(insertDataQuery, values);
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

// FcstData 테이블에서 데이터를 조회하는 함수
async function selectFcstData() {
  try {
    const query = "SELECT * FROM FcstData";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

// 데이터를 PlaceList 테이블에 삽입하는 함수
async function insertPlaceListData(dataArray) {
  try {
    const insertDataQuery = `
      INSERT INTO PlaceList (CATEGORY,AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // dataArray를 map으로 순회하며 각 데이터를 삽입
    const insertPromises = dataArray.map(async (data) => {
      const values = [
        data.CATEGORY,
        data.AREA_NM,
        data.AREA_CONGEST_LVL,
        data.AREA_CONGEST_MSG,
        data.AREA_DATA_TIME,
        JSON.stringify(data.FCST_PPLTN),
      ];

      return pool.query(insertDataQuery, values);
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
async function insertScrap(connection, insertScrapParams){
  const insertQuestionQuery = `
          INSERT INTO scrap(userId, place_id) 
          VALUES(?, ?);
  `;

  const insertScrapRows = await connection.query(insertQuestionQuery, insertScrapParams);
  return insertScrapRows;
}

// scrap 테이블에 저장된 place_id로 db에 저장된 citydata를 조회하도록 했습니다!
async function selectScraps(connection, userId){
  const selectScrapsQuery = `
      SELECT c.area_nm, c.road_addr, c.area_congest_lvl
      FROM citydata c JOIN scrap s ON c.place_id = s.place_id
      where s.userId = ?;
  `
  const [questionRow] = await connection.query(selectScrapsQuery, userId);
  return questionRow;
}

async function deleteScrap(connection, deleteScrapParams){
  const deleteQuestionQuery = `
      DELETE FROM scrap
      WHERE userId = ? AND place_id =?;
  `
  const deleteQuestionRows = await connection.query(deleteQuestionQuery, deleteScrapParams);
  return deleteQuestionRows;

}

module.exports = {
  deleteAllCityData,
  updateCityData,
  insertCityData,
  selectCityData,
  selectCityDataByCategory,
  updateRecommendationPlace,
  insertFcstData,
  selectFcstData,
  insertPlaceListData,
  selectPlaceListData,
  insertScrap,
  selectScraps,
  deleteScrap
};

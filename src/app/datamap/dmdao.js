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
      SELECT CODE, CATEGORY, AREA_NM, AREA_CONGEST_LVL
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
      INSERT INTO recommendationPlace (CATEGORY,CODE, AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    // 성공적으로 저장된 경우 반환
    return pool.query(insertRecommendationQuery, dataArray);
  } catch (error) {
    // 저장 중 오류가 발생한 경우 에러를 던짐
    throw error;
  }
}
// 데이터를 FcstData 테이블에 삽입하는 함수
async function insertFcstData(connection) {
  const selectfcstQuery = `
    SELECT AREA_NM, FCST_PPLTN
    FROM citydata
  `;
  const [fcstRow] = await connection.query(selectfcstQuery);
  // FcstData 테이블에 데이터를 삽입
  const insertfcstQuery = `
      INSERT INTO FcstData (AREA_NM, FCST_PPLTN)
      VALUES ?
    `;

  const values = fcstRows.map((row) => [row.AREA_NM, row.FCST_PPLTN]);

  await connection.query(insertfcstQuery, [values]);
  // 삽입된 데이터 출력
  console.log("Inserted FcstData Row:", fcstRow);
  return fcstRow;
}

// FcstData 테이블에서 데이터를 조회하는 함수
async function selectFcstData() {
  try {
    const query = "n";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
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
  selectCityDataByCategory,
  updateRecommendationPlace,
  insertFcstData,
  selectFcstData,
  insertPlaceListData,
  selectPlaceListData,
};

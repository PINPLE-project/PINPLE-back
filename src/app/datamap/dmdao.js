
const axios = require('axios');
const convert = require('xml-js');
const { pool } = require("../../../config/database");

async function insertCityData(extractedDataArray) {
    try {
        // 쿼리문 작성
        const insertcitydataquery = `
      INSERT INTO citydata (AREA_NM, AREA_CONGEST_LVL, AREA_CONGEST_MSG, AREA_DATA_TIME, FCST_PPLTN)
      VALUES (?, ?, ?, ?, ?)
    `;

        // 모든 데이터를 Promise.all로 처리하여 데이터베이스에 저장
        const savePromises = extractedDataArray.map(async (data) => {
            const values = [
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

async function selectRecommendation(category) {
    try {
        const query = "SELECT * FROM citydata WHERE category = ?";
        const values = [category];
        const result = await pool.query(query, values);
        return result.rows; 
    } catch (error) {
        throw error;
    }
}

async function selectCityData() {
    try {
        const query = "SELECT * FROM citydata";
        const result = await pool.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}

async function selectFcstData() {
    try {
        const query = "SELECT AREA_NM, FCST_PPLTN FROM citydata";
        const result = await pool.query(query);
        return result;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    insertCityData, selectRecommendation, selectCityData, selectFcstData
};

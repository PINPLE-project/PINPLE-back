// userId에 대해 설정된 알림 모두 조회
async function selectSetupAlert(connection, userIdFromJWT) {
  const selectSetupAlertListQuery = `
                                    SELECT placeId, time
                                    FROM Alert
                                    WHERE (userId = ? AND status = 0)
                                    ORDER BY time;
                                    `;
  const selectAlertRow = await connection.query(
    selectSetupAlertListQuery,
    userIdFromJWT
  );
  return selectAlertRow;
}

// userId에 대한 알림 기록 모두 조회
async function selectRecordAlert(connection, userIdFromJWT) {
  const selectRecordAlertListQuery = `
                                    SELECT placeId, time
                                    FROM Alert
                                    WHERE userId = ? AND status = 1
                                    ORDER BY time;
                                    `;
  const selectAlertRow = await connection.query(
    selectRecordAlertListQuery,
    userIdFromJWT
  );
  return selectAlertRow;
}

// userId에 대해 날짜에 해당하는 알림 기록 조회
async function selectRecordAlertByDate(connection, userIdFromJWT, date) {
  const selectRecordAlertListQuery = `
                                    SELECT placeId, time
                                    FROM Alert
                                    WHERE userId = ? AND status = 1 AND DATE(time) = ?
                                    ORDER BY time;
                                    `;
  const selectAlertRow = await connection.query(selectRecordAlertListQuery, [
    userIdFromJWT,
    date,
  ]);
  return selectAlertRow;
}

// 알림 추가
async function insertAlert(connection, AlertParams) {
  const insertAlertQuery = `
                            INSERT INTO Alert(userId, placeId, time)
                            VALUES (?, ?, ?);
                            `;
  const insertAlertRow = await connection.query(insertAlertQuery, AlertParams);
  return insertAlertRow;
}

// 중복된 알림 추가를 막기 위해 조건에 해당하는 알림 조회
async function selectSetupAlertForCheck(connection, AlertParams) {
  const selectSetupAlertForCheckListQuery = `
                                            SELECT userId, placeId, time
                                            FROM Alert
                                            WHERE userId = ? AND placeId = ? AND time = ?;
                                            `;
  const selectAlertRow = await connection.query(
    selectSetupAlertForCheckListQuery,
    AlertParams
  );
  return selectAlertRow;
}

// 알림 삭제
async function deleteAlert(connection, alertId) {
  const selectAlertQuery = `
                            SELECT alertId, userId, placeId, time, status
                            FROM Alert
                            WHERE alertId = ?;
                            `;
  const deleteAlertQuery = `
                            DELETE FROM Alert
                            WHERE alertId = ?;
                            `;
  selectAlertRow = await connection.query(selectAlertQuery, alertId);
  deleteAlertRow = await connection.query(deleteAlertQuery, alertId);
  return selectAlertRow;
}

// placeName에 해당하는 placeId 조회
async function selectPlaceId(connection, placeName) {
  const selectPlaceIdQuery = `
                              SELECT placeId
                              FROM CityData
                              WHERE placeName = ?;
                              `;
  let placeId = await connection.query(selectPlaceIdQuery, placeName);
  return placeId;
}

// 디바이스 토큰 조회
async function selectDeviceToken(connection, userIdFromJWT) {
  const selectDeviceTokenQuery = `
                                  SELECT deviceToken
                                  FROM User
                                  WHERE userId = ?;
                                  `;
  deviceToken = await connection.query(selectDeviceTokenQuery, userIdFromJWT);
  return deviceToken;
}

// 혼잡도 정보 조회
async function selectCongestionInfo(connection, place) {
  const selectCongestionInfoQuery = `
                                    SELECT placeCongestLVL, placeCongestMSG
                                    FROM CityData
                                    WHERE placeName = ?;
                                    `;
  congestionInfo = await connection.query(selectCongestionInfoQuery, place);
  return congestionInfo;
}

module.exports = {
  selectSetupAlert,
  selectRecordAlert,
  selectRecordAlertByDate,
  insertAlert,
  selectSetupAlertForCheck,
  deleteAlert,
  selectPlaceId,
  selectDeviceToken,
  selectCongestionInfo,
};

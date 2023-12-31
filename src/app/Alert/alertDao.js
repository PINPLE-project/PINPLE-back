// userId에 대해 설정된 알림 모두 조회
async function selectSetupAlert(connection, userId) {
  const selectSetupAlertListQuery = `
                                    SELECT c.AREA_NM, a.time
                                    FROM Alert as a
                                    JOIN citydata2 as c ON a.placeId = c.place_id
                                    WHERE a.userId = ? AND a.status = 0
                                    ORDER BY a.time;
                                    `;
  const selectAlertRow = await connection.query(
    selectSetupAlertListQuery,
    userId
  );
  return selectAlertRow;
}

// userId에 대한 알림 기록 모두 조회
async function selectRecordAlert(connection, userId) {
  const selectRecordAlertListQuery = `
                                    SELECT c.AREA_NM, a.time, a.congestionLVL
                                    FROM Alert as a
                                    JOIN citydata2 as c ON a.placeId = c.place_id
                                    WHERE a.userId = ? AND a.status = 1
                                    ORDER BY a.time;
                                    `;
  const selectAlertRow = await connection.query(
    selectRecordAlertListQuery,
    userId
  );
  return selectAlertRow;
}

// userId에 대해 날짜에 해당하는 알림 기록 조회
async function selectRecordAlertByDate(connection, userId, date) {
  const selectRecordAlertListQuery = `
                                    SELECT c.AREA_NM, a.time, a.congestionLVL
                                    FROM Alert as a
                                    JOIN citydata2 as c ON a.placeId = c.place_id
                                    WHERE a.userId = ? AND a.status = 1 AND DATE(time) = ?
                                    ORDER BY a.time;
                                    `;
  const selectAlertRow = await connection.query(selectRecordAlertListQuery, [
    userId,
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

// 장소명 모두 조회
async function selectPlaces(connection) {
  const selectPlacesQuery = `
                              SELECT AREA_NM
                              FROM citydata2;
                              `;
  let placeRows = await connection.query(selectPlacesQuery);
  return placeRows;
}

// placeName에 해당하는 placeId 조회
async function selectPlaceId(connection, placeName) {
  const selectPlaceIdQuery = `
                              SELECT place_id
                              FROM citydata2
                              WHERE AREA_NM = ?;
                              `;
  let placeId = await connection.query(selectPlaceIdQuery, placeName);
  return placeId;
}

// 디바이스 토큰 조회
async function selectDeviceToken(connection, userId) {
  const selectDeviceTokenQuery = `
                                  SELECT deviceToken
                                  FROM User
                                  WHERE userId = ?;
                                  `;
  const deviceToken = await connection.query(selectDeviceTokenQuery, userId);
  return deviceToken;
}

// Alert 테이블에 혼잡도 정보 반영
async function updateCongestionInfo(connection, congestionInfo, AlertParams) {
  const updateCongestionInfoQuery = `
                                    UPDATE Alert
                                    SET congestionLVL = ?
                                      , congestionMSG = ?
                                      , status = 1
                                    WHERE userId = ? AND placeId = ? AND time = ?;
                                    `;
  const updateCongestionInfoRow = await connection.query(
    updateCongestionInfoQuery,
    [
      congestionInfo["AREA_CONGEST_LVL"],
      congestionInfo["AREA_CONGEST_MSG"],
      ...AlertParams,
    ]
  );
  return updateCongestionInfoRow;
}

module.exports = {
  selectSetupAlert,
  selectRecordAlert,
  selectRecordAlertByDate,
  insertAlert,
  selectSetupAlertForCheck,
  deleteAlert,
  selectPlaces,
  selectPlaceId,
  selectDeviceToken,
  updateCongestionInfo,
};

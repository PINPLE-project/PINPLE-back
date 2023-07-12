// 알림 추가
async function insertAlert(connection, AlertParams) {
  const insertAlertQuery = `
                            INSERT INTO Alert(userId, place, time)
                            VALUES (?, ?, ?);
                            `;
  const insertAlertRow = await connection.query(insertAlertQuery, AlertParams);
  return insertAlertRow;
}

// 중복된 알림 추가를 막기 위해 조건에 해당하는 알림 조회
async function selectSetupAlertForCheck(connection, AlertParams) {
  const selectSetupAlertForCheckListQuery = `
                                SELECT place, time
                                FROM Alert
                                WHERE userId = ? AND place = ? AND time = ?
                                `;
  const selectAlertRow = await connection.query(
    selectSetupAlertForCheckListQuery,
    AlertParams
  );
  return selectAlertRow;
}

module.exports = { insertAlert, selectSetupAlertForCheck };

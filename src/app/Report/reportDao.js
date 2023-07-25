// 신고 추가
async function insertReport(connection, reportParams) {
  const insertReportQuery = `
                              INSERT INTO Report(pinviewId, userId, reason1, reason2, reason3, reason4, reason5)
                              VALUES (?, ?, ?, ?, ?, ?, ?);
                              `;
  const insertReportRow = await connection.query(
    insertReportQuery,
    reportParams
  );
  return insertReportRow;
}

// 중복 신고 여부 확인
async function selectReportForCheck(connection, userId, pinviewId) {
  const selectReportForCheckListQuery = `
                                            SELECT userId, pinviewId
                                            FROM Report
                                            WHERE userId = ? AND pinviewId = ?;
                                            `;
  const selectReportRow = await connection.query(
    selectReportForCheckListQuery,
    [userId, pinviewId]
  );
  return selectReportRow;
}

module.exports = { insertReport, selectReportForCheck };

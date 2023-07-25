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

module.exports = { insertReport };

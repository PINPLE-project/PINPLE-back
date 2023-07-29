  // id로 유저 조회
  async function selectUserId(connection, id) {
    // db 이름 변경 필요
    const selectUserIdQuery = `
                    SELECT userId
                    FROM user
                    WHERE userId = ?;
                    `;
    const [idRows] = await connection.query(selectUserIdQuery, id);
    return idRows;
}

module.exports = {
    selectUserId
};

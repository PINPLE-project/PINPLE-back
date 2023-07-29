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

async function insertUser(connection, id, nickname){
  const insertQuestionQuery = `
          INSERT INTO user(userId, nickname, socialType) VALUES('${id}', '${nickname}', IF('${id}' LIKE '%@gmail.com', 2, 1));
  `;

  const insertQuestionRows = await connection.query(insertQuestionQuery);
  return insertQuestionRows;
}

module.exports = {
    selectUserId,
    insertUser,
};

  //핀지도 생성
  async function insertPin(connection, insertPinParams) {
    const insertPinQuery = `
          INSERT INTO pinView(userId, longitude, latitude, address, pinCongest, pinFeeling, contents)
          VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
    const insertPinRows = await connection.query(
      insertPinQuery,
      insertPinParams
    );
  
    return insertPinRows;
  }

  //전체 핀지도 조회
  async function selectPin(connection) {
    const selectPinListQuery = `
                    SELECT pinFeeling, address
                    FROM pinView
                    WHERE status = 1;
                  `;
    const [pinRows] = await connection.query(selectPinListQuery);
    return pinRows;
  }


  //특정 핀지도 조회
  async function selectPinById(connection, pinId, userId) {
    const selectPinIdQuery = `
                SELECT p.address, u.nickname, p.createdAt, p.pinCongest, p.pinFeeling, p.contents, p.likeCount, TIMEDIFF (NOW(), p.createdAt) as passedTime,
                (SELECT exists (
                  SELECT userId
                  FROM likes
                  WHERE pinId = ${pinId} AND userId =${userId}
                )) as isLike
                FROM pinView p, User u
                WHERE p.userId = u.userId AND pinId = ${pinId};
                `;
    const [pinRow] = await connection.query(selectPinIdQuery, pinId, userId);
    return pinRow;
}

    // 최근 조회한 핀지도가 테이블에 이미 있는 경우 삭제
    async function deleteRecentPin(connection, pinId, userId) {
      const deleteRecentPinQuery = `
            DELETE FROM pinHistory
            WHERE pinId = ${pinId} AND userId = ${userId};
        `;
      const deleteRecentPinRows = await connection.query(
        deleteRecentPinQuery,
        pinId,
        userId
      );
    
      return deleteRecentPinRows;
    }

    //최근 조회한 핀지도 저장
    async function insertRecentPin(connection, pinId, userId) {
      const insertRecentPinQuery = `
            INSERT INTO pinHistory(pinId, userId)
            VALUES (${pinId}, ${userId});
        `;
      const insertRecentPinRows = await connection.query(
        insertRecentPinQuery,
        pinId,
        userId
      );
    
      return insertRecentPinRows;
    }

    //최근 조회한 핀지도 10개 조회
    async function selectRecentPin(connection, userId) {
      const selectRecentPinQuery = `
            SELECT p.pinId, p.pinFeeling, p.address, (TIMEDIFF (NOW(), p.createdAt)) as passedTime
            FROM pinHistory h, pinView p
            WHERE h.pinId = p.pinId AND h.userId = ${userId}
            LIMIT 10;
        `;
      const [selectRecentPinRows] = await connection.query(
        selectRecentPinQuery,
        userId
      );
    
      return selectRecentPinRows;
    }

  //최근 조회한 핀지도 삭제
  async function deleteMyPin(connection, userId, pinId) {
    const deleteMyPinQuery = `
                  DELETE FROM pinHistory
                  WHERE userId = ${userId} AND pinId = ${pinId};
                  `;
    const deleteMyPinRows = await connection.query(deleteMyPinQuery, userId, pinId);
    return deleteMyPinRows;
  }


  //특정 핀지도 삭제
  async function deletePin(connection, pinId) {
    const deletePinQuery = `
                  UPDATE pinView
                  SET status = 0
                  WHERE pinId = ?;
                  `;
    const deletePinRows = await connection.query(deletePinQuery, pinId);
    return deletePinRows;
  }

  
  //도움이 되었어요 - likeCount 증가
  async function updatePinLikeCount1(connection, pinId) {
    const updatePinLikeCountQuery = `
          UPDATE pinView
          SET likeCount = likeCount + 1
          WHERE pinId = ?;
      `;
    //이미 누른 경우(누른 유저 리스트에 포함된 경우) -> 도움이 되었어요 여부로 확인
    const updatePinLikeCountRows = await connection.query(
      updatePinLikeCountQuery,
      pinId
    );
    return updatePinLikeCountRows;
  }


  //도움이 되었어요 - user 추가
  async function updatePinLikeUser1(connection, pinId, userId) {
    const updatePinLikeQuery = `
          INSERT INTO likes (pinId, userId)
          VALUES (${pinId}, ${userId});
      `;
    //이미 누른 경우(누른 유저 리스트에 포함된 경우) -> 도움이 되었어요 여부로 확인
    const updatePinLikeUserRows = await connection.query(
      updatePinLikeQuery,
      pinId,
      userId
    );
    return updatePinLikeUserRows;
  }


  //도움이 되었어요 취소 - likeCount 감소
  async function updatePinLikeCount2(connection, pinId) {
    const updatePinLikeCountQuery = `
          UPDATE pinView
          SET likeCount = likeCount - 1
          WHERE pinId = ?;
      `;
      //안누른경우(누른 리스트에 포함되어 있지 않은 경우) -> 도움이 되었어요 여부로 확인
    const updatePinLikeCountRows = await connection.query(
      updatePinLikeCountQuery,
      pinId
    );
    return updatePinLikeCountRows;
  }


  //도움이 되었어요 취소 - 유저 삭제
  async function updatePinLikeUser2(connection, pinId, userId) {
    const updatePinLikeUserQuery = `
          DELETE FROM likes
          WHERE pinId = ${pinId} AND userId = ${userId};
      `;
      //안누른경우(누른 리스트에 포함되어 있지 않은 경우) -> 도움이 되었어요 여부로 확인
    const updatePinLikeUserRows = await connection.query(
      updatePinLikeUserQuery,
      pinId,
      userId
    );
    return updatePinLikeUserRows;
  }


  



  module.exports = {
    insertPin,
    selectPin,
    selectPinById,
    deleteRecentPin,
    insertRecentPin,
    selectRecentPin,
    deleteMyPin,
    deletePin,
    updatePinLikeCount1,
    updatePinLikeCount2,
    updatePinLikeUser1,
    updatePinLikeUser2

 };
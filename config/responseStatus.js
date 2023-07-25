module.exports = {
  // 성공
  SUCCESS: { isSuccess: true, code: 1000, message: "성공" },

  // 서버 오류
  DB_ERROR: { isSuccess: false, code: 4000, message: "DB 에러" },
  SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },

  // 신고 관련 오류
  REPORT_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "신고 사유가 선택되지 않았습니다.",
  },
  REPORT_REDUNDANT: {
    isSuccess: false,
    code: 400,
    message: "이미 신고한 핀리뷰입니다.",
  },
};

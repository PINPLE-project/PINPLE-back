module.exports = {
  // 성공
  SUCCESS: { isSuccess: true, code: 1000, message: "성공" },

  // 서버 오류
  DB_ERROR: { isSuccess: false, code: 4000, message: "DB 에러" },
  SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },

  TOKEN_EMPTY: {
    isSuccess: false,
    code: 2000,
    message: "JWT 토큰을 입력해주세요.",
  },
  TOKEN_VERIFICATION_FAILURE: {
    isSuccess: false,
    code: 3000,
    message: "JWT 토큰 검증 실패",
  },
  SIGNIN_ID_WRONG: {
    isSuccess: false,
    code: 3002,
    message: "아이디가 잘못 되었습니다.",
  },

  SIGNUP_NICKNAME_EMPTY: {
    isSuccess: false,
    code: 2001,
    message: "닉네임을 입력해주세요.",
  },
  SIGNUP_NICKNAME_EXIST: {
    isSuccess: false,
    code: 2002,
    message: "중복된 닉네임입니다.",
  },
  SIGNUP_NICKNAME_IMPERTINENCE: {
    isSuccess: false,
    code: 2003,
    message: "부적절한 닉네임입니다.",
  },
  SIGNUP_CHARACTER_EMPTY: {
    isSuccess: false,
    code: 2004,
    message: "가 잘못 되었습니다.",
  },
  SIGNUP_DEVICETOKEN_EMPTY: {
    isSuccess: false,
    code: 2005,
    message: "디바이스 토큰을 입력해 주세요.",
  },

  // 알림 관련 오류
  ALERT_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "존재하지 않는 알림입니다.",
  },
  ALERT_RECORD_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "알림 기록이 존재하지 않습니다.",
  },
  ALERT_SETUP_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "설정된 알림이 존재하지 않습니다.",
  },
  ALERT_PLACE_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "알림을 설정할 장소를 입력해 주세요.",
  },
  ALERT_PLACE_NONEXISTENT: {
    isSuccess: false,
    code: 400,
    message: "존재하지 않는 장소입니다.",
  },
  ALERT_TIME_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "알림을 설정할 시간을 입력해 주세요.",
  },
  ALERT_REDUNDANT: {
    isSuccess: false,
    code: 400,
    message: "이미 존재하는 알림입니다.",
  },
  ALERT_DATE_WRONG: {
    isSuccess: false,
    code: 400,
    message: "현재 날짜 이후의 알림은 조회할 수 없습니다.",
  },
  ALERT_TIME_WRONG: {
    isSuccess: false,
    code: 400,
    message: "현재 시간보다 이전의 알림은 설정할 수 없습니다.",
  },
  ALERT_DATE_ERROR_TYPE: {
    isSuccess: false,
    code: 400,
    message: "날짜 형식을 정확히 입력해 주세요.",
  },
  ALERT_TIME_ERROR_TYPE: {
    isSuccess: false,
    code: 400,
    message: "날짜+시간 형식을 정확히 입력해 주세요.",
  },

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

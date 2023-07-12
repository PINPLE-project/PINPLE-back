module.exports = {
  // 성공
  SUCCESS: { isSuccess: true, code: 1000, message: "성공" },

  // 서버 오류
  DB_ERROR: { isSuccess: false, code: 4000, message: "DB 에러" },
  SERVER_ERROR: { isSuccess: false, code: 4001, message: "서버 에러" },

  // 요청 오류
  ALERT_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "존재하지 않는 알림입니다.",
  },
  ALERT_PLACE_EMPTY: {
    isSuccess: false,
    code: 400,
    message: "알림을 설정할 장소를 입력해 주세요.",
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
  ALERT_TIME_WRONG: {
    isSuccess: false,
    code: 400,
    message: "현재 시간보다 이전의 알림은 설정할 수 없습니다.",
  },
  ALERT_TIME_ERROR_TYPE: {
    isSuccess: false,
    code: 400,
    message: "날짜+시간 형식을 정확히 입력해 주세요.",
  },
};
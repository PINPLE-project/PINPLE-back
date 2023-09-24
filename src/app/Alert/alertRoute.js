module.exports = function (app) {
  const alert = require("./alertController");

  // 1. 설정된 알림 전체 조회 API
  app.get("/app/alert/setup", jwtMiddleware, alert.getSetupAlert);

  // 2. 알림 추가 API
  app.post("/app/alert", jwtMiddleware, alert.postAlert);

  // 3. 알림 삭제 API
  app.delete("/app/alert/:alertId", alert.deleteAlert);

  // 4. 알림 기록 전체 조회 API
  app.get("/app/alert/record", jwtMiddleware, alert.getRecordAlert);

  // 5. 알림 기록 날짜별 조회 API
  app.get("/app/alert/record/:date", jwtMiddleware, alert.getRecordAlertByDate);
};

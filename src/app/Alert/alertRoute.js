module.exports = function (app) {
  const alert = require("./alertController");

  // 0. 테스트용 API
  app.get("/app/test", alert.test);

  // 1. 설정된 알림 전체 조회 API
  app.get("/app/alert", alert.getAlert);

  // 2. 알림 설정 API
  app.post("/app/alert", alert.postAlert);

  // 3. 알림 삭제 API
  app.delete("/app/alert", alert.deleteAlert);

  // 4. 알림 기록 조회 API
  app.get("/app/alert/record", alert.getRecordAlert);
};

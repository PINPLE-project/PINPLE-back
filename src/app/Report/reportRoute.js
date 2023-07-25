module.exports = function (app) {
  const report = require("./reportController");

  // 테스트용 API
  app.get("/app/test", report.test);

  // 1. 신고 API
  app.post("/app/pinview/:pinId/report", report.postReport);
};

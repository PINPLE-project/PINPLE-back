module.exports = function (app) {
  const report = require("./reportController");

  // 테스트용 API
  app.get("/app/test", report.test);
};

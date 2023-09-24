module.exports = function (app) {
  const report = require("./reportController");

  // 1. 신고 API
  app.post("/app/pinview/:pinId/report", jwtMiddleware, report.postReport);
};

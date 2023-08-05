const express = require("express");
const compression = require("compression");
const methodOverride = require("method-override");
const morgan = require("morgan");
var cors = require("cors");
const session = require('express-session');
const secret = require('./secret');

module.exports = function () {
  const app = express();

  app.use(compression()); // 데이터 압축
  app.use(express.json()); // application/json타입으로 들어오는 데이터를 req.body로 파싱해주는 역할
  app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded타입으로 들어오는 데이터를 req.body로 파싱해주는 역할
  app.use(methodOverride()); // method-override
  app.use(morgan("dev")); // 로그 확인 (response 색상 입힌 개발용)
  app.use(cors()); //자신이 속하지 않은 다른 도메인, 다른 프로토콜, 혹은 다른 포트에 있는 리소스를 요청하는 cross-origin HTTP 요청 방식

  app.use(session({
    secret: secret.sessionsecret,
    resave:true,
    secure:false,
    saveUninitialized:false,
}))

  require("../src/app/User/userRoute")(app);
  require("../src/app/Alert/alertRoute")(app);
  require("../src/app/Report/reportRoute")(app);

  return app;
};

const baseResponse = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const secret_sign = require("../../../config/secret_sign");
const secret = require("../../../config/secret");

const axios = require("axios");
const qs = require("qs");
const session = require("express-session");
const { pool } = require("../../../config/database");
const userService = require("./userService");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
//const nunjucks = require('nunjucks');

const GOOGLE_CLIENT_ID = secret_sign.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = secret_sign.GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN_REDIRECT_URI = secret_sign.GOOGLE_LOGIN_REDIRECT_URI;
const GOOGLE_SIGNUP_REDIRECT_URI = secret_sign.GOOGLE_SIGNUP_REDIRECT_URI;
const GOOGLE_TOKEN_URL = secret_sign.GOOGLE_TOKEN_URL;
const GOOGLE_USERINFO_URL = secret_sign.GOOGLE_USERINFO_URL;

const KAKAO_CLIENT_ID = secret_sign.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = secret_sign.GOOGLE_CLIENT_SECRET;
const KAKAO_REDIRECT_URI = secret_sign.KAKAO_REDIRECT_URI;

/**
 * API No. 0
 * Name: 테스트용 API
 * [GET] /app/test
 */

exports.test = async function (req, res) {
  return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 1
 * Name: 구글 로그인 API → 구글 회원가입 API와 합쳐짐
 * [GET] /google/login
 */
exports.googleLogin = function (req, res) {
  let url = "https://accounts.google.com/o/oauth2/v2/auth";
  url += `?client_id=${GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
  url += "&response_type=code";
  url += "&scope=email profile";

  return res.redirect(url);
};

/**
 * API No. 2
 * Name: 구글 로그인 리다이렉트 API
 * [GET] /google/login/redirect
 */
exports.googleLoginRe = async function (req, res) {
  const { code } = req.query;
  // console.log(`code: ${code}`);

  const resp = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${resp.data.access_token}`,
    },
  });
  const email = resp2.data.email;
  // console.log(email);

  const signInResponse = await userService.postSignIn(email);
  // console.log(signInResponse);
  res.send(signInResponse);
};

/**
 * API No. 3
 * Name: 구글 회원가입 + 로그인 API
 * [GET] /google/signup
 */
exports.googleSignup = function (req, res) {
  // 회원가입 하기 전에 유효성 검사 추가하기
  let url = "https://accounts.google.com/o/oauth2/v2/auth";
  url += `?client_id=${GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}`;
  url += "&response_type=code";
  url += "&scope=email profile";

  return res.redirect(url);
};

/**
 * API No. 4
 * Name: 구글 회원가입 + 로그인 리다이렉트 API
 * [GET] /google/signup/redirect
 */
exports.googleSignupRe = async function (req, res) {
  const { code } = req.query;
  // console.log(`code: ${code}`);

  const resp = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${resp.data.access_token}`,
    },
  });

  req.session.google = resp2.data; // 세션 저장

  const email = resp2.data.email;
  const nickname = resp2.data.name;
  // console.log(email, nickname)

  const idRows = await userProvider.idCheck(email); // 아이디 존재 여부 확인
  if (idRows.length < 1) {
    // 계정 생성된 것 없음
    const signUpResponse = await userService.postSignUp(email, nickname); // db에 삽입
    // console.log(signUpResponse);
  }

  let url = "https://accounts.google.com/o/oauth2/v2/auth"; // 로그인
  url += `?client_id=${GOOGLE_CLIENT_ID}`;
  url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
  url += "&response_type=code";
  url += "&scope=email profile";

  return res.redirect(url);
  // return res.json(resp2.data);
};

/**
 * API No. 5
 * Name: 카카오 회원가입 + 로그인 API
 * [GET] /auth/kakao
 */
exports.kakaoLogin = function (req, res) {
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  return res.redirect(kakaoAuthURL);
};

/**
 * API No. 6
 * Name: 카카오 회원가입 + 로그인 리다이렉트 API
 * [GET] /auth/kakao/callback
 */
exports.kakaoLoginRe = async function (req, res) {
  try {
    //access토큰을 받기 위한 코드
    token = await axios({
      //token
      method: "POST",
      url: "https://kauth.kakao.com/oauth/token",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        grant_type: "authorization_code", //특정 스트링
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirectUri: KAKAO_REDIRECT_URI,
        code: req.query.code,
      }),
    });
  } catch (err) {
    //return res.send(errResponse(baseResponse.USER_USERID_NOT_EXIST));
    res.json(err);
  }
  //access토큰을 받아서 사용자 정보를 알기 위해 쓰는 코드
  let user;
  try {
    // console.log(token); //access정보를 가지고 또 요청해야 정보를 가져올 수 있음.
    user = await axios({
      method: "get",
      url: "https://kapi.kakao.com/v2/user/me",
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      }, //헤더에 내용을 보고 보내주겠다.
    });
  } catch (e) {
    res.json(err);
  }

  req.session.kakao = user.data; // 세션 저장

  const email = user.data.kakao_account.email; // 이메일(userId)
  const nickname = user.data.properties.nickname; // 닉네임

  const idRows = await userProvider.idCheck(email); // 아이디 존재 여부 확인
  if (idRows.length < 1) {
    // 계정 생성된 것 없음
    const signUpResponse = await userService.postSignUp(email, nickname); // db에 삽입
    // console.log(signUpResponse);
  }

  const signInResponse = await userService.postSignIn(email, nickname); // 로그인: JWT 발급
  res.send(signInResponse);

  //console.log(user.data.kakao_account);
  //res.send({'email': email, 'nickname': nickname});
};

/**
 * API No. 7
 * Name: 회원가입 API
 * [PATCH] /app/users
 */
exports.patchSignup = async function (req, res) {
  // 소셜 회원가입 및 로그인한 유저의 JWT 토큰
  const userId = req.verifiedToken.userId;

  var { nickname, character, congestionAlarm, pinAlarm, deviceToken } =
    req.body;

  const nickExist = await userProvider.nickExist(nickname); // 닉네임 중복 확인

  const bad_word = /[시발 존나 바보]/g; // 부적절한 닉네임 리스트

  // console.log(bad_word.test(nickname))
  if (!nickname)
    return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));
  else if (bad_word.test(nickname))
    // 부적절한 닉네임
    return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_IMPERTINENCE));
  else if (nickExist >= 1)
    return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EXIST));
  else if (!character)
    return res.send(errResponse(baseResponse.SIGNUP_CHARACTER_EMPTY));
  else if (!deviceToken)
    return res.send(errResponse(baseResponse.SIGNUP_DEVICETOKEN_EMPTY));

  //return res.send(req.verifiedToken);
  if (!congestionAlarm) congestionAlarm = 0;
  if (!pinAlarm) pinAlarm = 0;

  const signUpResponse = await userService.updateSignUp(
    userId,
    nickname,
    character,
    congestionAlarm,
    pinAlarm,
    deviceToken
  ); // db에 삽입

  return res.send(signUpResponse);
};

exports.kakaoLogout = async function (req, res) {
  delete req.session.kakao;
  return res.send(response(baseResponse.SUCCESS));
};

exports.googleLogout = async function (req, res) {
  delete req.session.google;
  return res.send(response(baseResponse.SUCCESS));
};

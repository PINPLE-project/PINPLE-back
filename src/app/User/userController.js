const baseResponse = require("../../../config/responseStatus");
const {response, errResponse} = require("../../../config/response");
const secret_sign = require('../../../config/secret_sign')

const axios = require('axios');
const qs = require('qs');
const session = require('express-session');
const { pool } = require("../../../config/database");
const userService = require('./userService');
const userDao = require("./userDao");
//const nunjucks = require('nunjucks');

const GOOGLE_CLIENT_ID = secret_sign.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = secret_sign.GOOGLE_CLIENT_SECRET;
const GOOGLE_LOGIN_REDIRECT_URI = secret_sign.GOOGLE_LOGIN_REDIRECT_URI;
const GOOGLE_SIGNUP_REDIRECT_URI = secret_sign.GOOGLE_SIGNUP_REDIRECT_URI;
const GOOGLE_TOKEN_URL = secret_sign.GOOGLE_TOKEN_URL;
const GOOGLE_USERINFO_URL = secret_sign.GOOGLE_USERINFO_URL;

const KAKAO_CLIENT_ID = secret_sign.KAKAO_CLIENT_ID;
const KAKAO_CLIENT_SECRET = secret_sign.GOOGLE_CLIENT_SECRET
const KAKAO_REDIRECT_URI = secret_sign.KAKAO_REDIRECT_URI;

/**
 * API No. 0
 * Name: 테스트용 API
 * [GET] /app/test
 */

exports.test = async function(req,res){
    return res.send(response(baseResponse.SUCCESS));
}

exports.googleLogin = function(req, res) {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${GOOGLE_LOGIN_REDIRECT_URI}`;
    url += '&response_type=code';
    url += '&scope=email profile';

    return res.redirect(url);
}

exports.googleLoginRe = async function (req, res){
    const { code } = req.query;
    console.log(`code: ${code}`);

    const resp = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_LOGIN_REDIRECT_URI,
        grant_type: 'authorization_code',
    });

    const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`,
        },
    });
    const email = resp2.data.email;
    console.log(email);

    const signInResponse = await userService.postSignIn(email);

    res.send(signInResponse);
}

exports.googleSignup= function (req, res) {
    // 회원가입 하기 전에 유효성 검사 추가하기
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${GOOGLE_CLIENT_ID}`
    url += `&redirect_uri=${GOOGLE_SIGNUP_REDIRECT_URI}`
    url += '&response_type=code'
    url += '&scope=email profile'    

    return res.redirect(url);
}

exports.googleSignupRe = async function (req, res) {
    const { code } = req.query;
    console.log(`code: ${code}`);

    const resp = await axios.post(GOOGLE_TOKEN_URL, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_SIGNUP_REDIRECT_URI,
        grant_type: 'authorization_code',
    });

    const resp2 = await axios.get(GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${resp.data.access_token}`,
        },
    });
    const email = resp2.data.email;
    const nickname = resp2.data.name;
    console.log(email, nickname)
    
    try{
        // writer_id는 추후에 삭제 필요
        const insertUserParams = [email, nickname];
        const connection = await pool.getConnection(async (conn) => conn);

        const createUserResult = await userDao.insertUser(connection, insertUserParams);
        console.log(`삽입된 유저 : ${createUserResult[0]}`)
        connection.release();
        //return response(baseResponse.SUCCESS);
        

    } catch(err){
        console.log('error')

    }

    return res.json(resp2.data);
}

exports.kakaoLogin = function (req,res) {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    
    return res.redirect(kakaoAuthURL);
}

exports.kakaoLoginRe = async function(req,res) {
    try{ //access토큰을 받기 위한 코드
        token = await axios({//token
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:qs.stringify({
                grant_type: 'authorization_code',//특정 스트링
                client_id: KAKAO_CLIENT_ID,
                client_secret: KAKAO_CLIENT_SECRET,
                redirectUri:KAKAO_REDIRECT_URI,
                code:req.query.code,
            })
        })
    } catch(err){
        //return res.send(errResponse(baseResponse.USER_USERID_NOT_EXIST));
        res.json(err);
    }
    //access토큰을 받아서 사용자 정보를 알기 위해 쓰는 코드
    let user;
    try{
        console.log(token); //access정보를 가지고 또 요청해야 정보를 가져올 수 있음.
        user = await axios({
            method:'get',
            url:'https://kapi.kakao.com/v2/user/me',
            headers:{
                Authorization: `Bearer ${token.data.access_token}`
            }//헤더에 내용을 보고 보내주겠다.
        })
    } catch(e){
        res.json(err);
    }
    console.log(user.data.properties);
    
    res.send(user.data.properties.nickname);
}
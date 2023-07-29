const express = require('express');
const cors = require('cors');
const app = express();
const port = 80;


// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CORS 정책 허용
app.use(cors({
    origin: ['http://localhost:80/app/citydata', 'http://localhost:80/app/citydata/details/:category', 'http://localhost:80/app/citydata/details/fcst', 'http://localhost:80/app/citydata/list'], // 허용할 도메인 주소
    methods: ['GET'], // 허용할 HTTP 메소드
    optionsSuccessStatus: 200 // 응답 상태 코드
}));

// 라우트 설정
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});
const dmController = require("./dmController");
// 모든 카테고리 데이터 출력
app.get('/app/citydata', dmController.getAllCityData);

// 특정 카테고리 데이터 출력
app.get('/app/citydata/details/:category', dmController.getCityDataByCategory);

// 혼잡도 전망 데이터 출력
app.get('/app/citydata/details/fcst', dmController.getFcstData);

// 장소 리스트 출력
app.get('/app/citydata/list', dmController.getCityDataSorted);

// 서버 시작
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

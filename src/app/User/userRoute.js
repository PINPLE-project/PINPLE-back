module.exports = function (app) {
    const user = require('./userController');

    // 공공데이터 API
    app.get('/app/citydata', user.getAllCityData);
    app.get('/app/citydata/details/:category', user.getCityDataByCategory);
    app.get('/app/citydata/details/fcst', user.getCityDataForecast);
    app.get('/app/citydata/list', user.getCityDataSorted);
}
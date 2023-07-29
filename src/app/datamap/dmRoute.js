module.exports = function (app) {
    const datamap = require('./dmController');

    // 공공데이터 API
    app.get('/app/citydata', datamap.getAllCityData);
    app.get('/app/citydata/details/:category', datamap.getCityDataByCategory);

    app.get('/app/citydata/list', datamap.getCityDataSorted);
}
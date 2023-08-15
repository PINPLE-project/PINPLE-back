module.exports = function (app) {
  const datamap = require("./dmController");

  // 공공데이터 API
  app.get("/app/citydata", datamap.getAllCityData);
  app.get("/app/pinclick/:code", datamap.getpinclickByCode);
  app.get("/app/pinclick/:code/details", datamap.getDetails);
  // app.get("/app/citydata/details/:category", datamap.getCityDataByCategory);
  // app.get("/app/citydata/details/fcst", datamap.getFcstData);
  app.get("/app/citydata/list", datamap.getCityDataSorted);
  // 임의로 라우터 uri를 정한거라 편하신대로 수정하셔도 괜찮습니다!
  // 데이터 지도 스크랩
  app.post("/app/map/:place_id/scrap", datamap.postScrap);
  //스크랩 삭제
  app.delete("/app/map/:place_id/scrap", datamap.deleteScrap);
  // 스크랩 조회의 경우 프론트 단에선 mypage에서 이뤄지는 것 같은데 백에선 같은 데이터 지도 스크랩 파트라 함께 올립니다!
  // 스크랩 조회
  app.get("/app/myPage/scrap", datamap.getScrap);
};

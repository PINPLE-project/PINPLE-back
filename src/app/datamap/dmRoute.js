
module.exports = function (app) {
  const datamap = require("./dmController");

  // 공공데이터 API
  app.get("/app/citydata", datamap.getAllCityData);

  // 마커클릭했을 때 API
  app.get("/app/pinclick/:placeId", datamap.getpinclickByplaceId);

  //상세보기 API
  app.get("/app/pinclick/:placeId/details", datamap.getDetails);

  // 장소 목록 API
  app.get("/app/list/:sortby", datamap.getCityList);

  // 데이터 지도 스크랩
  app.post("/app/:placeId/scrap", datamap.postScrap);

  //스크랩 삭제
  app.delete("/app/:placeId/scrap", datamap.deleteScrap);

  // 스크랩 조회 (마이페이지 - 백엔드 데이터 지도 스크랩 파트 포함 )
  app.get("/app/myPage/scrap", datamap.getScrap);
};

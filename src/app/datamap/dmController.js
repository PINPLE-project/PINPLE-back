const responseStatus = require("../../../config/responseStatus");
const { response, errResponse } = require("../../../config/response");
const axios = require("axios");
const convert = require("xml-js");
const dmProvider = require("./dmProvider");
const dmDao = require("./dmDao");
const dmService = require("./dmService");
const { pool } = require("../../../config/database");

const urls = {
  park: [
    "POI089",
    "POI091",
    "POI092",
    "POI093",
    "POI094",
    "POI095",
    "POI096",
    "POI099",
    "POI100",
    "POI106",
    "POI108",
    "POI109",
    "POI110",
  ],
  tourist: [
    "POI001",
    "POI002",
    "POI003",
    "POI004",
    "POI005",
    "POI006",
    "POI007",
  ],
  culture: ["POI008", "POI009", "POI012"],
  station: [
    "POI013",
    "POI014",
    "POI015",
    "POI016",
    "POI017",
    "POI018",
    "POI033",
    "POI034",
    "POI038",
    "POI039",
    "POI040",
    "POI042",
    "POI043",
    "POI045",
    "POI046",
  ],
  popular: [
    "POI062",
    "POI063",
    "POI066",
    "POI068",
    "POI069",
    "POI070",
    "POI071",
    "POI072",
    "POI074",
    "POI078",
    "POI079",
    "POI084",
  ],
};

async function getCategoryData(category) {
  let categoryUrls = [];
  if (category === "all") {
    categoryUrls = Object.values(urls).flat();
  } else {
    categoryUrls = urls[category] || [];
  }

  const responsePromises = categoryUrls.map(async (code) => {
    const url = `http://openapi.seoul.go.kr:8088/72655a6f586a6a7539344e4a6f6755/xml/citydata/1/5/${code}`;
    const response = await axios.get(url);
    const xmlData = response.data;
    const jsonData = convert.xml2json(xmlData, { compact: true, spaces: 4 });
    const citydata = JSON.parse(jsonData);
    // cityData가 undefined인 경우 빈 객체로 초기화
    const cityData = citydata["SeoulRtd.citydata"]["CITYDATA"];

    // cityData가 undefined인 경우 빈 객체로 초기화
    return {
      CODE: code,
      CATEGORY: category,
      AREA_NM: cityData ? cityData["AREA_NM"]["_text"] : "",
      AREA_CONGEST_LVL: cityData
        ? cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["AREA_CONGEST_LVL"][
            "_text"
          ]
        : "",
      AREA_CONGEST_MSG: cityData
        ? cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["AREA_CONGEST_MSG"][
            "_text"
          ]
        : "",
      AREA_DATA_TIME: cityData
        ? cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["PPLTN_TIME"]["_text"]
        : "",
      FCST_PPLTN: cityData
        ? cityData["LIVE_PPLTN_STTS"]["LIVE_PPLTN_STTS"]["FCST_PPLTN"]
        : [],
    };
  });

  const extractedDataArray = await Promise.all(responsePromises);
  return extractedDataArray;
}

/**
 * API No. 1
 * Name: 장소 혼잡도 API (전체)
 * [GET] /app/citydata
 */
exports.getAllCityData = async function (req, res) {
  try {
    const allCategoryData = {};
    const categoryPromises = Object.keys(urls).map(async (category) => {
      const categoryData = await getCategoryData(category);
      allCategoryData[category] = categoryData;
    });

    await Promise.all(categoryPromises);
    console.log("all city  data :", allCategoryData); // 콘솔에 출력

    //citydata 테이블에 도시정보 업데이트
    Object.keys(urls).map(async (category) => {
      const categoryData = await allCategoryData[category];
      dmProvider.updateAllCityData(categoryData);
    });

    return res.send(response(responseStatus.SUCCESS, allCategoryData));
  } catch (error) {
    console.error("Error:", error);
    return res.send(errResponse(responseStatus.SERVER_ERROR));
  }
};
/**
 * API No. 2
 * Name: 지도에서 마커 클릭 조회 API
 * [GET] /app/pinclick/:code
 */

exports.getpinclickByCode = async function (req, res) {
  const placeCode = req.params.code; // URL 파라미터에서 이름 가져오기
  try {
    const placeData = await dmService.createclickPin(placeCode);
    console.log("Place Data:", placeData); // 결과값 콘솔에 출력

    return res.send(response(responseStatus.SUCCESS, placeData));
  } catch (error) {
    console.error("Error:", error);
    return res.send(errResponse(responseStatus.SERVER_ERROR));
  }
};
/**
 * API No. 3
 * Name: 상세보기
 * [GET] /app/pinclick/:code/details
 */
exports.getDetails = async function (req, res) {
  const placeCode = req.params.code;

  try {
    const { markerDetails, recommendationPlaces } =
      await dmService.createDetails(placeCode);

    console.log("Marker Details:", markerDetails);
    console.log("Random Places:", recommendationPlaces);
    return res.send(
      response(responseStatus.SUCCESS, { markerDetails, recommendationPlaces })
    );
  } catch (error) {
    console.error("Error:", error);
    return res.send(errResponse(responseStatus.SERVER_ERROR));
  }
};

// 유저 아이디는 JWT 토큰으로 넘겨받고, 데이터 지도에서 스크랩할 place_id를 파라미터로 넘겨주면 scrap db에 저장되는 형식입니다!
/**
 * API No.4
 * Name: 데이터 지도 스크랩
 * [POST] /app/map/:place_id/scrap
 */
exports.postScrap = async function (req, res) {
  const userId = req.verifiedToken.userId; // 현재 로그인한 userId
  const placeId = req.params.place_id;
  console.log(userId, placeId);
  const scrapResult = await dmService.createScrap(userId, placeId);
  return res.send(response(responseStatus.SUCCESS, scrapResult));
};

/**
 * API No.5
 * Name: 스크랩 조회
 * [GET] /app/myPage/scrap
 */
exports.getScrap = async function (req, res) {
  const userId = req.verifiedToken.userId; // 현재 로그인한 userId
  const scrapResult = await dmProvider.retrieveScrap(userId);
  return res.send(response(responseStatus.SUCCESS, scrapResult));
};

/**
 * API No.6
 * Name: 스크랩 삭제
 * [DELETE] /app/map/:place_id/scrap
 */
exports.deleteScrap = async function (req, res) {
  const userId = req.verifiedToken.userId; // 현재 로그인한 userId
  const placeId = req.params.place_id;

  // if (!placeId) return res.send(errResponse(baseResponse.SCRAP_PLACEID_EMPTY));

  const deleteScrapResponse = await dmService.deleteScrap(userId, placeId);
  return res.send(deleteScrapResponse);
};

/**
 * API No. 7
 * Name: 장소 목록 API (혼잡도 높은순, 혼잡도 낮은순, 가나다순)
 * [GET] /app/citydata/list?sortby={}
 */

exports.getCityDataSorted = async function (req, res) {
  try {
    const sortBy = req.query.sortby;
    const sortedData = await dmProvider.sortDataByCongestion(sortBy);
    console.log(`Sorted Data (Sort By: ${sortBy}):`, sortedData);

    return res.send(response(responseStatus.SUCCESS, sortedData));
  } catch (error) {
    console.error("Error:", error);
    return res.send(errResponse(responseStatus.SERVER_ERROR));
  }
};

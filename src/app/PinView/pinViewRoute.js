module.exports = function(app) {
    const pinView = require('./pinViewController');

     // 1. 핀지도 작성 API
     app.post('/app/pinView', pinView.postPin);
     

     // 2. 핀지도 전체 조회 API
     app.get('/app/pinView', pinView.getPins);
     

     // 3. 특정 핀지도 조회 API
     app.get('/app/pinView/:pinId', pinView.getPinById);


     // 4. 특정 핀지도 삭제 API
     app.patch('/app/pinView/:pinId', pinView.deletePin);


     // 5. 도움이 되었어요 API
     app.patch('/app/pinview/:pinId/likes', pinView.postPinLike);

    
     // 6. 도움이 되었어요 취소 API
     app.patch('/app/pinview/:pinId/liked', pinView.deletePinLike);


     // @. my pin 조회 API -> 추후 myPage로 이동
     app.get('/app/myPage/myPin/:userId', pinView.getMyPin);


     // @. my pin 삭제 API -> 추후 myPage로 이동
     app.delete('/app/myPage/myPin/:pinId', pinView.deleteMyPin);
    
    }

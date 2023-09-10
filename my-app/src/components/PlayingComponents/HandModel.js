import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "react-spring";
import {GestureRecognizer, FilesetResolver,} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import { Button } from "@mui/material";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision"; // 정적 임포트

let gestureRecognizer = undefined;
let category1Name = undefined;
let category2Name = undefined;
let hitSound = new Audio("/assets/Hit.mp3");
let shouldStopPrediction = false; // 처음에는 false로 설정

// mediaPipe 모션네임
const motionNames = {
  1: "Closed_Fist",
  2: "Open_Palm",
  3: "Pointing_Up",
  4: "Victory",
  5: "Thumb_Up",
  6: "Thumb_Down",
  7: "ILoveYou",
};

// Gesture Recognizer를 생성하는 비동기 함수
const createGestureRecognizer = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
};

export default function HandModel() {
  // 컴포넌트 상태 및 ref를 선언
  const token = localStorage.getItem("token");
  const videoRef = useRef(null); // 비디오 엘리먼트를 참조하기 위한 ref
  const videoSrcRef = useRef(null); 
  const showBackground = useState(false);
  const [videoHidden, setVideoHidden] = useState(true);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 }); // 비디오의 크기를 저장하는 상태
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const scoreRef = useRef(score);
  const [userNum, setUserNum] = useState(null);
  const userNumRef = useRef(userNum);
  const [musicNum, setMusicNum] = useState(null);
  const musicNumRef = useRef(musicNum)

  const location = useLocation();

  useEffect(() => {
    const unblock = window.history.pushState(null, "", window.location.href);
    window.onpopstate = function(event) {
      window.history.go(1);
      alert("게임 중 뒤로 가기는 사용할 수 없습니다."); // 알림 추가
      navigate(location);
    };

    return () => {
      window.onpopstate = null;
    };
  }, [navigate, location]);
  // 배경의 표시 상태를 토글하는 함수
  const toggleBackground = () => {
    setVideoHidden(!videoHidden);
  };
  
  // window의 크기를 저장하는 상태
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '정말로 페이지를 떠나시겠습니까?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, []);

  
  useEffect(() => {
    axios({
      method: "get",
      url: "https://localhost:8443/api/v1/users/me",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // your access token here
      },
    })
    .then((response) => {
      setUserNum(response.data.userNumber)
    })
    .catch((error) => {
      console.error("error");
      const token = error.response.headers.authorization.slice(7);
      localStorage.setItem("token", token);
      axios({
        method: "get",
        url: "https://localhost:8443/api/v1/users/me",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // your access token here
        },
      })
        .then((response) => {
          setUserNum(response.data.userNumber)
        })
        .catch((error) => {
          console.log(error);
        });
    })
  }, [userNum]);

  const sendData = async () => {
    // 객체 생성
    const data = {
        musicNumber: musicNumRef.current,
        score: scoreRef.current, 
        userNumber: userNumRef.current
    };
    console.log(data);

    // 헤더 설정
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        // POST 요청을 통해 데이터 전송
        const response = await axios.post('https://localhost:8443/api/v1/game/log', data, { headers: headers });
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error sending the data:", error);
    }
}


  // window의 크기가 변경될 때 windowSize 상태를 업데이트하는 함수
  const updateWindowDimensions = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    scoreRef.current = score;  // score 값이 변경될 때마다 ref를 업데이트합니다.
    userNumRef.current = userNum; 
    musicNumRef.current = musicNum;
  }, [score, userNum, musicNum]);

    const props = useSpring({
      from: { val: 0 },
      to: { val: score },
      config: { duration: 800 },
      reset: false,
    });
  
    const increaseScore = (amount) => {
      setScore((prevScore) => prevScore + amount);
    };

  // window의 크기가 변경될 때마다 updateWindowDimensions 함수를 실행하도록 이벤트 리스너를 등록하는 useEffect
  useEffect(() => {
    window.addEventListener("resize", updateWindowDimensions);
    return () => window.removeEventListener("resize", updateWindowDimensions);
  }, []);

  // 컴포넌트가 마운트될 때 카운트다운을 시작
  useEffect(() => {
    shouldStopPrediction = false;
    const fetchDataAndPredict = async () => {
        const data = await fetchData();  // fetchData가 데이터를 반환하도록 수정
        await createGestureRecognizer();
        await handleStartStreaming();
        await predictWebcam();
        return data;  // 데이터 반환
    };
    
    fetchDataAndPredict().then((data) => {
      const audio = new Audio("/music/6.mp3");
      const finish = new Audio("/assets/Finish.mp3");
      audio.volume = 0.3; // 볼륨 30%로 설정
      finish.volume = 0.3; //
      audio.loop = false;
      finish.loop = false;
      
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearInterval(timer);
            audio.play();

            if (videoSrcRef.current) {
              videoSrcRef.current.play();
            }
            createCircles(data);
            // Audio가 끝날 때 'finish' 재생
            audio.onended = () => {
              finish.play();

              // 'finish'가 끝나면 비디오를 멈추고 메인 페이지로 이동
              finish.onended = () => {
                if (videoRef.current && videoRef.current.srcObject) {
                  const tracks = videoRef.current.srcObject.getTracks();
                  tracks.forEach((track) => {
                    track.stop();
                  });
                    shouldStopPrediction = true;  // or stopPredictWebcam();
                  videoRef.current.srcObject = null;
                  // 페이지 이동
                  sendData()
                
                  navigate('/');
                }
              }
            };
            return () => {
              shouldStopPrediction = true;
              videoRef.current.srcObject = null;
            };
          }
        });
      }, 500);
    });
  }, []);


  // 웹캠 스트림을 시작하는 비동기 함수
  const handleStartStreaming = async () => {
    try {
      const height = windowSize.height;
      const width = (height * 15) / 9;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: width }, height: { ideal: height } },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.width = width;
      videoRef.current.height = height;

      setVideoSize({ width, height });
    } catch (error) {
      console.error(error);
    }
  };

// fetchData 함수를 수정하여 데이터를 가져와서 반환
const fetchData = async () => {
  try {
      const response = await axios.get("/music/6.json");
      const data = response.data; // 가져온 데이터
      return data;  // 데이터 반환
  } catch (error) {
    console.error("Error fetching the JSON data:", error);
  }
};

  // fetchData 함수를 수정하여 데이터를 가져와서 nodes에 저장하고 웹캠 위에 원 그리기
  const createCircles = async (data) => {
    data.forEach((node) => {
      setTimeout(() => {
        // circle 클래스를 가진 div를 생성합니다.
        const circleDiv = document.createElement("div");
        circleDiv.className = "circle";
        // circle Node의 테두리 div
        const circleOut = document.createElement("div");
        circleOut.className = "circle-out";

        // MOTION_NUM을 확인하여 'motion' + MOTION_NUM 클래스를 추가합니다.
        circleDiv.classList.add('motion' + node.MOTION_NUM);

        // webcam의 위치와 크기를 얻습니다.
        const webcamWrapper = document.getElementById("webcamWrapper");
        const webcamRect = webcamWrapper.getBoundingClientRect();

        // div의 위치를 설정합니다. X-COORDINATE와 Y-COORDINATE 값은 0~1 범위라고 가정합니다.
        circleDiv.style.left = `calc(${webcamRect.width -
            (webcamRect.left + node["X-COORDINATE"] * webcamRect.width)}px - 50px)`;
        circleDiv.style.top = `calc(${
            webcamRect.top + node["Y-COORDINATE"] * webcamRect.height}px - 50px)`;
        circleOut.style.left = `calc(${webcamRect.width -
            (webcamRect.left + node["X-COORDINATE"] * webcamRect.width)}px - 100px)`;
        circleOut.style.top = `calc(${
            webcamRect.top + node["Y-COORDINATE"] * webcamRect.height}px - 100px)`;

        // div를 웹캠의 컨테이너인 webcamWrapper에 추가합니다.
        webcamWrapper.appendChild(circleDiv);
        webcamWrapper.appendChild(circleOut);

        // 애니메이션 시작
        let scale = 1;
        let scaleStep = 0.018;

        function animate() {
          scale -= scaleStep;
          circleOut.style.transform = `scale(${scale})`;
      
          if(scale > 0.2) {  // 원의 크기가 0.3가 될 때까지만 애니메이션을 계속합니다.
              requestAnimationFrame(animate);
          } else {  // scale이 0.2 이하가 되면 div를 삭제합니다.
              webcamWrapper.removeChild(circleDiv);
              webcamWrapper.removeChild(circleOut);
          }
        }
        animate();
      }, node.APPEAR_TIME * 1000); // APPEAR_TIME은 초 단위로 가정합니다.
    });
  } 

  // 웹캠에서 예측을 수행하는 비동기 함수
  async function predictWebcam() {
    if (shouldStopPrediction) return;
    let nowInMs = Date.now();
    let results = gestureRecognizer.recognizeForVideo(
      videoRef.current,
      nowInMs
    );

    // 캔버스에 그리기 위한 설정
    const canvasElement = document.getElementById("canvas");
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    // 결과가 있다면 캔버스에 그림
    // 결과가 있다면 캔버스에 그림
if (results.landmarks) {
  for (let landmarks of results.landmarks) {
    // 커넥터를 그릴 때 색상을 검은색(#000000), 굵기는 5로 변경합니다.
    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
      color: "beige",
      lineWidth: 5,
    });
    // 각 랜드마크에 대해서는 선 색상을 강아지 발색인 베이지색(#F5F5DC), 굵기는 2로 변경합니다.
    drawLandmarks(canvasCtx, landmarks, { color: "#F5F5DC", lineWidth: 2 });
  }
}
canvasCtx.restore();


    let handX = 0;
    let handY = 0;

    // 예측 결과를 처리
    if (results.gestures.length > 0) {
      // console.log(`x: ${results.landmarks[0][9].x.toFixed(5)}, y: ${results.landmarks[0][9].y.toFixed(5)}`);
      category1Name = results.gestures[0][0].categoryName;
      handX = results.landmarks[0][9].x;
      handY = results.landmarks[0][9].y;
      hideCircle(handX, handY, category1Name);

      // 두 번째 예측 결과가 있다면 처리
      if (results.gestures.length > 1) {
        category2Name = results.gestures[1][0].categoryName;
        handX = results.landmarks[1][9].x;
        handY = results.landmarks[1][9].y;
        hideCircle(handX, handY, category2Name);
      }
    }

    // shouldStopPrediction 상태가 true라면 함수 종료
    
    // 다음 프레임을 요청하여 계속해서 예측을 수행
    window.requestAnimationFrame(predictWebcam);
  }

  function hideCircle(handX, handY, categoryName) {
    const circleElements = document.querySelectorAll(".circle");
    circleElements.forEach((circleElement) => {
        // 원형 div의 위치를 얻습니다. (0~1 범위로 변환)
        const circleX =
            1 -
            parseFloat((parseFloat(circleElement.style.left.replace(/[^\d.]/g, ''))) + 50) /
            document.getElementById("webcamWrapper").offsetWidth;
        const circleY =
            parseFloat((parseFloat(circleElement.style.top.replace(/[^\d.]/g, ''))) + 50) /
            document.getElementById("webcamWrapper").offsetHeight;

        const motionNum = circleElement.className.split(" ")[1].replace("motion", "");

        if (motionNames[motionNum] === categoryName) { 
            // 손의 위치와 원형 div의 위치 사이의 거리를 계산합니다.
            const distance = Math.sqrt(
            Math.pow(handX - circleX, 2) + Math.pow(handY - circleY, 2)
            );
        
            // 거리가 특정 임계값 이하이면 원형 div를 삭제합니다.
            const threshold = 0.05; // 필요에 따라 이 값을 조정할 수 있습니다.
            if (distance <= threshold && circleElement.style.display !== "none") {
                circleElement.style.display = "none";
                
                
                // circleElement와 동일한 위치에 있는 .circle-out 요소를 찾습니다.
                const circleOutElement = Array.from(document.querySelectorAll(".circle-out")).find((element) => {
                    const circleOutX = 
                        1 -
                        parseFloat((parseFloat(element.style.left.replace(/[^\d.]/g, ''))) + 100) /
                        document.getElementById("webcamWrapper").offsetWidth;
                    const circleOutY =
                        parseFloat((parseFloat(element.style.top.replace(/[^\d.]/g, ''))) + 100) /
                        document.getElementById("webcamWrapper").offsetHeight;
                    
                    return Math.abs(circleOutX - circleX) < threshold && Math.abs(circleOutY - circleY) < threshold;
                });

                if (circleOutElement) {
                  // Parse the scale value from the transform style
                  let scaleValue = parseFloat(circleOutElement.style.transform.replace("scale(", "").replace(")", ""));
              
                  if (scaleValue >= 0.65) {
                      circleOutElement.style.display = "none";
                      hitSound.play()
                      console.log("Miss", scaleValue)
                  }
                  else if (scaleValue < 0.65 && scaleValue > 0.58) {
                      circleOutElement.style.display = "none";
                      hitSound.play()
                      increaseScore(200);
                      console.log("Great", scaleValue)
                  }
                  else if (scaleValue <= 0.58 && scaleValue >= 0.42) {
                      circleOutElement.style.display = "none";
                      hitSound.play()
                      increaseScore(300);
                      console.log("Perfect", scaleValue)
                  }
                  else {
                      circleOutElement.style.display = "none";
                      hitSound.play()
                      increaseScore(200);
                      console.log("Under Great", scaleValue)
                  }
              }
              
            }
        }
    });
}

  // 컴포넌트의 반환 값 (렌더링 결과)
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div id="loading" hidden={videoSize.width !== 0}>
      <h1>로딩중입니다.</h1>
    </div>
    <div
      id="webcamWrapper"
      hidden={videoSize.width === 0}
        style={{
          position: "relative",
          width: videoSize.width,
          height: videoSize.height
        }}
      >
      <div id="score">
      <animated.div>
        {props.val.to(val => `Score : ${Math.floor(val)}`)}
      </animated.div>
    </div>
      <video
        hidden={!videoHidden} // videoHidden 상태에 따라 숨김/표시를 결정합니다.
        ref={videoSrcRef} // videoSrcRef를 사용합니다.
        id="videoSrc"
        src="/music/YOASOBI-IDOL.mp4" // 비디오 파일의 URL을 지정합니다.
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(1)",
        }}/>
      <video
        hidden={videoHidden}
        ref={videoRef}
        id="webcam"
        autoPlay
        style={{ position: "absolute", transform: "scaleX(-1)", filter: "brightness(40%)"}}/>
      <canvas
        id="canvas"
        width={videoSize.width}
        height={videoSize.height}/>
            <Button
              id = "toggleWebcam"
              variant="contained"
              onClick={toggleBackground}>
              {showBackground ? "Webcam ON" : "Webcam OFF"}
            </Button>
      {countdown > 0 && (
        <div id="countdown" style={{ fontSize: "100px" }}>
          {countdown}
        </div>
        )}
      </div>
    </div>
  );
}
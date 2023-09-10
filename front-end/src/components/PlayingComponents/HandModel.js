import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "react-spring";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision"; // 정적 임포트
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import APPLICATION_SERVER_URL from "../../ApiConfig";

let gestureRecognizer = undefined;
let category1Name = undefined;
let category2Name = undefined;
let shouldStopPrediction = false; // 처음에는 false로 설정
let webcamWrapper = undefined;
let computedStyle = undefined;
let webcamWrapperHeight = undefined;
let circlePixel = undefined;
let circleOutPixel = undefined;

// mediaPipe 모션네임
const motionNames = {
  1: "Closed_Fist",
  2: "Open_Palm",
  3: "Pointing_Up",
  4: "Victory",
  5: "ILoveYou",
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

export default function HandModel({ gameData }) {
  // 컴포넌트 상태 및 ref를 선언
  const token = localStorage.getItem("token");
  const videoRef = useRef(null); // 비디오 엘리먼트를 참조하기 위한 ref
  const [videoSrc, setVideoSrc] = useState(""); // 현재 비디오의 src를 저장합니다.

  // 가능한 모든 비디오 경로를 배열로 저장합니다.
  const videoPaths = [
    "/music/GameVideo1.mp4",
    "/music/GameVideo2.mp4",
    "/music/GameVideo3.mp4",
    "/music/GameVideo4.mp4",
  ];
  const videoSrcRef = useRef(null);
  const [videoHidden, setVideoHidden] = useState(Boolean(gameData.isCam));
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 }); // 비디오의 크기를 저장하는 상태
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const scoreRef = useRef(score);
  const [userNum, setUserNum] = useState(null);
  const userNumRef = useRef(userNum);
  const [musicNum, setMusicNum] = useState(null);
  const musicNumRef = useRef(musicNum);
  const location = useLocation();
  const [volume, setVolume] = useState(gameData.gameSound); // 볼륨 상태
  const audio1 = useRef(new Audio(`/music/${gameData.musicNumber}.mp3`));
  const audio2 = useRef(new Audio("/assets/Finish.mp3"));
  const [effectVolume, setEffectVolume] = useState(gameData.effectSound); // 볼륨 상태
  const missSound = useRef(new Audio("/assets/Miss.mp3"));
  const greatSound = useRef(new Audio("/assets/Great.mp3"));
  const perfectSound = useRef(new Audio("/assets/Perfect.mp3"));
  const [scaleStep, setScaleStep] = useState(gameData.synk);
  const scaleStepRef = useRef(scaleStep);
  const effectVolumeRef = useRef(effectVolume);
  const volumeRef = useRef(volume);
  const videoHiddenRef = useRef(videoHidden);
  const controlStyle = gameData.userInfo.length === 1 ? { right: "2rem" } : {};
  const videoOnImg = "/assets/video.png";
  const videoOffImg = "/assets/video-off.png";
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    // 페이지가 로드될 때마다 랜덤하게 하나의 비디오를 선택합니다.
    const randomVideo =
      videoPaths[Math.floor(Math.random() * videoPaths.length)];
    setVideoSrc(randomVideo);
  }, []);

  useEffect(() => {
    scaleStepRef.current = scaleStep;
    effectVolumeRef.current = effectVolume;
    volumeRef.current = volume;
    videoHiddenRef.current = videoHidden;
  }, [scaleStep, effectVolume, volume, videoHidden]);

  useEffect(() => {
    // 볼륨 상태가 변경될 때마다 오디오 객체의 볼륨을 업데이트
    audio1.current.volume = volume;
    audio2.current.volume = effectVolume;
    missSound.current.volume = effectVolume;
    greatSound.current.volume = effectVolume;
    perfectSound.current.volume = effectVolume;
  }, [volume, effectVolume]);

  // 오디오 재생 함수
  function playSound(audioRef) {
    audioRef.current.currentTime = 0; // 재생 시간을 0으로 리셋
    audioRef.current.play();
  }

  useEffect(() => {
    // 뒤로 가기 막기
    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // 초기 실행 시 히스토리 항목 추가
    blockBack();

    window.addEventListener("popstate", blockBack);

    // 새로고침 막기 (F5와 Ctrl+R)
    const blockRefresh = (event) => {
      if (event.keyCode === 116 || (event.ctrlKey && event.keyCode === 82)) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", blockRefresh);

    return () => {
      window.removeEventListener("popstate", blockBack);
      document.removeEventListener("keydown", blockRefresh);
    };
  }, []);

  // 배경의 표시 상태를 토글하는 함수
  const toggleBackground = () => {
    setVideoHidden(!videoHidden);
    setShowBackground((prevState) => !prevState);
  };

  // window의 크기를 저장하는 상태
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    axios({
      method: "get",
      url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // your access token here
      },
    })
      .then((response) => {
        setUserNum(response.data.userNumber);
      })
      .catch((error) => {
        console.error("error");
        const token = error.response.headers.authorization.slice(7);
        localStorage.setItem("token", token);
        axios({
          method: "get",
          url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // your access token here
          },
        })
          .then((response) => {
            setUserNum(response.data.userNumber);
          })
          .catch((error) => {
            console.log(error);
          });
      });
  }, [userNum, token]);

  const sendData = async () => {
    // 객체 생성
    const data = {
      musicNumber: musicNumRef.current,
      // playCnt: gameData.playCnt,
      roomNumber: gameData.roomNumber,
      score: scoreRef.current,
      userNumber: userNumRef.current,
      playCnt: gameData.playCnt,
    };
    // 헤더 설정

    try {
      // POST 요청을 통해 데이터 전송
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}/api/v1/game/log`,
        data
      );
    } catch (error) {
      console.error("Error sending the data:", error);
    }
  };

  const sendUserData = async () => {
    const isCamValue = videoHiddenRef.current ? 1 : 0;
    const data = {
      age: "",
      backSound: "",
      effectSound: parseFloat(effectVolumeRef.current),
      gameSound: parseFloat(volumeRef.current),
      isCam: isCamValue,
      nickname: "",
      password: "",
      profileImg: "",
      profileMusic: "",
      sex: "",
      synk: scaleStepRef.current,
    };
    try {
      // POST 요청을 통해 데이터 전송
      const response = await axios
        .patch(`${APPLICATION_SERVER_URL}/api/v1/users/modify`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .catch((error) => {
          const errorToken = localStorage.getItem("token");
          if (!errorToken) {
            // token이 null 또는 undefined 또는 빈 문자열일 때
            window.location.href = "/"; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
            return; // 함수 실행을 중단하고 반환합니다.
          }
          const token = error.response.headers.authorization.slice(7);
          localStorage.setItem("token", token);
          axios.patch(`${APPLICATION_SERVER_URL}/api/v1/users/modify`, data, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        });
    } catch (error) {
      console.error("Error sending the data:", error);
    }
  };

  // window의 크기가 변경될 때 windowSize 상태를 업데이트하는 함수
  const updateWindowDimensions = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  // window의 크기가 변경될 때마다 updateWindowDimensions 함수를 실행하도록 이벤트 리스너를 등록하는 useEffect
  useEffect(() => {
    scoreRef.current = score; // score 값이 변경될 때마다 ref를 업데이트합니다.
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
    return () => {
      window.removeEventListener("resize", updateWindowDimensions);
    };
  }, []);

  // 컴포넌트가 마운트될 때 카운트다운을 시작
  useEffect(() => {
    shouldStopPrediction = false;
    const fetchDataAndPredict = async () => {
      const data = await fetchData(); // fetchData가 데이터를 반환하도록 수정
      await createGestureRecognizer();
      await handleStartStreaming();
      await predictWebcam();
      return data; // 데이터 반환
    };

    fetchDataAndPredict().then((data) => {
      audio1.current.loop = false;
      audio2.current.loop = false;

      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            clearInterval(timer);
            audio1.current.play();

            if (videoSrcRef.current) {
              videoSrcRef.current.play();
            }
            createCircles(data);

            audio1.current.onended = () => {
              sendUserData();
              sendData();

              // 1초 텀을 둔 후에 audio2를 시작합니다.
              setTimeout(() => {
                audio2.current.play();

                audio2.current.onended = () => {
                  if (videoRef.current && videoRef.current.srcObject) {
                    const tracks = videoRef.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                    shouldStopPrediction = true;
                    videoRef.current.srcObject = null;
                    if (gameData.musicNumber === 0) {
                      navigate("/");
                    } else {
                      // 게임 끝났을때 순위창으로 이동
                      const gameRoomRes = {
                        roomNumber: gameData.roomNumber,
                        userNumber: gameData.userNumber,
                        roomTitle: gameData.roomTitle,
                        roomCapacity: gameData.roomCapacity,
                        roomCategory: gameData.roomCategory,
                        playCnt: gameData.playCnt,
                      };
                      navigate("/result", {
                        state: { gameRoomRes: gameRoomRes },
                      });
                    }
                  }
                };
              }, 800); // 1000ms = 1 second
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

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  // 볼륨조절 함수
  const handleEffectChange = (e) => {
    setEffectVolume(e.target.value);
    missSound.current.volume = e.target.value;
    greatSound.current.volume = e.target.value;
    perfectSound.current.volume = e.target.value;
  };

  // 웹캠 스트림을 시작하는 비동기 함수
  const handleStartStreaming = async () => {
    try {
      const height = windowSize.height;
      const width = windowSize.width;

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
      const url = `/music/${gameData.musicNumber}.json`;
      const numberString = url.split(".")[0].split("/").pop(); // "1"
      const number = parseInt(numberString, 10); // 1
      setMusicNum(number);
      const response = await axios.get(url);
      const data = response.data; // 가져온 데이터
      return data; // 데이터 반환
    } catch (error) {
      console.error("Error fetching the JSON data:", error);
    }
  };

  useEffect(() => {
    webcamWrapper = document.getElementById("webcamWrapper");
    if (webcamWrapper) {
      // 요소가 존재하는지 확인
      computedStyle = getComputedStyle(webcamWrapper);
      webcamWrapperHeight = parseFloat(computedStyle.height);
      circlePixel = webcamWrapperHeight * 0.15;
      circleOutPixel = webcamWrapperHeight * 0.35;
    }
  }, []);

  // fetchData 함수를 수정하여 데이터를 가져와서 nodes에 저장하고 웹캠 위에 원 그리기
  const createCircles = async (data) => {
    data.forEach((node) => {
      setTimeout(() => {
        // circle 클래스를 가진 div를 생성합니다.
        const circleDiv = document.createElement("div");
        circleDiv.className = "circle";

        // circle Node의 테두리 div
        const circleOut = document.createElement("div");
        circleOut.className = "circleOut";

        // MOTION_NUM을 확인하여 'motion' + MOTION_NUM 클래스를 추가합니다.
        circleDiv.classList.add("motion" + node.MOTION_NUM);

        circleDiv.setAttribute("data-id", node.NodeNum);
        circleOut.setAttribute("data-id", node.NodeNum);

        // webcam의 위치와 크기를 얻습니다.
        const webcamRect = webcamWrapper.getBoundingClientRect();

        circleDiv.style.width = `${circlePixel}px`;
        circleDiv.style.height = `${circlePixel}px`;
        circleOut.style.width = `${circleOutPixel}px`;
        circleOut.style.height = `${circleOutPixel}px`;

        // div의 위치를 설정합니다. X-COORDINATE와 Y-COORDINATE 값은 0~1 범위라고 가정합니다.
        circleDiv.style.left = `calc(${
          webcamRect.width -
          (webcamRect.left + node["X-COORDINATE"] * webcamRect.width)
        }px - ${circlePixel / 2}px)`;
        circleDiv.style.top = `calc(${
          webcamRect.top + node["Y-COORDINATE"] * webcamRect.height
        }px - ${circlePixel / 2}px)`;
        circleOut.style.left = `calc(${
          webcamRect.width -
          (webcamRect.left + node["X-COORDINATE"] * webcamRect.width)
        }px - ${circleOutPixel / 2}px)`;
        circleOut.style.top = `calc(${
          webcamRect.top + node["Y-COORDINATE"] * webcamRect.height
        }px - ${circleOutPixel / 2}px)`;

        // div를 웹캠의 컨테이너인 webcamWrapper에 추가합니다.
        webcamWrapper.appendChild(circleDiv);
        webcamWrapper.appendChild(circleOut);

        // 애니메이션 시작
        let scale = 1;

        function animate() {
          scale -= scaleStepRef.current;
          circleOut.style.transform = `scale(${scale})`;

          if (scale > 0.2) {
            // circleDiv가 아직 DOM에 있으면 애니메이션을 계속합니다.
            if (circleOut.parentNode) {
              requestAnimationFrame(animate);
            }
          } else {
            // circleDiv의 display 값이 none이 아닐 때만 로직 실행
            if (circleOut.parentNode) {
              const valX =
                webcamRect.width -
                (webcamRect.left + node["X-COORDINATE"] * webcamRect.width) -
                circlePixel / 4;
              const valY =
                webcamRect.top +
                node["Y-COORDINATE"] * webcamRect.height -
                circlePixel / 4;
              showValue(valX, valY, "MISS");

              // scale이 0.2 이하가 되면 div를 삭제합니다.
              webcamWrapper.removeChild(circleDiv);
              webcamWrapper.removeChild(circleOut);

              playSound(missSound);
            }
          }
        }
        animate();
      }, node.APPEAR_TIME * 1000 - 500 + scaleStepRef.current * 100); // APPEAR_TIME은 초 단위로 가정합니다.
    });
  };

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
      canvasCtx.shadowBlur = 10; // 흐릿한 정도 설정
      canvasCtx.shadowColor = "#0fa"; // 그림자 색상 설정

      for (let landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "white",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "white", lineWidth: 2 });
      }
    }
    canvasCtx.restore();

    let handX = 0;
    let handY = 0;

    // 예측 결과를 처리
    if (results.gestures.length > 0) {
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

  function removeBoth(circle, circleOut) {
    if(circle) circle.remove();
    if(circleOut) circleOut.remove();
}


  function hideCircle(handX, handY, categoryName) {
    const circleElements = document.querySelectorAll(".circle");
    circleElements.forEach((circleElement) => {
      // 원형 div의 위치를 얻습니다. (0~1 범위로 변환)
      const valX = parseFloat(circleElement.style.left.replace(/[^\d.]/g, ""));
      const valY = parseFloat(circleElement.style.top.replace(/[^\d.]/g, ""));
      const circleX =
        1 -
        parseFloat(
          parseFloat(circleElement.style.left.replace(/[^\d.]/g, "")) +
            circlePixel / 2
        ) /
          document.getElementById("webcamWrapper").offsetWidth;
      const circleY =
        parseFloat(
          parseFloat(circleElement.style.top.replace(/[^\d.]/g, "")) +
            circlePixel / 2
        ) / document.getElementById("webcamWrapper").offsetHeight;
      const motionNum = circleElement.className
        .split(" ")[1]
        .replace("motion", "");

      if (motionNames[motionNum] === categoryName) {
        // 손의 위치와 원형 div의 위치 사이의 거리를 계산합니다.
        const distance = Math.sqrt(
          Math.pow(handX - circleX, 2) + Math.pow(handY - circleY, 2)
        );

        // 거리가 특정 임계값 이하이면 원형 div를 삭제합니다.
        const threshold = 0.05; // 필요에 따라 이 값을 조정할 수 있습니다.
        if (distance <= threshold) {
          const matchingId = circleElement.getAttribute("data-id");
          const circleOutElement = document.querySelector(
            `.circleOut[data-id="${matchingId}"]`
          );

          if (circleOutElement) {
            // Parse the scale value from the transform style
            let scaleValue = parseFloat(
              circleOutElement.style.transform
                .replace("scale(", "")
                .replace(")", "")
            );

            if (scaleValue >= 0.6) {
              playSound(missSound);
              showValue(valX, valY, "MISS");
            } else if (scaleValue < 0.6 && scaleValue > 0.49) {
              playSound(greatSound);
              showValue(valX, valY, "GREAT");
              increaseScore(150);
            } else if (scaleValue <= 0.49 && scaleValue >= 0.37) {
              playSound(perfectSound);
              showValue(valX, valY, "PERFECT");
              increaseScore(300);
            } else {
              playSound(greatSound);
              showValue(valX, valY, "GREAT");
              increaseScore(150);
            }
            removeBoth(circleElement, circleOutElement);
          }
        }
      }
    });
  }

  function showValue(x, y, val) {
    const webcamWrapper = document.getElementById("webcamWrapper");
    const valueDiv = document.createElement("div");
    valueDiv.classList.add("value", val);
    valueDiv.innerText = val;
    valueDiv.style.left = `${x}px`;
    valueDiv.style.top = `${y}px`;
    webcamWrapper.appendChild(valueDiv);

    setTimeout(() => {
      webcamWrapper.removeChild(valueDiv);
    }, 600);
  }

  // 컴포넌트의 반환 값 (렌더링 결과)
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div id="loading" hidden={videoSize.width !== 0}>
        <ul className="loadul">
          <li className="loadli"></li>
          <li className="loadli"></li>
          <li className="loadli"></li>
          <li className="loadli"></li>
          <li className="loadli"></li>
        </ul>
      </div>
      <div
        id="webcamWrapper"
        hidden={videoSize.width === 0}
        style={{
          position: "relative",
        }}
      >
        <div id="score">
          <animated.div>
            {props.val.to((val) => `Score : ${Math.floor(val)}`)}
          </animated.div>
        </div>
        <video
          hidden={videoHidden} // videoHidden 상태에 따라 숨김/표시를 결정합니다.
          ref={videoSrcRef} // videoSrcRef를 사용합니다.
          id="videoSrc"
          src={videoSrc} // 비디오 파일의 URL을 지정합니다.
          loop
          style={{
            position: "absolute",
            width: "100vw ",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(1)",
          }}
        />
        <video
          hidden={!videoHidden}
          ref={videoRef}
          id="webcam"
          autoPlay
          // width={videoSize.width}
          height={videoSize.height}
          style={{
            position: "absolute",
          }}
        />
        <canvas id="canvas" width={videoSize.width} height={videoSize.height} />
        <div
          id="toggleWebcam"
          onClick={toggleBackground}
          style={{ cursor: "pointer" }} // 이미지를 클릭 가능한 것처럼 보이게 하려면 이 스타일을 사용하세요.
        >
          <img
            src={showBackground ? videoOnImg : videoOffImg}
            alt={showBackground ? "Webcam ON" : "Webcam OFF"}
          />
        </div>
        <div className="control" style={{ ...controlStyle, bottom: "80px" }}>
          <span>Game Sound</span>
          <input
            className="slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
        <div className="control" style={{ ...controlStyle, bottom: "50px" }}>
          <span>Effect Sound</span>
          <input
            className="slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={effectVolume}
            onChange={handleEffectChange}
          />
        </div>
        <div className="control" style={{ ...controlStyle, bottom: "20px" }}>
          <span>Sync</span>
          <input
            className="slider"
            type="range"
            min="0.005"
            max="0.05"
            step="0.001"
            value={scaleStep} // useState로 관리하는 상태를 사용
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              setScaleStep(newValue); // 상태 변경
              // setScaleStep(newValue); // state를 사용하는 경우에는 이 코드도 필요합니다.
            }}
          />
        </div>

        {countdown > 0 && <div id="countdown">{countdown}</div>}
      </div>
    </div>
  );
}

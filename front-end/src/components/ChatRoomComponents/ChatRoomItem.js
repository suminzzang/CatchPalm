import React, { useState, useEffect, useRef } from "react";
import style from "./ChatRoomItem.module.css";
import "./ChatRoomItem.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from "react-router-dom"; // useNavigate 불러옴
import { allResolved } from "q";
import { display, margin } from "@mui/system";
import APPLICATION_SERVER_URL from "../../ApiConfig";
import {
  BrowserRouter as Router,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
import Swal from "sweetalert2";

let name = "";
let Sock = null;
var stompClient = null;
let audio = null;
var colors = [
  "#2196F3",
  "#32c787",
  "#00BCD4",
  "#ff5652",
  "#ffc107",
  "#ff85af",
  "#FF9800",
  "#39bbb0",
];

const ChatRoomItem = () => {
  const navigate = useNavigate();

  // 게임시작 신호--------------------------------------------------
  const [mySettings, setMySettings] = useState();
  const [gameStart, setGameStart] = useState(0); // gameStart 상태로 추가
  const [startMusic, setStartMusic] = useState(); // startMusic 상태로 추가
  const [startRoom, setStartRoom] = useState(); // startRoom 상태로 추가
  const [startMusicName, setStartMusicName] = useState(""); // startMusic 상태로 추가
  const [isVideo, setIsVideo] = useState(0); // startMusic 상태로 추가
  const [exitStatus, setExitStatus] = useState(0); // 방 나가는 버튼 활성화 여부

  useEffect(() => {
    if (gameStart === 1) {
      // TODO -- 게임 시작시 로직 --
      // 오픈비두로 전달할 데이터.
      var gameStartRes = {
        // 시작시 게임정보
        roomNumber: startRoom, // 시작한 방
        musicNumber: startMusic, // 음악 번호
        musicName: startMusicName, // 음악 이름
        nickname: name,
        userNumber: userNumber,
        userInfo: userInfo,
        isCam: isVideo,
        backSound: mySettings.backSound,
        effectSound: mySettings.effectSound,
        gameSound: mySettings.gameSound,
        synk: mySettings.synk,
        playCnt: roomInfo.playCnt,
        roomTitle: roomInfo.title,
        roomCapacity: roomInfo.capacity,
        roomCategory: roomInfo.category

      };
      // 게임 창 페이지로 이동하면서 데이터 전달
      navigate("/Playing", { state: { gameData: gameStartRes } });
      // window.open('/Playing', '_blank');
    }
  }, [gameStart]); // 게임시작 신호가 오면 수행
  //------------------------------------------------------------------

  const token = localStorage.getItem("token");
  const [userNumber, setUserNumber] = useState(""); // userNumber 상태로 추가
  const messageAreaRef = useRef();
  const { roomNumber } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);

  const [userInfo, setUserInfo] = useState([]); // 유저정보들
  const [soundVolume, setSoundVolume] = useState(0.3); // 음악 사운드 사용자 설정 가져오기.
  const [captain, setCaptain] = useState(); // 방장 정보
  const [messages, setMessages] = useState(""); // 보내는 메세지

  // ------- 음악 음소거 유무 ----------------
  const [musicOnOff, setMusicOnOff] = useState(1);
  useEffect(() => {
    if (musicOnOff === 1 && audio !== null && soundVolume !== null) {
      audio.volume = soundVolume; // 볼륨 30%로 설정
    } else if (musicOnOff === 0 && audio !== null) {
      audio.volume = 0;
    }
  }, [musicOnOff]);

  const changeSoundStatus = () => {
    setMusicOnOff(musicOnOff === 0 ? 1 : 0);
  };

  //-----------------------------------------

  // 유저 프로필사진 인코딩
  const getImageSrc = (profileImg) => {
    if (profileImg) {
      // Convert Base64 data to an image data URL
      return `data:image/jpeg;base64,${profileImg}`;
    }
    return null;
  };

  //---------비디오 활성화 유무: 게임창으로 이동했을때 반영.
  const changeVideoStatus = () => {
    setIsVideo(isVideo === 0 ? 1 : 0);
  };
  //------------------------------------

  useEffect(() => {
    // 뒤로 가기 막기
    const blockBack = () => {
        window.history.pushState(null, "", window.location.href);
    };
    
    // 초기 실행 시 히스토리 항목 추가
    blockBack();
    
    window.addEventListener('popstate', blockBack);

    // 새로고침 막기 (F5와 Ctrl+R)
    const blockRefresh = (event) => {
      if (event.keyCode === 116 || (event.ctrlKey && event.keyCode === 82)) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", blockRefresh);

    return () => {
        window.removeEventListener('popstate', blockBack);
        document.removeEventListener("keydown", blockRefresh);
    };
    
}, []);


  // const [messageText, setMessageText] = useState(''); // 받는 메세지
  // 음악 리스트 관련
  const [pickedMusic, setPickedMusic] = useState();
  const [musicName, setMusicName] = useState();
  const [currdeg, setCurrdeg] = useState(0);
  const [showTooltip, setShowTooltip] = useState([false, false, false]);
  const handleMouseEnter = (index) => {
    setShowTooltip((prevState) => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  const handleMouseLeave = (index) => {
    setShowTooltip((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };

  const rotate = (direction) => {
    if (direction === "next") {
      setCurrdeg(currdeg - 60);
    } else if (direction === "prev") {
      setCurrdeg(currdeg + 60);
    }
  };

  const chageMusicBtn = (musicNumber, musicName1) => {
    setPickedMusic(musicNumber);
    setMusicName(musicName1);
  };

  useEffect(() => {
    if (
      pickedMusic !== null &&
      musicName !== null &&
      stompClient !== null &&
      soundVolume !== null
    ) {
      if (name === captain) {
        // 방장일 경우만
        musicChange(); // 변경사항 소켓으로 전달.
      }
      if (audio) {
        // 음악이 켜져있다면
        audio.pause(); // 음악끄기.
        audio.currentTime = 0;
      }
      audio = new Audio(`/music/${pickedMusic}.mp3`);
      if (musicOnOff === 1) {
        audio.volume = soundVolume; // 볼륨 30%로 설정
      } else {
        audio.volume = 0;
      }
      if (audio != null) {
        audio.play();
      }
    }
  }, [pickedMusic, musicName, soundVolume]); // 선택곡이 바뀌면 수행

  //  채팅관련
  const handleMessageChange = (event) => {
    setMessages(event.target.value);
  };

  useEffect(() => {
    if (userNumber !== "") {
      // 처음에 채팅 바로 시작안되고 userNumber 받아왔을때 채팅 실행
      handleStartChatting();
    }
    axios({
      method: "get",
      url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // your access token here
      },
    })
      .then((response) => {
        const userNumber = response.data.userNumber;
        setUserNumber(userNumber);
        name = response.data.userNickname;
        setSoundVolume(response.data.backSound);
        setMySettings(response.data);
      })
      .catch((error) => {
        console.error("error");
        const errorToken = localStorage.getItem("token");
        if (!errorToken) {
          // token이 null 또는 undefined 또는 빈 문자열일 때
          window.location.href = "/"; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
          return; // 함수 실행을 중단하고 반환합니다.
        }
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
            const userNumber = response.data.userNumber;
            setUserNumber(userNumber);
            name = response.data.userNickname;
            setSoundVolume(response.data.backSound);
            setMySettings(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    const fetchRoomInfo = async () => {
      try {
        const response = await axios.get(
          `${APPLICATION_SERVER_URL}/api/v1/gameRooms/getGameRoomInfo/${roomNumber}`
        );
        const data = response.data;
        setRoomInfo(data);
        setCaptain(data.nickname);
        setPickedMusic(data.musicNumber);
        setMusicName(data.musicName);
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };

    const checkLeftUser = async () => {
      try {
        const response = await axios.get(
          `${APPLICATION_SERVER_URL}/api/v1/gameRooms/getGameRoomInfo/${roomNumber}`
        );
        const data = response.data;
        
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };
    fetchRoomInfo();
  }, [userNumber]);

  // 소켓연결---------------------------------
  // 소켓연결 끊길때: 컴포넌트 변경돨 때 수행 소스 -> 웹소켓 연결 끈기.
  useEffect(() => {
    return () => {
      stompClient.disconnect();
      if (audio) {
        // 음악이 켜져있다면
        audio.pause(); // 음악끄기.
        audio.currentTime = 0;
      }
    };
  }, []);

  const connect = () => {
    Sock = new SockJS(`${APPLICATION_SERVER_URL}/ws`);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };
  // 연결 됬다면 구독 매핑 및 연결 유저 정보 전송
  const onConnected = () => {
    stompClient.subscribe(`/topic/chat/${roomNumber}`, onMessageReceived);
    stompClient.send(
      "/app/chat.addUser",
      {},
      JSON.stringify({
        sender: name,
        type: "JOIN",
        userNumber: userNumber,
        roomNumber: roomNumber,
      })
    );
  };
  // 연결이 안된경우
  const onError = (err) => {
    console.log(err);
  };

  // 서버에서 메세지 수신R

  const onMessageReceived = (payload) => {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement("li");

    // 만약 강퇴 신호라면
    if (message.type === "DROP") {
      if (message.nickname === name) {
        Swal.fire({
          icon: "error",
          title: "강퇴되었습니다.",
        });
        navigate('/chatRoomList');
      }
      return;
    }
    // 만약 게임시작 신호라면
    else if (message.type === "START") {
      setGameStart(message.isStart);
      setStartMusic(message.musicNumber);
      setStartRoom(message.roomNumber);
      setStartMusicName(message.musicName);
      return;
    }

    // 만약 음악 변경 신호면
    else if (message.type === "MUSIC") {
      setPickedMusic(message.musicNumber);
      setMusicName(message.musicName);
      return;
    }

    // 만약 레디신호면
    else if (message.type === "READY") {
      setUserInfo((prevUserInfo) =>
        prevUserInfo.map((user) =>
          user.userNumber === message.userNumber
            ? { ...user, ready: message.isReady }
            : user
        )
      );
      return;
    } else if (message.type === "JOIN") {
      messageElement.classList.add("event-message");
      message.content = message.sender + " joined!";
      setUserInfo(message.userInfo);
      setExitStatus(1);
    } else if (message.type === "LEAVE") {
      messageElement.classList.add("event-message");
      message.content = message.sender + " left!";
      setUserInfo(message.userInfo);
      if (message.captain !== null) {
        // 방장 정보가 들어왔다면 : 방장이 나감.
        setCaptain(message.captain);
        setUserInfo((prevUserInfo) =>
          prevUserInfo.map((user) =>
            user.userNumber === message.captain ? { ...user, ready: 1 } : user
          )
        );
      }
    } else {
      messageElement.classList.add("chat_message");

      var avatarElement = document.createElement("i");
      var avatarText = document.createTextNode(message.sender[0]);
      avatarElement.appendChild(avatarText);
      avatarElement.style.backgroundColor = getAvatarColor(message.sender);

      messageElement.appendChild(avatarElement);

      var usernameElement = document.createElement("span");
      var usernameText = document.createTextNode(message.sender);
      usernameElement.appendChild(usernameText);
      messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement("p");
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageAreaRef.current.appendChild(messageElement);
    messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
  };

  const getAvatarColor = (messageSender) => {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
  };

  // 강퇴 정보 전송
  const dropOutUser = (nickname) => {
    if (Sock.readyState === SockJS.OPEN && nickname) {
      // 강퇴대상과 구독설정이 잘 되어 있다면.
      var dropUser = {
        // 변경된 음악정보
        nickname: nickname, // 강퇴할 유저 닉네임
        roomNumber: roomInfo.roomNumber, // 현재 룸 넘버
      };
      stompClient.send("/app/drop.user", {}, JSON.stringify(dropUser));
    } else {
      console.log("강퇴 실패.");
    }
  };

  // 음악 변경 정보 전송

  const musicChange = () => {
    if (Sock.readyState === SockJS.OPEN && pickedMusic && musicName) {
      // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
      var changedMusic = {
        // 변경된 음악정보
        roomNumber: roomInfo.roomNumber,
        musicNumber: pickedMusic, // 음악 번호
        musicName: musicName, // 음악 이름
      };
      stompClient.send("/app/music.change", {}, JSON.stringify(changedMusic));
    } else {
      console.log("변경된 음악 정보 전달 실패.");
    }
  };

  // 레디 정보 전송
  const clickReady = (event) => {
    if(exitStatus === 1){
      event.preventDefault();
      if (userNumber && roomNumber && stompClient) {
        // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
        var readyFlag = {
          // 레디신호 데이터
          roomNumber: roomNumber, // 방 번호
          userNumber: userNumber, // 유저 번호
        };
        stompClient.send("/app/ready.click", {}, JSON.stringify(readyFlag));
      } else {
        console.log("READY신호 전달 실패.");
      }
      event.preventDefault();
    }
  };

  // 게임 스타트 정보 전송
  const clickStart = (event) => {
    if(exitStatus === 1){
      event.preventDefault();

      const readyCount = userInfo.filter(
        (user) => user.nickname !== captain && user.ready === 1
      ).length;
      if (readyCount === userInfo.length - 1) {
        if (userNumber && roomNumber && stompClient) {
          // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
          var startReq = {
            // 시작요청 데이터
            roomNumber: roomNumber, // 방 번호
            musicNumber: pickedMusic, // 음악 번호
            musicName: musicName, // 음악 이름
          };

          stompClient.send("/app/game.start", {}, JSON.stringify(startReq));
        } else {
          console.log("게임 시작 실패.");
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "아직 레디가 완료되지 않았습니다.",
          // text: "방 제목을 입력 해주세요",
        });
      }
      event.preventDefault();
    }
  };

  // 채팅 보내기.
  const handleSendMessage = (event) => {
    event.preventDefault();
    // Implement the logic to send a message using WebSocket
    // You may need to add the WebSocket logic here to send messages.
    if (messages && stompClient) {
      var chatMessage = {
        sender: name,
        content: messages,
        userNum: userNumber,
        type: "CHAT",
        roomNumber: roomNumber,
      };
      stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify(chatMessage)
      );
      setMessages("");
    }
    event.preventDefault();
  };
  const handleStartChatting = () => {
    // 소켓연결
    connect();
  };

  const handleQuitChatRoom = () => {
    if(exitStatus === 1){
      navigate("/chatRoomList");
    }
  };

  if (!roomInfo || !Sock) {
    return <div>Loading...</div>;
  }
  if(roomInfo && Sock){

    return (
      <div
        style={{
          marginTop: "5%",
        }}
        className={style.gameRoomBody}
      >
        {/* 음악 리스트 민우짱 */}
        <div>
          <div className={style.container}>
            <div
              className={style.carousel}
              style={{
                transform: `rotateY(${currdeg}deg)`,
                WebkitTransform: `rotateY(${currdeg}deg)`,
                MozTransform: `rotateY(${currdeg}deg)`,
                OTransform: `rotateY(${currdeg}deg)`,
              }}
            >
              {roomInfo.musics.map((music, index) => (
                <div
                  key={index}
                  className={`${style.item} ${style[`a${index + 1}`]}`}
                  style={{
                    backgroundImage: `url(${music.thumbnail})`,
                    width: "265px",
                    backgroundSize: "cover",
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  {pickedMusic === music.musicNumber && (
                    <img
                      className={style.pickedMusic}
                      src="https://assets-v2.lottiefiles.com/a/27d1e422-117c-11ee-afb5-33b1d01a5c73/s3QDBfQGB4.png"
                      alt="User Thumbnail"
                    />
                  )}
                  {captain === name && (
                    <button
                      className={style.pickbtn}
                      onClick={() =>
                        chageMusicBtn(music.musicNumber, music.musicName)
                      }
                    >
                      PLAY
                    </button>
                  )}
                  {showTooltip[index] && (
                    <div
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        color: "#fff",
                        borderRadius: "5px",
                        overflow: "hidden",
                        fontSize: "10px",
                        width: "245px",
                        height: "180px",
                      }}
                    >
                      <div className={style.info_container}>
                        <div className={style.music_name}>{music.musicName}</div>
                        <div className={style.music_details}>
                          <div className={style.detail_item}>재생 시간: {music.runningTime}</div>
                          <div className={style.detail_item}>가수: {music.singer}</div>
                          <div className={style.detail_item}>난이도: {music.level}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={style.next} onClick={() => rotate("next")}>
          ▷
        </div>
        <div className={style.prev} onClick={() => rotate("prev")}>
          ◁
        </div>
  
        <div className={style.showMusicName}>{musicName}</div>
  
        <div id="chat-page" className={style.hidden}>
          <div className={style.chat_container}>
            <div className={style.chat_header}>
              <h2 id="roomN">CHATTINGS</h2>
            </div>
            <ul ref={messageAreaRef} className={style.scrollbar}></ul>
            <form
              id="messageForm"
              name="messageForm"
              onSubmit={handleSendMessage}
            >
              <div className={style.form_group}>
                <div
                  className={`${style.input_group} ${style.clearfix}`}
                  style={{
                    display: "flex",
                  }}
                >
                  <input
                    type="text"
                    id="message"
                    placeholder="Type a message..."
                    autoComplete="off"
                    className={style.form_control}
                    value={messages}
                    onChange={handleMessageChange}
                  />
                  <button type="submit" className={style.primary}>
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
  
          {/* 유저 리스트 민우짱 */}
          <div className={style.user_info}>
            <div className={style.user_item}>
              <div className={style.playerCount}>
                PLAYER : {userInfo.length} / {roomInfo.capacity}
              </div>
            </div>
            {userInfo &&
              userInfo.map((user, index) => (
                <div
                  className={style.user_item}
                  style={{
                    backgroundColor:
                      user.nickname === captain
                        ? "rgb(179, 6, 179, 0.5)"
                        : userInfo[index].ready === 0
                        ? "rgb(0, 0, 0, 0.1)"
                        : "rgb(179, 6, 179, 0.6)",
                  }}
                >
                  {/* 프로필 사진 없을 때. */}
                  {user.profileImg === null && (
                    <i
                      style={{
                        backgroundColor: `${getAvatarColor(user.nickname)}`,
                      }}
                      className={style.noProfile}
                    >
                      {user.nickname[0]}
                    </i>
                  )}
                  {/* 프로필 사진 있을 때. */}
                  {user.profileImg !== null && (
                    <img
                      className={style.userImg}
                      src={getImageSrc(user.profileImg)}
                      alt="User Thumbnail"
                    />
                  )}
  
                  <div
                    className={style.nickname}
                    style={{
                      color: user.nickname === name ? "springgreen" : "white",
                    }}
                  >
                    {user.nickname}
                  </div>
                  {captain === user.nickname && (
                    <img
                      className={style.captainlogo}
                      src="https://cdn-icons-png.flaticon.com/512/679/679660.png"
                      alt="Captain"
                    />
                  )}
                  {/* 강퇴버튼. 방장유저만 */}
                  {captain === name && user.nickname !== name && (
                    <img
                      src="/assets/out.png"
                      alt="강퇴"
                      style={{
                        height: "50%",
                        cursor: "pointer",
                        marginLeft: "auto",
                      }}
                      onClick={() => dropOutUser(user.nickname)}
                    />
                  )}
                </div>
              ))}
          </div>
          <div className={style.game_option} style={{}}>
            <div
              style={{
                width: "100%",
                height: "20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              {musicOnOff === 1 && (
                <img
                  src="/assets/speaker.png"
                  alt="speaker-on"
                  style={{
                    height: "75%",
                    cursor: "pointer",
                  }}
                  onClick={changeSoundStatus}
                />
              )}
              {musicOnOff === 0 && (
                <img
                  src="/assets/speaker_off.png"
                  alt="speaker-off"
                  style={{
                    height: "75%",
                    cursor: "pointer",
                  }}
                  onClick={changeSoundStatus}
                />
              )}
              {isVideo === 0 && (
                <img
                  src="/assets/video-off.png"
                  alt="video-off"
                  style={{
                    height: "75%",
                    cursor: "pointer",
                  }}
                  onClick={changeVideoStatus}
                />
              )}
              {isVideo === 1 && (
                <img
                  src="/assets/video.png"
                  alt="video-on"
                  style={{
                    height: "75%",
                    cursor: "pointer",
                  }}
                  onClick={changeVideoStatus}
                />
              )}
            </div>
            {captain !== name && (
              <a
                onClick={clickReady}
                style={{
                  width: "100%",
                  color: "mediumspringgreen",
                  textAlign: "center",
                  display: "grid",
                  height: "40%",
                  justifyContent: "space-around",
                  alignContent: "space-around",
                  fontSize: "2.5rem",
                  margin: "0",
                  border: "1px solid",
                  filter: "hue-rotate(215deg)",
                }}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                READY
              </a>
            )}
            {captain === name && (
              <a
                onClick={clickStart}
                style={{
                  width: "100%",
                  color: "aqua",
                  textAlign: "center",
                  display: "grid",
                  height: "40%",
                  justifyContent: "space-around",
                  alignContent: "space-around",
                  fontSize: "2.5rem",
                  margin: "0",
                  border: "1px solid",
                }}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                start
              </a>
            )}
            <a
              onClick={handleQuitChatRoom}
              style={{
                width: "100%",
                color: "aqua",
                textAlign: "center",
                display: "grid",
                height: "40%",
                justifyContent: "space-around",
                alignContent: "space-around",
                fontSize: "2.5rem",
                margin: "0",
                border: "1px solid",
              }}
            >
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              EXIT
            </a>
          </div>
        </div>
      </div>
    );
  };
  }

export default ChatRoomItem;

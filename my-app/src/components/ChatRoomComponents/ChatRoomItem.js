import React, { useState, useEffect, useRef } from "react";
import "./ChatRoomItem.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { over } from "stompjs";
import SockJS from "sockjs-client";
import { useNavigate } from 'react-router-dom'; // useNavigate 불러옴
import { allResolved } from "q";
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
  // 게임시작 신호--------------------------------------------------
  const [gameStart, setGameStart] = useState(0); // gameStart 상태로 추가
  const [startMusic, setStartMusic] = useState(); // startMusic 상태로 추가
  const [startRoom, setStartRoom] = useState(); // startRoom 상태로 추가
  const [startMusicName, setStartMusicName] = useState(""); // startMusic 상태로 추가
  const navigate = useNavigate();
  useEffect(() => {
    if (gameStart === 1) {
      // TODO -- 게임 시작시 로직 --
      // 오픈비두로 전달할 데이터.
      var gameStartRes = { // 시작시 게임정보
        roomNumber: startRoom, // 시작한 방
        musicNumber: startMusic, // 음악 번호
        musicName: startMusicName,  // 음악 이름
        nickname: name,
        userNumber: userNumber
      };
      // 게임 창 페이지로 이동하면서 데이터 전달
      // navigate('/게임창경로', { state: { gameData: gameStartRes } });
      alert("게임시작");
    }
  }, [gameStart]); // 게임시작 신호가 오면 수행
  //------------------------------------------------------------------

  const token = localStorage.getItem("token");
  const [userNumber, setUserNumber] = useState(""); // userNumber 상태로 추가
  const messageAreaRef = useRef(null);
  const { roomNumber } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);

  const [userInfo, setUserInfo] = useState([]); // 유저정보들
  const [captain, setCaptain] = useState(); // 방장 정보
  const [messages, setMessages] = useState(""); // 보내는 메세지
  // const [messageText, setMessageText] = useState(''); // 받는 메세지
  // 음악 리스트 관련
  const [pickedMusic, setPickedMusic] = useState();
  const [musicName, setMusicName] = useState();
  const [currdeg, setCurrdeg] = useState(0);
  const [showTooltip, setShowTooltip] = useState([false,false,false]);
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
    if (direction === 'next') {
      setCurrdeg(currdeg - 60);
    } else if (direction === 'prev') {
      setCurrdeg(currdeg + 60);
    }
  };

  const chageMusicBtn = (musicNumber, musicName1) => {
    setPickedMusic(musicNumber);
    setMusicName(musicName1);
  }

  useEffect(() => {
    if (pickedMusic !== null && musicName !== null && stompClient !== null) {
      if(name === captain) { // 방장일 경우만 
        musicChange(); // 변경사항 소켓으로 전달.
      }
      if (audio) { // 음악이 켜져있다면
        audio.pause(); // 음악끄기.
        audio.currentTime = 0;
      }
      audio = new Audio(`/music/${pickedMusic}.mp3`);
      audio.volume = 0.3; // 볼륨 30%로 설정
      audio.play();
    }
  }, [pickedMusic, musicName]); // 선택곡이 바뀌면 수행

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
      url: "https://localhost:8443/api/v1/users/me",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // your access token here
      },
    })
      .then((response) => {
        const userNumber = response.data.userNumber;
        setUserNumber(userNumber);
        name = response.data.userNickname;
      })
      .catch((error) => {
        console.error("error");
        const errorToken = localStorage.getItem('token');
            if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
              window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
              return; // 함수 실행을 중단하고 반환합니다.
            }
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
            const userNumber = response.data.userNumber;
            setUserNumber(userNumber);
            name = response.data.userNickname;
          })
          .catch((error) => {
            console.log(error);
          });
      });
    const fetchRoomInfo = async () => {
      try {
        const response = await axios.get(
          `https://localhost:8443/api/v1/gameRooms/getGameRoomInfo/${roomNumber}`
        );
        const data = response.data;
        setRoomInfo(data);
        setCaptain(data.nickname);
        setPickedMusic(data.musicNumber);
        setMusicName(data.musicName)
        
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
      if (audio) { // 음악이 켜져있다면
        audio.pause(); // 음악끄기.
        audio.currentTime = 0;
      }
    };
  }, []);

  const connect = () => {
    Sock = new SockJS("https://localhost:8443/ws");
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };
  // 연결 됬다면 구독 매핑 및 연결 유저 정보 전송
  const onConnected = () => {
    stompClient.subscribe(`/topic/chat/${roomNumber}`, onMessageReceived);
    stompClient.send("/app/chat.addUser",
      {},
      JSON.stringify({ sender: name, type: 'JOIN', userNumber: userNumber, roomNumber: roomNumber })
      )
  }
  // 연결이 안된경우
  const onError = (err) => {
    console.log(err);
  };

  // 서버에서 메세지 수신R

  const onMessageReceived = (payload) => {
    var message = JSON.parse(payload.body);
    var messageElement = document.createElement("li");

    // 만약 게임시작 신호라면
    if(message.type === 'START'){
      setGameStart(message.isStart);
      setStartMusic(message.musicNumber);
      setStartRoom(message.roomNumber);
      setStartMusicName(message.musicName);
      return;
    }

    // 만약 음악 변경 신호면
    else if(message.type === 'MUSIC'){
      setPickedMusic(message.musicNumber);
      setMusicName(message.musicName);
      return;
    }

    // 만약 레디신호면
    else if (message.type === 'READY') {
      setUserInfo((prevUserInfo) =>
        prevUserInfo.map((user) =>
          user.userNumber === message.userNumber ? { ...user, ready: message.isReady } : user
        )
      );
      return;
    }
    else if (message.type === 'JOIN') {
      messageElement.classList.add('event-message');
      message.content = message.sender + ' joined!';
      setUserInfo(message.userInfo);
    } else if (message.type === 'LEAVE') {
      messageElement.classList.add('event-message');
      message.content = message.sender + ' left!';
      setUserInfo(message.userInfo);
      if (message.captain !== null) { // 방장 정보가 들어왔다면 : 방장이 나감.
        setCaptain(message.captain);
        setUserInfo((prevUserInfo) =>
        prevUserInfo.map((user) =>
          user.userNumber === message.captain ? { ...user, ready: 1} : user
        )
      );
      }
    } else {
      messageElement.classList.add("chat-message");

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
  
  // 음악 변경 정보 전송

  const musicChange = () => {
    if (Sock.readyState === SockJS.OPEN &&  pickedMusic && musicName) { // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
      var changedMusic = { // 변경된 음악정보
        roomNumber: roomInfo.roomNumber,
        musicNumber: pickedMusic, // 음악 번호
        musicName: musicName  // 음악 이름
      };
      stompClient.send("/app/music.change", {}, JSON.stringify(changedMusic));
    }
    else {
      console.log("변경된 음악 정보 전달 실패.");
    }
  }

  // 레디 정보 전송
  const clickReady = (event) => {
    event.preventDefault();
    if (userNumber && roomNumber && stompClient) { // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
      var readyFlag = { // 레디신호 데이터
        roomNumber: roomNumber, // 방 번호
        userNumber: userNumber  // 유저 번호
      };
      stompClient.send("/app/ready.click", {}, JSON.stringify(readyFlag));
    }
    else {
      console.log("READY신호 전달 실패.");
    }
    event.preventDefault();
  }

  // 게임 스타트 정보 전송
  const clickStart = (event) => {
    event.preventDefault();

    const readyCount = userInfo.filter(user => user.ready === 1).length;
    if (readyCount === userInfo.length-1) {
      if (userNumber && roomNumber && stompClient) { // 로그인한 유저정보와 방 정보, 구독설정이 잘 되어 있다면.
        var startReq = { // 시작요청 데이터
          roomNumber: roomNumber, // 방 번호
          musicNumber: pickedMusic,  // 음악 번호
          musicName: musicName // 음악 이름
        };
        
        stompClient.send("/app/game.start", {}, JSON.stringify(startReq));
      }
      else {
        console.log("게임 시작 실패.");
      }
    } else {
      alert("아직 레디가 완료되지 않았습니다.");
    }
    event.preventDefault();
  }

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
      stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
      setMessages("");
    }
    event.preventDefault();
  };
  const handleStartChatting = () => {
    // localStorage에서 데이터 가져오기
    connect();
  };
  if (!roomInfo) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {/* 음악 리스트 민우짱 */}
      <div>
      <div className="container">
        <div
          className="carousel"
          style={{
            transform: `rotateY(${currdeg}deg)`,
            WebkitTransform: `rotateY(${currdeg}deg)`,
            MozTransform: `rotateY(${currdeg}deg)`,
            OTransform: `rotateY(${currdeg}deg)`,
          }}
        >
          <div className="item a"
          style={{
            backgroundImage: `url(${roomInfo.musics[0].thumbnail})`,
            width: '250px',
            backgroundSize: 'cover',
            }}
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={() => handleMouseLeave(0)}
          >
            {/* 선택된 곡이면 표시 */}
            {pickedMusic === roomInfo.musics[0].musicNumber &&
              <img className="pickedMusic" src="https://assets-v2.lottiefiles.com/a/27d1e422-117c-11ee-afb5-33b1d01a5c73/s3QDBfQGB4.png" alt="User Thumbnail" />
            }
            {/* 방장만 표시: 곡 선택 버튼 */}
            {captain === name && 
              <button className="pickbtn" onClick={() => chageMusicBtn(roomInfo.musics[0].musicNumber, roomInfo.musics[0].musicName)}>PLAY</button>
            }
            {showTooltip[0] && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  fontSize: '10px',
                  width: '230px',
                  height: '180px'
                }}
              >
                <div className="info-container">
                  <div className="music-name">{roomInfo.musics[0].musicName}</div>
                  <div className="music-details">
                    <div className="detail-item">Running Time: {roomInfo.musics[0].runningTime}</div>
                    <div className="detail-item">Singer: {roomInfo.musics[0].singer}</div>
                    <div className="detail-item">Level: {roomInfo.musics[0].level}</div>
                    <div className="detail-item">Play Count: {roomInfo.musics[0].playCnt}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="item b"
          style={{
            backgroundImage: `url(${roomInfo.musics[1].thumbnail})`,
            width: '250px',
            backgroundSize: 'cover',
            }}
            onMouseEnter={() => handleMouseEnter(1)}
            onMouseLeave={() => handleMouseLeave(1)}
          >
            {/* 선택된 곡이면 표시 */}
            {pickedMusic === roomInfo.musics[1].musicNumber &&
              <img className="pickedMusic" src="https://assets-v2.lottiefiles.com/a/27d1e422-117c-11ee-afb5-33b1d01a5c73/s3QDBfQGB4.png" alt="User Thumbnail" />
            }
            {/* 방장만 표시: 곡 선택 버튼 */}
            {captain === name && 
              <button className="pickbtn" onClick={() => chageMusicBtn(roomInfo.musics[1].musicNumber, roomInfo.musics[1].musicName)}>PLAY</button>
            }
            {showTooltip[1] && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  fontSize: '10px',
                  width: '230px',
                  height: '180px'
                }}
              >
                <div className="info-container">
                  <div className="music-name">{roomInfo.musics[1].musicName}</div>
                  <div className="music-details">
                    <div className="detail-item">Running Time: {roomInfo.musics[1].runningTime}</div>
                    <div className="detail-item">Singer: {roomInfo.musics[1].singer}</div>
                    <div className="detail-item">Level: {roomInfo.musics[1].level}</div>
                    <div className="detail-item">Play Count: {roomInfo.musics[1].playCnt}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="item c"
          style={{
            backgroundImage: `url(${roomInfo.musics[2].thumbnail})`,
            width: '250px',
            backgroundSize: 'cover',
            }}
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={() => handleMouseLeave(2)}
          >
            {/* 선택된 곡이면 표시 */}
            {pickedMusic === roomInfo.musics[2].musicNumber &&
              <img className="pickedMusic" src="https://assets-v2.lottiefiles.com/a/27d1e422-117c-11ee-afb5-33b1d01a5c73/s3QDBfQGB4.png" alt="User Thumbnail" />
            }
            {/* 방장만 표시: 곡 선택 버튼 */}
            {captain === name && 
              <button className="pickbtn" onClick={() => chageMusicBtn(roomInfo.musics[2].musicNumber, roomInfo.musics[2].musicName)}>PLAY</button>
            }
            {showTooltip[2] && (
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  borderRadius: '5px',
                  overflow: 'hidden',
                  fontSize: '10px',
                  width: '230px',
                  height: '180px'
                }}
              >
                <div className="info-container">
                  <div className="music-name">{roomInfo.musics[2].musicName}</div>
                  <div className="music-details">
                    <div className="detail-item">Running Time: {roomInfo.musics[2].runningTime}</div>
                    <div className="detail-item">Singer: {roomInfo.musics[2].singer}</div>
                    <div className="detail-item">Level: {roomInfo.musics[2].level}</div>
                    <div className="detail-item">Play Count: {roomInfo.musics[2].playCnt}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 가데이터 */}
          <div className="item d"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/AjWNrfzz6BqjRL5diZ-bPxFqGOsNk20xS6jcqoQWpNGWdch404mDWKVBkl4s9n74aLjXJWgldqm3Dc8=w544-h544-l90-rj")`,
            width: '250px',
            backgroundSize: 'cover',
            }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              borderRadius: '5px',
              overflow: 'hidden',
              height: '180px',
              display: 'list-item',
            }}>
              <div className="music-name">COMMING SOON</div>
            </div>
          </div>
          <div className="item e"style={{
            backgroundImage: `url("https://i1.sndcdn.com/artworks-IaaTwyICGFYMLY7A-lZhVQQ-t500x500.jpg")`,
            width: '250px',
            backgroundSize: 'cover',
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              borderRadius: '5px',
              overflow: 'hidden',
              height: '180px',
              display: 'list-item',
            }}>
              <div className="music-name">COMMING SOON</div>
            </div>
          </div>
          <div className="item f" style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/FzLKj6zFEJna0gRNDeZRH4nuQwEyN-YbCaC-bIGLoia6EhirHUachdvdEdR3VdB7pArgFCW8mtpLPL0=w544-h544-l90-rj")`,
            width: '250px',
            backgroundSize: 'cover',
          }}>
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              borderRadius: '5px',
              overflow: 'hidden',
              height: '180px',
              display: 'list-item',
            }}>
              <div className="music-name">COMMING SOON</div>
            </div>
          </div>
          
          </div>
        </div>
      </div>
        <div className="next" onClick={() => rotate('next')}>Next</div>
      <div className="prev" onClick={() => rotate('prev')}>Prev</div>

      <div className='showMusicName'>
        {musicName}
      </div>

      <div id="chat-page" className="hidden">
        <div className="chat-container">
          <div className="chat-header">
            <h2 id="roomN">CHATTINGS
            {/* {userInfo && userInfo.map((user, index) => (
              <div key={index}>
                <img src={user.profileImg} alt="프로필 이미지" />
                <br></br>
                <span>{user.nickname}</span>
              </div>
            ))} */}
            </h2>
          </div>
          <ul ref={messageAreaRef}></ul>
          <form id="messageForm" name="messageForm" onSubmit={handleSendMessage}>
            <div className="form-group">
              <div className="input-group clearfix">
                <input
                  type="text"
                  id="message"
                  placeholder="Type a message..."
                  autoComplete="off"
                  className="form-control"
                  value={messages}
                  onChange={handleMessageChange}
                />
                <button type="submit" className="primary">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 유저 리스트 민우짱 */}
        <div className='user-info'>
          <div className="user-item">
            <div className="nickname">참가자 : {userInfo.length} / {roomInfo.capacity}</div>
          </div>
          {userInfo && userInfo.map((user, index) => (
            <div className="user-item" style={{ 
                backgroundColor : user.nickname === captain ? '#f367d5' : userInfo[index].ready === 0 ? 'white' : '#8aeec6'
              }}>
              <img className="userImg" src="https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201608/04/htm_2016080484837486184.jpg" alt="User Thumbnail" />
              <div className="nickname">{user.nickname}</div>
              {captain === user.nickname && 
                <img className="captainlogo" src="https://cdn-icons-png.flaticon.com/512/679/679660.png" alt="Captain" />
              }
              {captain !== user.nickname && name === user.nickname &&
                <button class="button" onClick={clickReady}>ready</button>
              }
              {captain === user.nickname && name === user.nickname &&
                <button class="startbutton" onClick={clickStart}>start</button>
              }
            </div>

          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomItem;

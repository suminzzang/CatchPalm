// import './App.css'; // 필요한 경우 주석을 제거하고 사용하세요.
import React, { useEffect, useState } from 'react';
import style from "./App.module.css";
import { BrowserRouter as Router, Route, Routes,Link} from 'react-router-dom';
import Grid from '@mui/material/Grid';
import PlayingPage from './pages/PlayingPage';
import ChatRoomItem from "./pages/ChatRoomPage";
import ChatRoomList from "./components/ChatRoomComponents/ChatRoomList"; // chat 리스트방으로
import { Button, Drawer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Userinfo from './pages/Userinfo';
import Tutorial from './pages/Tutorial';
import RankingPage from './pages/RankingPage';
import ResultPage from './pages/ResultPage';
import axios from 'axios';
import APPLICATION_SERVER_URL from './ApiConfig';
import { useLocation } from 'react-router-dom';
import Swal from "sweetalert2"

//const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'https://i9c206.p.ssafy.io/api' ? '' : 'https://localhost:8443';
let CreatedroomNumber = ''; // 전역 변수로 선언
function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tokenValue = searchParams.get('token');

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

  if(tokenValue){
    localStorage.setItem('token', searchParams.get('token'));
    navigate("/");
  }

  // 메인 버튼
  const [isHovered, setIsHovered] = useState(false);


  ////////로그인 로그아웃 시작////////////////
  const isLoggedIn = !!localStorage.getItem('token'); 
  // const isLoggedIn = 1;  // 로그인 토큰 확인


    // 버튼 클릭 상태를 추적하는 useState 추가
    const [buttonClicked, setButtonClicked] = useState(false);  

    const handleCircleButtonClick = () => {
      setButtonClicked(true);
              // 효과음 재생
        const audioElement = document.getElementById("startSound");
        if (audioElement) {
            audioElement.play();
        }

    }
    //// 내 정보보기 시작
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
      setDrawerOpen(!drawerOpen);
    };

    // 드로어 내용을 결정할 useState 추가
    const [drawerContent, setDrawerContent] = useState(null);

    const openLoginDrawer = () => {
        setDrawerContent("login");
        handleDrawerOpen();
    };

    const openSignupDrawer = () => {
        setDrawerContent("signup");
        handleDrawerOpen();
    };


  //////// 회원정보 받아오기 시작/////////
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem('token');

  const [userNickname, setuserNickname] = useState(null);
  const [userNumber, setUserNumber] = useState(null);


  useEffect(() => {
    // 카메라 권한 요청
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        // 스트림 처리 코드 (예: 비디오 요소에 스트림 연결)
        console.log("Camera access granted");
        // 스트림 종료
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((error) => {
        console.error("Camera access denied:", error);
        Swal.fire({
          icon: "warning",
          title: "CatchPalm에는 웹캠이 필요해요!",
          // text: "방 제목을 입력 해주세요",
        });
      });
  }, []);


  useEffect(() => {
    // url에서 파싱해서 token 받아오기
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if token parameter is present in the URL
    let urlToken = urlParams.get('token');
    
    if (urlToken) {
      // 만약 주소 뒤에 token이러는게 있다면,
      localStorage.setItem('token', urlToken);
      navigate('/');
    } else {
      
      if(!token) return;  // 토큰이 없으면 요청하지 않습니다. >> 원래 하던 방식대로 로그인
  
      axios({
        method: 'get',
        url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // your access token here
        }
      })
      .then(response => {
        const rawUserId = response.data.userId;
        const cleanedUserId = rawUserId.replace('local:', ''); // 앞에 local: 지우기
        const userNumber = response.data.userNumber;
        const userNickname = response.data.userNickname;
        setuserNickname(userNickname);
        setUserNumber(userNumber);
        setUserId(cleanedUserId);
      })
      .catch(error => {
        const token = error.response.headers.authorization.slice(7);
        localStorage.setItem('token', token);
        axios({
          method: 'get',
          url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // your access token here
          }
        })
          .then(response => {
            const rawUserId = response.data.userId;
            const cleanedUserId = rawUserId.replace('local:', ''); // 앞에 local: 지우기
            const userNumber = response.data.userNumber;
            const userNickname = response.data.userNickname;
            setuserNickname(userNickname);
            setUserNumber(userNumber);  
            setUserId(cleanedUserId);
          })
          .catch(error => {
            console.log(error);
          })
      });
    }
  }, [token]);
  
  

///////회원정보 받아오기 끝////////////  

  
  const handleEnterChatRoom = (roomNumber) => {
    navigate(`/chat-rooms/${roomNumber}`);
  };
  const [mySettings, setMySettings] = useState();
  const [soundVolume, setSoundVolume] = useState(0.3); // 음악 사운드 사용자 설정 가져오기.

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
        setSoundVolume(response.data.backSound);
        setMySettings(response.data);
      })
      .catch((error) => {
        console.error("error");
        const errorToken = localStorage.getItem('token');
            if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
              // window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
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
            setSoundVolume(response.data.backSound);
            setMySettings(response.data);
          })
          .catch((error) => {
            console.log(error);
          });
      });
  }, [userNumber]);


  const handleTutorial = () => {
    var gameStartRes = { // 시작시 게임정보
      musicNumber: 0, // 음악 번호
      musicName: "Tutorial",  // 음악 이름
      nickname: userNickname,
      userNumber: userNumber,
      userInfo: [{}],
      isCam: 0,
      backSound: mySettings.backSound,
      effectSound: mySettings.effectSound,
      gameSound: mySettings.gameSound,
      synk: mySettings.synk
    };
    navigate('/tutorial', { state: { gameData: gameStartRes } });
}




  const [roomData, setRoomData] = useState({
    capacity: '',
    categoryNumber: '',
    password: '',
    title: '',
    userNumber: userNumber,
    roomNumber: ''
  });

  useEffect(() => {
      setRoomData({
        capacity: 1,
        categoryNumber: 2,
        password: '',
        title: userNickname,
        userNumber: userNumber,
        roomNumber: ''
      });
  }, [userNumber]);

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/create`, roomData);
      CreatedroomNumber = response.data.roomNumber;
      handleEnterChatRoom(CreatedroomNumber);
      
    } catch (error) {
      console.error('Error craating a new room:', error);
    }
  };

  return (
    <React.Fragment>
        {/* background_video에 클릭 상태에 따른 클래스 조건부 추가 */}
        <video 
          autoPlay muted loop 
          className={`${style.background_video} ${buttonClicked ? style.clicked : ""}`}
        >
          <source src="assets/background.mp4" type="video/mp4" />
        </video>

      <div className={style.mainword}>
        <h2 className={style.introduce} style={{textAlign:'center', color:'lime',fontSize:'3rem'}}>CatchPalm을 재밌게 즐기는 법!</h2><br></br>
        <p style={{color:'red', fontSize:'1.5rem', textAlign:'center'}}>* 멀티 플레이 시, 웹캠으로 본인의 얼굴이 공유됩니다! 주의해주세요 *</p>
        <p style={{color:'white', fontSize:'1.5rem'}}>1. F11키를 눌러서 전체화면으로 만들어주세요!</p>
        <p style={{color:'white', fontSize:'1.5rem'}}>2. 브라우저 배율은 100%, 디스플레이 설정을 1080p 125%에 맞춰주세요!</p>
        <p style={{color:'white', fontSize:'1.5rem'}}>3. 게임 중, 뒤로가기나 새로고침은 자제!</p>
      </div>
      {/* 메인버튼 */}
      <div>
    </div>
          {isLoggedIn ? (
            <React.Fragment>
            <div className={style.gamemode} container spacing={2}>
              
                <a className={style.a} onClick={handleTutorial}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  TUTORIAL
                </a>
                <a className={style.a} onClick={() => { handleCreateRoom(roomData);}}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  SOLO MODE
                </a>
                <a href="/ChatRoomList" className={style.a}>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  MULTI MODE
                </a>
                <a href="/ranking" className={style.a}>
                  
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  ranking
                </a>
              </div>
              <div className={`${style.userinfo}`}
                style={{
                  border: '0.2rem solid #fff', 
                  animation: 'pulsate 1.5s infinite alternate', 
                  boxShadow: '0 0 .2rem #fff,0 0 .2rem #fff, 0 0 2rem #bc13fe,0 0 0.8rem #bc13fe,0 0 2.8rem #bc13fe,inset 0 0 1.3rem #bc13fe' // 본인이면 빨간색 테두리 적용
                }}
              >
                  <img 
                      src="/assets/user_profile.png" 
                      alt="User Profile" 
                      onClick={handleDrawerOpen}
                      style={{ cursor: 'pointer' }}  // 이미지가 클릭 가능하다는 것을 나타내기 위한 스타일
                  />
              </div>
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerOpen} 
              sx={{
                "& .MuiDrawer-paper": {
                    width: '30%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',  
                }
              }}
              >
                <Userinfo />
              </Drawer>
              
            </React.Fragment>
          ) : (
            <React.Fragment>
            <div className={style.gamemode} container spacing={2}
            
            >
              <a href="#" className={style.a} onClick={openLoginDrawer}>              
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                LOGIN
              </a>
              <br/>
              <a href="#" className={style.a} onClick={openSignupDrawer}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                SIGN UP
              </a>
            </div>

              <div className={`${style.background_image} ${buttonClicked ? style.clicked : ""}`}></div>
              <audio id="startSound" src="/assets/Start.mp3" preload="auto"></audio>
              <button className={`${style.centeredCircleButton} ${buttonClicked ? style.clicked : ""}`} 
                onClick={handleCircleButtonClick}>
              </button>
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerOpen}  sx={{
                  "& .MuiDrawer-paper": {
                      width: '30%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    
                  }
                  
              }}>
                {drawerContent === "login" && <Login />}
                {drawerContent === "signup" && <SignUp />}
              </Drawer>
          </React.Fragment>
          )}
        
    </React.Fragment>
  );
}

function App() {
  
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/userinfo" element={<Userinfo />} />
          <Route path="/Playing" element={<PlayingPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/chatRoomList" element={<ChatRoomList onSelectChatRoom={undefined} />} />
          <Route path="/chat-rooms/:roomNumber" element={<ChatRoomItem />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
    </Router>
  );
}

export default App;

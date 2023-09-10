// import './App.css'; // 필요한 경우 주석을 제거하고 사용하세요.
import React, { useEffect, useState } from 'react';
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import PlayingPage from './pages/PlayingPage';
import ChatRoomItem from "./components/ChatRoomComponents/ChatRoomItem";
import ChatRoomList from "./components/ChatRoomComponents/ChatRoomList"; // chat 리스트방으로
import { Button, Drawer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Userinfo from './pages/Userinfo';
import RankingPage from './pages/RankingPage';
import axios from 'axios';


function MainPage() {
    
  const navigate = useNavigate();

  ////////로그인 로그아웃 시작////////////////
  const isLoggedIn = !!localStorage.getItem('token'); 
  // const isLoggedIn = 1;  // 로그인 토큰 확인


  const handleLogout = () => {
    localStorage.removeItem('token'); // 토큰 삭제
    window.location.reload(); // 페이지 갱신
  };
  const handleDeleteAccount = () => {
    // Confirmation before account deletion
    if (!window.confirm('정말로 회원 탈퇴를 진행하시겠습니까?')) {
      return; // If user cancels (clicks 'No'), stop the function
    }
    
    const token = localStorage.getItem('token');
    



    fetch('https://localhost:8443/api/v1/users/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // or however your server expects the token
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error during account deletion');
      }
    })
    .then(data => {
      // Handle successful deletion here, such as by logging out the user
      localStorage.removeItem('token');
      window.location.reload();
    })
    .catch(error => {
      // Handle any errors here
      console.error('Error:', error);
    });
  };
  
    //// 내 정보보기 시작
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerOpen = () => {
      setDrawerOpen(!drawerOpen);
    };

    /// 내정보 보기 끝


  const handleButtonClick3 = () => {
    navigate('/login');
  };
  
  const handleButtonClick4 = () => {
    navigate('/signup');
  };
  ////////////// 로그인 로그아웃 끝////////////////  


  //////// 회원정보 받아오기 시작/////////
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem('token');


  useEffect(() => {
    if(!token) return;  // 토큰이 없으면 요청하지 않습니다.
    axios({
      method: 'get',
      url: 'https://localhost:8443/api/v1/users/me',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // your access token here
      }
    })
      .then(response => {
        const rawUserId = response.data.userId;
        const cleanedUserId = rawUserId.replace('local:', ''); // 앞에 local: 지우기
        setUserId(cleanedUserId);
        localStorage.setItem('userData', JSON.stringify(response.data));
        console.log(response.data)
      })
      .catch(error => {
        const token = error.response.headers.authorization.slice(7);
        localStorage.setItem('token', token);
        axios({
          method: 'get',
          url: 'https://localhost:8443/api/v1/users/me',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // your access token here
          }
        })
          .then(response => {
            const rawUserId = response.data.userId;
            const cleanedUserId = rawUserId.replace('local:', ''); // 앞에 local: 지우기
            setUserId(cleanedUserId);
            localStorage.setItem('userData', JSON.stringify(response.data));
            console.log(response.data)
          })
          .catch(error => {
            console.log(error);
          })
      });
  }, [token]); // useEffect will run once when the component mounts
  

///////회원정보 받아오기 끝////////////  
  const handleButtonClick = () => {
    navigate('/Playing');
  };

  const handleButtonClick2 = () => {
    navigate('/ChatRoomList');
  };
  
  return (
    <React.Fragment>
      
      <video autoPlay muted loop className="background-video">
        <source src="assets/background.mp4" type="video/mp4" />
      </video>

      <Grid className="mainGrid" container spacing={2}>
        <Grid item xs={4} md={8} lg={8}>
        <a href="#">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Neon button
          </a>
          <a href="#">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Neon button
          </a>
          <a href="#">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Neon button
          </a>
          {isLoggedIn ? (
            <React.Fragment>
              <Button variant="contained" onClick={handleButtonClick}>
                Go to Sample Page
              </Button>
              <br />
              <br />
              
              <Button variant="contained" onClick={handleButtonClick2}>
                채팅방리스트로 가기
              </Button>
              <Button variant="contained" onClick={handleDrawerOpen}>
                내 정보 보기
              </Button>
              <Button variant="contained" onClick={handleLogout}>
                로그아웃
              </Button>
              <Button variant="contained" onClick={handleDeleteAccount}>
                회원 탈퇴
              </Button>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Button
                variant="contained"
                style={{
                  fontSize: '24px',
                  padding: '20px 40px',
                  borderRadius: '50%', // 테두리를 반원으로 만듦
                  width: '200px', // 버튼의 가로 크기를 조정해 원형으로 보이도록 함
                  height: '200px', // 버튼의 세로 크기를 조정해 원형으로 보이도록 함
                }}
                onClick={() => navigate('/ChatRoomList')}
              >
                CatchPalm
              </Button>
              </div>
              
    <h1>로그인 된 메인페이지</h1>

    
              
          <div className="white-text">
            <p>아이디: {userId}</p>
          </div>


              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerOpen}>
                <Userinfo />
              </Drawer>
              
            </React.Fragment>
          ) : (
          <React.Fragment>
            <Button variant="contained" onClick={handleButtonClick3}>
              로그인
            </Button> 
            <Button variant="contained" onClick={handleButtonClick4}>
              회원가입
            </Button>       
            
    <h1>로그인 X 메인페이지</h1>
    
          </React.Fragment>
          )}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

function App() {
  
  return (
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route path="/userinfo" element={<Userinfo />} />
          <Route path="/Playing" element={<PlayingPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/chatRoomList" element={<ChatRoomList onSelectChatRoom={undefined} />} />
          <Route path="/chat-rooms/:roomNumber" element={<ChatRoomItem />} />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
    </Router>
  );
}

export default App;
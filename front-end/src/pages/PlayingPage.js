import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PlayingPage.css';
import Grid from '@mui/material/Grid';
import HandModel from '../components/PlayingComponents/HandModel';
import OpenVidu from '../components/PlayingComponents/OpenVidu';
import APPLICATION_SERVER_URL from "../ApiConfig";
import axios from "axios";

function App() {
  const location = useLocation();
  const { gameData } = location.state; // 전달된 데이터 가져오기
  
  useEffect(()=>{
    const escapeRoom = async () => {
        const escapeInfo = {
          roomNumber: gameData.roomNumber,
          playCnt: gameData.playCnt,
          userNumber: gameData.userNumber,
        };
        try {
          const response = await axios.post(
            `${APPLICATION_SERVER_URL}/api/v1/gameRooms/escapeGame`,
            escapeInfo
          );
          const data = response.data;
        } catch (error) {
          console.error("Error escapeGame user:", error);
        }
      };
  
      const unloadListener = (event) => {
        escapeRoom();
        event.returnValue = '게임중입니다. 정말로 나가시겠습니까? 상당한 불이익이 닥칩니다.';
      };
  
      window.addEventListener('beforeunload', unloadListener);
  
      return () => {
        window.removeEventListener('beforeunload', unloadListener);
      };
  }, [])

  return (
<React.Fragment>
    {gameData.userInfo.length === 1 ? (
        <Grid className="mainGrid" container spacing={2} 
            style={{ backgroundColor: 'black', marginTop: 0, marginLeft: 0, position: 'relative' }}>
            <Grid item xs={12} style={{ padding: 0 }}>
                <HandModel gameData={gameData} />
            </Grid>
        </Grid>
    ) : (
        <Grid className="mainGrid" container spacing={2} 
            style={{ backgroundColor: 'black', marginTop: 0, marginLeft: 0, position: 'relative' }}>
            <Grid item xs={10} style={{ padding: 0 }}>
                <HandModel gameData={gameData} />
            </Grid>
            <Grid item xs={2} 
                style={{ padding: 0, position: 'absolute', top: 0, right: 0, height: '100vh', zIndex: 1}}>
                <OpenVidu gameData={gameData} />
            </Grid>
        </Grid>
    )}
</React.Fragment>

  );
}


export default App;

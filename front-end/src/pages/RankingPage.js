import React, {   } from 'react';
import Grid from '@mui/material/Grid';
import Ranking from '../components/RankingComponents/Ranking';
import style from './RankingPage.module.css';

// 페이지 넘어갈 때 필요
import { useNavigate   } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  // *** 결과창에 줘야되는 정보 (테스트용 정보만 넣어놓음! 이름 맞춰서 보내줘야함) ***
  // *******************************************************************************
  // const navigateToResult = () => {
  //   const gameRoomRes = {
  //     roomNumber : 1,
  //     userNumber: 1,
  //     roomTitle: "빠르게 한판ㄱㄱ",
  //     roomCapacity: 4,
  //     roomCategory: 2,
  //     playCnt:1,
  //   };

  //   navigate('/result', { state: { gameRoomRes: gameRoomRes } });
  // };


  return (
    <React.Fragment>
      <div className={style.rankingPageContainer}>
      <video autoPlay muted loop className={style.background_video}>
        <source src="/assets/background_ranking2.mp4" type="video/mp4"/>
      </video>
      <div className={style.overlay_div}> {/* 큰 사각형 div 추가 */}
      <Grid className={style.mainGrid}  container spacing={1}>
        <Grid>
            <Ranking ></Ranking>
        </Grid>
      </Grid>
      </div>
      <div>
          <a href='/' className={style.bottom_right}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Home</a>

          {/* *****결과창 화면을 위한 임시 버튼****** */}
          {/* <a onClick={navigateToResult}
            >
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Result
          </a> */}
          {/* *****결과창 화면을 위한 임시 버튼****** */}

        </div>
      </div>
    </React.Fragment>
  );
}

export default App;

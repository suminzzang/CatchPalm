import React, {   } from 'react';
import Grid from '@mui/material/Grid';
import Ranking from '../components/RankingComponents/Ranking';
import style from './RankingPage.module.css'
function App() {
  return (
    <React.Fragment>
      <div className={style.rankingPageContainer}>
      <video autoPlay muted loop className={style.background_video}>
        <source src="assets/background_ranking2.mp4" type="video/mp4" />
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
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;

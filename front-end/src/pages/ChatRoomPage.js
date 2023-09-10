import React, {   } from 'react';
import Grid from '@mui/material/Grid';
import ChatRoomItem from '../components/ChatRoomComponents/ChatRoomItem';
import style from './RankingPage.module.css'
function App() {
  return (
    <React.Fragment>
      <video autoPlay muted loop className={style.background_video}>
        <source src="/assets/gameRoomBackground.mp4" type="video/mp4" />
      </video>
      <Grid>
        <Grid>
            <ChatRoomItem ></ChatRoomItem>
        </Grid>
      </Grid>
      
    </React.Fragment>
  );
}

export default App;

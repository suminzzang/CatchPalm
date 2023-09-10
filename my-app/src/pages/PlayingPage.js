import React, {   } from 'react';
import './PlayingPage.css'
import Grid from '@mui/material/Grid';
import HandModel from '../components/PlayingComponents/HandModel';
import OpenVidu from '../components/PlayingComponents/OpenVidu';

function App() {
  return (
    <React.Fragment>
      <Grid className="mainGrid" container spacing={2} style={{ marginTop: 0, marginLeft: 0 }}>
        <Grid item style={{ padding: 0, position: 'relative' }}>
          <HandModel />
        </Grid>
        <Grid item style={{ padding: 0 }}>
          <OpenVidu />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default App;


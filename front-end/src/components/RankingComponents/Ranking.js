import React, { useEffect, useState } from 'react';
import axios from 'axios';
import style from './Ranking.module.css';
import APPLICATION_SERVER_URL from '../../ApiConfig';

function MyComponent() {

  const [rankList, setRankList] = useState([]);
  const [userRanking, setUserRanking] = useState(0);
  const [userRank,setUserRank] = useState();
  const [musicList,setMusicList] = useState([]);
  const [musicNumber,setMusicNumber] = useState(0);
  const [backSound,setBackSound] = useState(0);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [loading3, setLoading3] = useState(true);
  const defaultProfileImg = "/assets/basicprofile.jpg";

  const [userNumber, setUserNumber] = useState(''); // userNumber 상태로 추가
  const token = localStorage.getItem('token');

  const handlePlayAudio = (index) => {
    const audioElement = document.getElementById('audioPlayer');
    audioElement.src = `/music/${index}.mp3`;
    audioElement.volume = backSound;
    audioElement.play();

    // 필요한 경우 여기에서 setMusicNumber도 호출할 수 있습니다.
    setMusicNumber(index-1);
  };

  const getImageSrc = (img) => {
    if (img) {
      // Convert Base64 data to an image data URL
      const imgData = `data:image/jpeg;base64,${img}`;
      return imgData;
    }
    return null;
  };

  useEffect(()=>{
    axios.get(`${APPLICATION_SERVER_URL}/api/v1/game/music`)
      .then(response => {
        const data = response.data;
        setMusicList(data.musics);
        setLoading1(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
      })
      .catch(error => {
        // error handling
        console.error('Something went wrong', error);
        setLoading1(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
      });
  },[userNumber]); // empty dependency array means this effect runs once on mount

  useEffect(() => {
    // localStorage에서 데이터 가져오기
    const token = localStorage.getItem('token');
    axios({
      method: 'get',
      url: `${APPLICATION_SERVER_URL}/api/v1/users/me`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // your access token here
      }
    })
      .then(response => {
        const userNumber = response.data.userNumber;
        const backSound = response.data.backSound;
        setUserNumber(userNumber);
        setBackSound(backSound);
        setLoading2(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
      })
      .catch(error => {
        const errorToken = localStorage.getItem('token');
        if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
          window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
          return; // 함수 실행을 중단하고 반환합니다.
        }
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
            const userNumber = response.data.userNumber;
            const backSound = response.data.backSound;
            setUserNumber(userNumber);
            setBackSound(backSound);
            setLoading2(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
          })
          .catch(error => {
            console.log(error);
            setLoading2(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
          })
      });
  }, [token]);

  useEffect(() => {
    axios.get(`${APPLICATION_SERVER_URL}/api/v1/game/rank?musicNumber=${musicNumber+1}&userNumber=${userNumber}`)
      .then(response => {
        const data = response.data;
        setRankList(data.ranks);
        setUserRank(data.userRank);
        setUserRanking(data.userRanking);
        setLoading3(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
      })
      .catch(error => {
        // error handling
        console.error('Something went wrong', error);
        setLoading3(false); // 데이터를 가져오면 loading 상태를 false로 설정합니다.
      });
  }, [musicNumber,userNumber]); // empty dependency array means this effect runs once on mount

  if (loading1 || loading2 || loading3) {
    return <div>Loading...</div>;
  }


  return (
    <div className={style.flex_container}>
      <audio id="audioPlayer" src=""></audio>
      <div className={style.horizontal_container}>
        <div className={style.leaderboard_container}>
          <div className={style.leaderboard_text} >
            <span className={style.glow}>Leader</span><span className={style.blink}> Board</span>
          </div>
          <div className={`${style.flex_item} ${style.item1}`}>
            <table style={{ color: 'white', fontSize: '20px',textAlign:'left',paddingLeft:'3%'}}>
              <thead style={{color:'wheat',fontSize:'25px'}}>
                  <tr>
                      <th style={{paddingRight:'5%'}}>Music Name : Choice Music</th>
                      <th>Music Level</th>
                  </tr>
              </thead>
              <tbody>
                  {musicList && musicList.map((item, index) => 
                      <tr className={style.neon_tr} key={index} onClick={() => handlePlayAudio(index+1)}>
                          <td style={{padding:'3px'}}>{item.musicName}</td>
                          <td>{item.level}</td>
                      </tr>
                  )}
              </tbody>
            </table>
          </div>
          <div className={`${style.flex_item} ${style.item3} ${style.itemContainer}`}>
            <img src={musicList[musicNumber].thumbnail} alt="no-img" style={{width:'60%',verticalAlign: 'top',paddingLeft:'1%',paddingTop:'1%'}}></img>
            <div className={style.textContainer} style={{paddingLeft:'2%',paddingTop:'2%'}}>
              <span className={style.music_detail} style={{color:'lime', fontSize:'28px'}}>{musicList[musicNumber].musicName}</span><br></br><br></br>
              <span className={style.music_head}>Singer: </span>
              <span className={style.music_detail}>{musicList[musicNumber].singer}</span><br></br>
              <span className={style.music_head}>Level: </span>
              <span className={style.music_detail}>{musicList[musicNumber].level}</span><br></br>
              <span className={style.music_head}>Release Date: </span><br></br>
              <span className={style.music_detail}>{musicList[musicNumber].releaseDate}</span><br></br>
              <span className={style.music_head}>Running Time: </span><br></br>
              <span className={style.music_detail}>{musicList[musicNumber].runningTime.slice(3)}</span><br></br>
            </div>
          </div>
        </div>
        <div className={style.leaderboard2_container}>
          <div className={`${style.flex_item} ${style.item2}`}>
          <table style={{ color: 'white', fontSize: '20px',textAlign:'left',padding:'1%',justifyContent:'center',borderCollapse:'separate',width: '100%'}}>
              <thead style={{color:'wheat',fontSize:'25px'}}>
                  <tr >
                      <th style={{width:'10%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Ranking</th>
                      <th style={{width:'30%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Nickname</th>
                      <th style={{width:'20%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Score</th>
                      <th style={{width:'15%',paddingRight:'3%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Date</th>
                  </tr>
              </thead>
              <tbody>
                  {rankList && rankList.map((item, index) => 
                      <tr  key={index} className={index % 2 === 0 ? style.rowColor1 : style.rowColor2}>
                          <td style={{paddingLeft:'10px',color:'#ffd700',paddingTop:'5px',paddingBottom:'5px'}}>{index+1}</td>
                          <td style={{paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px',display: 'flex', alignItems: 'center'}}>
                          <img  src={getImageSrc(item.userDTO.profileImg) || defaultProfileImg} alt="Profile"  style={{ width: '4rem', height: '4rem', marginRight: '10px',borderRadius: '50%'}} />
                            {item.userDTO.nickname}
                          </td>
                          <td style={{paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>{item.score}</td>
                          <td style={{paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>{item.playDateTime.slice(0, 10)}</td>
                      </tr>
                  )}
              </tbody>
            </table>
          </div>
          <div className={`${style.flex_item} ${style.item4}`}>
          <div className={style.leaderboard_text} style={{color:'red',fontSize:'40px',fontStyle:'inherit'}}>
            <span className={style.glow}>My Ranking</span>
          </div>
          <table style={{ color: 'white', fontSize: '20px',textAlign:'left',padding:'1%',justifyContent:'center',borderCollapse:'separate',width: '100%'}}>
              <tbody>
              {userRanking> 0 ? (
                  <tr className={style.rowColor1}>
                    <td style={{color:'#ffd700',width:'13%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>{userRanking}</td>
                    <td style={{paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px',display: 'flex', alignItems: 'center'}}>
                      <img  src={getImageSrc(userRank.userDTO.profileImg) || defaultProfileImg} alt="Profile"  style={{ width: '4rem', height: '4rem', marginRight: '10px',borderRadius: '50%'}} />
                      {userRank.userDTO.nickname}
                    </td>
                    <td style={{width:'28%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>{userRank.score}</td>
                    <td style={{width:'20%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>{userRank.playDateTime.slice(0, 10)}</td>
                  </tr>
                ) : (
                <tr>
                  <td colSpan="4">No Records Found</td>
                </tr>
              )}
              </tbody>
            </table>
            <br></br>
            <br></br>
            <br></br>
            <ul>
                {musicList && musicList.map((item, index) => 
                  <li key={index} style={{color:`white`,fontSize:`20px`}}>
                    item2: {item.musicNumber}, music Name: {item.musicName}, music level: {item.level} music thumbnail: {item.thumbnail}
                  </li>
                )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyComponent;

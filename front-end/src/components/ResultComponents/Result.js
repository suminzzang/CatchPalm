import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import style from './Result.module.css';
import APPLICATION_SERVER_URL from '../../ApiConfig';

function MyComponent({gameRoomRes}) {

  const [backSound,setBackSound] = useState(0);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const defaultProfileImg = "/assets/basicprofile.jpg";

  const[roomNumber] = useState(gameRoomRes.roomNumber);
  const[roomTitle] = useState(gameRoomRes.roomTitle);
  const[roomCapacity] = useState(gameRoomRes.roomCapacity);
  const[roomCategory] = useState(gameRoomRes.roomCategory);
  const[playCnt] = useState(gameRoomRes.playCnt);
  const[resultList,setResultList] = useState([]);
  const musicRef = useRef(undefined);
  const[music, setMusic] = useState();

  const [userNumber, setUserNumber] = useState(''); // userNumber 상태로 추가
  const token = localStorage.getItem('token');

  const handlePlayAudio = (index) => {
    const audioElement = document.getElementById('audioPlayer');
    audioElement.src = `/music/${index}.mp3`;
    audioElement.volume = backSound;
    audioElement.play();
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
    axios.get(`${APPLICATION_SERVER_URL}/api/v1/game/result?playCnt=${playCnt}&roomNumber=${roomNumber}`)
      .then(response => {
        const data = response.data;
        setResultList(data.records);
        const music = data.records[0].musicDTO;
        setMusic(music);
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

  if (loading1 || loading2) {
    return <div>Loading...</div>;
  }

  if(music){

  
  return (
    <div className={style.flex_container}>
      <audio id="audioPlayer" src=""></audio>
      <div className={style.horizontal_container}>
        <div className={style.leaderboard_container}>
          <div className={style.leaderboard_text}>
            <span className={style.glow}>Game</span><span className={style.blink}> Result</span>
          </div>
          <div className={`${style.flex_item} ${style.item1}`} style={{paddingTop:'10px'}}>
            <span className={style.room_head}>Room Title: </span>
            <span className={style.room_detail}>{roomTitle}</span><br></br><br></br>
            <span className={style.room_head}>Music: </span>
            <span className={`${style.room_detail} ${style.neon_tr}`} onClick={() => handlePlayAudio(music.musicNumber)}>{music.musicName}</span><br></br><br></br>
            <span className={style.room_head}>Capacity: </span>
            <span className={style.room_detail}>{roomCapacity}</span><br></br><br></br>
            <span className={style.room_head}>Category: </span>
            <span className={style.room_detail}>
              {roomCategory === 1 ? '팀전' : roomCategory === 2 ? '개인전' : ''}  
            </span><br></br>
          </div>
          <div className={`${style.flex_item} ${style.item3} ${style.itemContainer}`}>
            <img src={music.thumbnail} alt="no-img" style={{width:'61%',verticalAlign: 'top',paddingLeft:'1%',paddingTop:'1%'}}></img>
            <div className={style.textContainer} style={{paddingLeft:'2%',paddingTop:'2%'}}>
              <span className={`${style.music_detail} ${style.neon_tr}`} style={{color:'lime', fontSize:'28px'}} onClick={() => handlePlayAudio(music.musicNumber)}>{music.musicName}</span><br></br><br></br>
              <span className={style.music_head}>Singer: </span>
              <span className={style.music_detail}>{music.singer}</span><br></br>
              <span className={style.music_head}>Level: </span>
              <span className={style.music_detail}>{music.level}</span><br></br>
              <span className={style.music_head}>Release Date: </span><br></br>
              <span className={style.music_detail}>{music.releaseDate}</span><br></br>
              <span className={style.music_head}>Running Time: </span><br></br>
              <span className={style.music_detail}>{music.runningTime.slice(3)}</span><br></br>
            </div>
          </div>
        </div>
        <div className={style.leaderboard2_container}>
          <div className={`${style.flex_item} ${style.item2}`} style={{paddingLeft:'1%'}}>
          <table style={{ color: 'white', fontSize: '20px',textAlign:'left',padding:'1%',justifyContent:'center',borderCollapse:'collapse'}}>
              <thead style={{color:'wheat',fontSize:'25px'}}>
                  <tr >
                      <th style={{width:'10%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Ranking</th>
                      <th style={{width:'25%',paddingLeft:'25px',paddingTop:'5px',paddingBottom:'5px'}}>Nickname</th>
                      <th style={{width:'20%',paddingLeft:'10px',paddingTop:'5px',paddingBottom:'5px'}}>Score</th>
                      
                  </tr>
              </thead>
              <tbody>
                <tr style={{ height: '7vh' }}></tr>
                {resultList && resultList.map((item, index) => {
                    const color = (index === 0) ? '#ffd700' : 'white'; // 색상 결정

                    return (
                        <tr key={index} className={index % 2 === 0 ? style.rowColor1 : style.rowColor2}
                            style={{
                              border: item.userDTO.userNumber === userNumber ? '0.2rem solid #fff' : null, // 본인이면 빨간색 테두리 적용
                              animation: item.userDTO.userNumber === userNumber ? 'pulsate 1.5s infinite alternate' : null, // 본인이면 빨간색 테두리 적용
                              boxShadow: item.userDTO.userNumber === userNumber ? '0 0 .2rem #fff,0 0 .2rem #fff, 0 0 2rem #bc13fe,0 0 0.8rem #bc13fe,0 0 2.8rem #bc13fe,inset 0 0 1.3rem #bc13fe' : null, // 본인이면 빨간색 테두리 적용
                            }}>
                            <td style={{paddingLeft:'15px', color: color, paddingTop:'5px', paddingBottom:'5px',fontSize:'35px'}}>{index+1}</td>
                            <td style={{paddingLeft:'15px', paddingTop:'5px', paddingBottom:'5px', display: 'flex', alignItems: 'center'}}>
                                <img  src={getImageSrc(item.userDTO.profileImg) || defaultProfileImg} alt="Profile"  style={{ width: '6rem', height: '6rem', marginRight: '10px',borderRadius: '50%',paddingRight:'0.5rem'}} />
                                {item.userDTO.nickname}
                            </td>
                            <td style={{paddingLeft:'15px', paddingTop:'5px', paddingBottom:'5px'}}>{item.score}</td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
}
export default MyComponent;
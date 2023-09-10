import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import style from './Tutorial.module.css';
import HandModel from '../components/PlayingComponents/HandModel';

function Tutorial() {
  
  const location = useLocation();
  const { gameData } = location.state; // 전달된 데이터 가져오기
  const navigate = useNavigate();

  // perfect, great, miss
  const [showWords, setShowWords] = useState(false);

  const timeline = [
    { start: 3, end: 8, text: "저희 CatchPalm은 화면에 나오는 히트마커에 맞춰 손모양을 인식해 점수를\n 올리는 게임입니다!" },
    { start: 12, end: 17, text: "먼저 화면과의 적당한 거리를\n 조절해주세요." },
    { start: 20, end: 25, text: "원이 줄어드는 박자에 맞춰 손을\n 마커에 가져다 대세요!" },
    { start: 35, end: 42, text: "다음은 손모양을 모양에 맞춰\n변경시켜주세요!" },
    { start: 65, end: 72, text: "박자에 따라 PERFECT, GREAT,\n MISS 가 구분됩니다", action: 'SHOW_WORDS' },
    { start: 75, end: 82, text: "화면 좌측 하단에서 캐치마크가\n 줄어드는 속도, 효과음, 배경음악의\n 음량을 조절할 수 있습니다!" },
    { start: 85, end: 92, text: "만약 박자가 너무 빠르거나 느리다면\n 점수를 잃을수도 있습니다" },
    { start: 95, end: 100, text: "왼쪽 상단의 점수에 집중하며\n 정확한 타이밍을 캐치하세요!" },
    { start: 128, end: 133, text: "튜토리얼 끝!" },
  ];

  const [currentTime, setCurrentTime] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const loadingElement = document.getElementById("loading");
    const buttonElement = buttonRef.current;
    if (!loadingElement) return;

    let interval;

    // 함수 정의: hidden 속성이 true로 변경되면 타이머 시작
    const startTimerIfHidden = () => {
      if (loadingElement.hidden) {
        buttonElement.style.visibility = 'visible';
        interval = setInterval(() => {
          setCurrentTime(prevTime => {
            const matchingEvent = timeline.find(event => event.start === prevTime);
            if (matchingEvent) {
              setCurrentText(matchingEvent.text);
    
              if (matchingEvent.action === 'SHOW_WORDS') {
                setShowWords(true);
              }
            }
    
            const endingEvent = timeline.find(event => event.end === prevTime);
            if (endingEvent) {
              setCurrentText('');
              
              if (endingEvent.action === 'SHOW_WORDS') {
                setShowWords(false);
              }
            }
            return prevTime + 1;
          });
        }, 1000);
      }
    };

    // 최초 실행 시 hidden 속성이 true인지 확인
    startTimerIfHidden();

    // MutationObserver를 사용하여 loading 요소의 속성 변경 감지
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
          startTimerIfHidden();
        }
      }
    });

    observer.observe(loadingElement, {
      attributes: true
    });

    // cleanup
    return () => {
      if (interval) clearInterval(interval);
      observer.disconnect();
    };
}, []);

let sendUserDataFromHandModel;

  const onExit = (callback) => {
    sendUserDataFromHandModel = callback;
  }

  const endTutorial = () => {
    if(sendUserDataFromHandModel) sendUserDataFromHandModel();
    navigate('/');
    window.location.reload();
  }

  return (
    <React.Fragment>
      <Grid className="mainGrid" container spacing={2} 
      style={{ backgroundColor: 'black', marginTop: 0, marginLeft: 0, position: 'relative' }}>
        <Grid item xs={12} style={{ padding: 0 }}>
        <HandModel gameData={gameData} onExit={onExit} />
        </Grid>
        <Grid item xs={12} className={style.background_tutorial}>
          {
            showWords && 
            (
              <div className={style.wordsWrapper}>
                <span className={style.PERFECT}>PERFECT<br/><br/>300</span>
                <span className={style.GREAT}>GREAT<br/><br/>150</span>
                <span className={style.MISS}>MISS<br/><br/>0</span>
              </div>
              )
            }
          <p style={{ 
            opacity: currentText ? 1 : 0, 
            transition: 'opacity 0.5s',
            fontFamily: 'Jua, sans-serif',
          }}>
            {currentText}
          </p>
          <button ref={buttonRef} className={style.exitButton} onClick={endTutorial}></button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Tutorial;

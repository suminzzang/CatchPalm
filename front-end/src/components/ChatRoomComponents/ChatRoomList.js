import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import style from './ChatRoomList.module.css'
// import { Padding } from '@mui/icons-material';
// import LockIcon from '@mui/icons-material/Lock';
// import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RefreshIcon from '@mui/icons-material/Refresh';
import Swal from "sweetalert2";
import APPLICATION_SERVER_URL from '../../ApiConfig';

let CreatedroomNumber = ''; // 전역 변수로 선언

const Modal = ({ isOpen, onClose, onCreateRoom }) => {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  
  const [showCapacityOptions, setShowCapacityOptions] = useState(false); // 방 정원 부분

  const handleTogglePasswordInput = () => {
    setShowPasswordInput(!showPasswordInput);
  };

  const handleCapacityOptionClick = (option) => {
    setRoomData((prevData) => ({
      ...prevData,
      capacity: option,
    }));
    setShowCapacityOptions(false);
  };
  const [userNumber, setUserNumber] = useState(''); // userNumber 상태로 추가
  const token = localStorage.getItem('token');
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
        setUserNumber(userNumber);
      })
      .catch(error => {
        const errorToken = localStorage.getItem('token');
        if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
          window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
          return; // 함수 실행을 중단하고 반환합니다.
        }
        console.error("error");
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
            setUserNumber(userNumber);
          })
          .catch(error => {
            console.log(error);
          })
      });
  }, [token]);

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
  
  const [roomData, setRoomData] = useState({
    capacity: '',
    categoryNumber: '',
    password: '',
    title: '',
    userNumber: userNumber,
    roomNumber: ''
  });

  useEffect(() => {
    if (isOpen) {
      setRoomData({
        capacity: '',
        categoryNumber: '',
        password: '',
        title: '',
        userNumber: userNumber,
        roomNumber: ''
      });
    }
  }, [isOpen, userNumber]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomData((prevData) => ({
      ...prevData,
      [name]: value,
      userNumber: userNumber // 기존 데이터에서 userNumber를 그대로 사용
    }));
  };

  const handleCreateRoom = () => {
    if (!roomData.title) {
      Swal.fire({
        icon: "warning",
        title: "방 제목을 입력 해주세요",
        // text: "방 제목을 입력 해주세요",
      });
      return;
    }

    else if (!roomData.categoryNumber) {
      Swal.fire({
        icon: "warning",
        title: "게임 유형을 선택 해주세요",
        // text: "방 제목을 입력 해주세요",
      });
      return;
    }

    else if (!roomData.capacity) {
      Swal.fire({
        icon: "warning",
        title: "방 정원을 입력해주세요",
        // text: "방 제목을 입력 해주세요",
      });
      return;
    }
    onCreateRoom(roomData);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const handleChangeCategory = (categoryNumber) => {
    setRoomData((prevData) => ({
      ...prevData,
      categoryNumber: categoryNumber,
    }));
  };
  
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={style.modal}>
      <div className={style.modal_content}>
        <h2>방 만들기</h2>
        <div>
          <label>제목</label>
          <input className={style.neon_button_input} style={{width:'90%'}} type="text" name="title" value={roomData.title} onChange={handleChange} />
        </div>
        <div>
          <label>게임 유형</label>
            <button onClick={() => handleChangeCategory(2)} className={`${
              roomData.categoryNumber === 2 ? 'active ' : ''
            }${style.neon_button}`}
            >
              개인전
            </button>
            <button
              onClick={() => {
                Swal.fire({
                  icon: "warning",
                  title: "서비스 준비 중입니다.",
                  // text: "방 제목을 입력 해주세요",
                }); // 원하는 메시지로 수정
              }}
              className={style.neon_button}
            >
              팀전
            </button>
        </div>
        <div>
          <label style={{marginTop:'5%'}}>
            비밀번호
            <input
              className={style.neon_button_input}
              type="checkbox"
              checked={showPasswordInput}
              onChange={handleTogglePasswordInput}
            />
          </label>
          {showPasswordInput && (
            <input
              className={style.neon_button_input}
              type="text"
              name="password"
              value={roomData.password}
              onChange={handleChange}
            />
          )}
        </div>
        <div style={{marginTop: '4%', width:'15%', display:'flex', alignItems:'baseline'}} >
          <label>Capacity</label>
          {roomData.categoryNumber === 2 ? (
            <>
              <input
                className={style.neon_button_input}
                style={{width:'35px', height: '15px', textAlign: 'center', display: 'block', marginLeft: '39%'}}
                type="text"
                name="capacity"
                value={roomData.capacity}
                onChange={handleChange}
                onFocus={() => setShowCapacityOptions(true)}
                readOnly // 입력요소 쓰는거 방지
              />
            </>
          ) : (
            <input 
              style={{width:'35px', height: '15px', textAlign: 'center', display: 'block', marginLeft: '39%'}} 
              className={style.neon_button_input} 
              type="number" 
              name="capacity" 
              disabled />
          )}
        </div>
        {showCapacityOptions && (
                  <div style={{display:'flex', marginBottom:'10%'}}>
                    <button className={style.neon_button} onClick={() => handleCapacityOptionClick(1)}>1명</button>
                    <button className={style.neon_button} onClick={() => handleCapacityOptionClick(2)}>2명</button>
                    <button className={style.neon_button} onClick={() => handleCapacityOptionClick(3)}>3명</button>
                    <button className={style.neon_button} onClick={() => handleCapacityOptionClick(4)}>4명</button>
                  </div>
              )}
        <button 
        onClick={() => { handleCreateRoom();}}
        className={style.neon_button}>확인</button>
        <button className={style.neon_button} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

const ChatRoomList = ({}) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  // 비밀번호 관련
  const [inputPassword, setInputPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  useEffect(() => {
    
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/listRooms`);
        const data = response.data;
        setChatRooms(data);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      }
    };
    fetchChatRooms();
  }, []);

  const handleEnterChatRoom = (roomNumber) => {
    navigate(`/chat-rooms/${roomNumber}`);
  };

  const checkEnterChatRoom = async (roomNumber, password) => {
    var reqPassword = "";
    if (password) {
      reqPassword = inputPassword;
    }

    const enterData = { "roomNumber": roomNumber, "password": reqPassword };

    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/authentication`, enterData);
  
      const resultMessage = response.data.message;
  
      if (response.data.message == "입장성공") {
        handleEnterChatRoom(roomNumber);
      }
      else {
        Swal.fire({
          icon: "warning",
          title: resultMessage,
          // text: "방 제목을 입력 해주세요",
        });
        setInputPassword(''); // 비밀번호 입력 필드 값 초기화
      }
    } catch (error) {
      console.error('Error authentication', error);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/create`, roomData);
      CreatedroomNumber = response.data.roomNumber;
      handleEnterChatRoom(CreatedroomNumber);
      
    } catch (error) {
      console.error('Error craating a new room:', error);
    }
  };
  
  const closeModal = () => {
    setShowPasswordInput(!showPasswordInput);
    setInputPassword(''); // 비밀번호 입력 필드 값 초기화
  };

  // 비밀번호 입력창 보이기/숨기기 함수
  const togglePasswordInput = (e) => {

    if (e.target.tagName === 'INPUT') {
      return;
    }
    // 모달 컨텐츠 내부 요소를 클릭한 경우에는 모달이 사라지지 않도록 처리
    if (e.target.closest('.modal-content')) {
      return;
    }
    setShowPasswordInput(!showPasswordInput);
  };
  
  // 비밀번호가 입력되면 실행되는 함수
  const handlePasswordInput = (event) => {
    setInputPassword(event.target.value);
  };
  
  const handleRefresh = () => {
    document.activeElement.blur();
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/listRooms`);
        const data = response.data;
        setChatRooms(data);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      }
    };
    fetchChatRooms();
  };
  // 검색부분 함수 및 변수
  const [filteredChatRooms, setFilteredChatRooms] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const handleSearchInputChange = (event) => {
    setSearchKeyword(event.target.value);
  };

  useEffect(() => {
    const filterChatRooms = () => {
      const filteredRooms = chatRooms.filter(room =>
        room.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredChatRooms(filteredRooms);
    };
  
    filterChatRooms();
  }, [chatRooms, searchKeyword]);

  return (
    <div style={{display:'flex', justifyContent:'center'}}>
      
    <div className={style.main_div}>
      <video autoPlay muted loop className={style.background_videoChatList}>
        <source src="assets/background_ChatList.mp4" type="video/mp4"/>
      </video>
      <div className={style.background_div}>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onCreateRoom={handleCreateRoom} />
      <div
      style={{
      // justifyContent: 'flex-end',
      marginRight: '15%',
      marginTop: '8%',}}>
        
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom:'1%'}}>
        <div style={{display: 'flex', alignItems:'center', marginLeft: '8%', marginTop: '2%'}}>
        <button onClick={handleRefresh} className={style.neon_button}>
        <RefreshIcon/>
          </button>
        </div>
        <div style={{display: 'flex'}}>
        <div className={style.neon_button} style={{marginLeft:'10%',marginTop:'10%', height:'50%'}}>
            <input style={{height:'100%', backgroundColor:'rgba(0, 0, 0, 0.2)', border: 'none', marginTop:'1%', fontFamily: 'Jua, sans-serif', fontSize: '16px', color: 'white'}}
            type="text"
            name="search"
            placeholder="방 제목을 검색해주세요"
            value={searchKeyword}
            onChange={handleSearchInputChange}
            >
            
            </input>
        </div>
        
        {/* <button style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'white'}} onClick={handleOpenModal}>방만들기</button> */}
        <div onClick={handleOpenModal} style={{marginLeft: '20%', marginTop: '10%'}}> 
          <button className={style.neon_button}>
            방 만들기
          </button>
        </div>
        </div>
        
      </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        // marginTop: '15%',
      }}>
      <div className={style.inside_div} style={{width:'90%'}}>
        {filteredChatRooms.map((room) => (
          <button
            className={style.button_chatRoomList}
            onClick={room.password
              ? togglePasswordInput
              : () => {
                    checkEnterChatRoom(room.roomNumber, room.password, room.status);
                }}
            key={room.id}
            style={{
              backgroundColor: room.status === 1 ? 'rgba(205, 153, 235, 0.84)' : '#f367ce',
            }}
          >
            {/* Display the "Waiting" or "Playing" text on the right */}
            <div>
              {room.status === 0 ? <p style={{color: 'white'}}>Waiting</p> : <p style={{color: 'white'}}>Playing</p>}
            </div>
            <div>
              <div className={style.ChatRoomList_minibackground}>
              <p style={{ marginLeft: '20%', color: 'white',}}>{room.roomNumber}.{' '}{room.title}[{room.typeName}]</p>
              <p style={{color: 'white'}}>{room.password && <VpnKeyIcon />}</p>
              </div>
              <p style={{color: 'white'}}>방장:{room.nickname}</p>
              <p style={{color: 'white'}}>현재원/정원 {room.cntUser}/{room.capacity}</p>
            </div>
            {/* Display the thumbnail image on the left */}
            <img src={room.thumbnail} style={{ maxWidth: '90px', maxHeight: '90px', borderRadius: '10px', }} />
            {room.password && (
              <>
                {showPasswordInput && (
                  <div className={style.modal_content_password}>
                    <label>비밀번호:</label>
                    {' '}
                    <input
                      type="password"
                      value={inputPassword}
                      onChange={handlePasswordInput}
                      style={{marginLeft:'1%',borderRadius:'10px'}}
                      className={style.neon_button_input}
                    />
                    <div style={{marginTop:'5%', marginLeft:'20%'}}>
                    <button
                      className={style.neon_button}
                      onClick={() => checkEnterChatRoom(room.roomNumber, room.password)}
                      style={{ cursor: 'pointer' }}
                    >
                      입장
                    </button>
                    <button 
                    onClick={closeModal} 
                    style={{ cursor: 'pointer' , marginLeft:'5%'}}
                    className={style.neon_button}>
                      닫기
                    </button>
                    </div>
                    
                  </div>
                )}
              </>
            )}
          </button>
        ))}
      </div>
      </div>   
      <div>
        <div style={{display:'flex', justifyContent: 'center', marginTop: '1%', fontFamily: 'Jua, sans-serif', fontSize: '20px'}}>
          <div>
          </div>
        <a href='/' onClick={(e) => {
            if (isModalOpen) {
              e.preventDefault();
            }
          }}
          style={{ position: 'relative', zIndex: isModalOpen ? -1 : 'auto' }}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            Home</a>
        </div>
      </div>   
    </div>
    </div>
  </div>
  );
};

export default ChatRoomList;

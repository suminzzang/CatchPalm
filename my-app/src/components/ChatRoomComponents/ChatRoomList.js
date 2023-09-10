import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./ChatRoomList.css";

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
      url: 'https://localhost:8443/api/v1/users/me',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // your access token here
      }
    })
      .then(response => {
        const userNumber = response.data.userNumber;
        setUserNumber(userNumber);
        console.log(userNumber);
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
          url: 'https://localhost:8443/api/v1/users/me',
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
  

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>방만들기 창</h2>
        <div>
          <label>제목</label>
          <input type="text" name="title" value={roomData.title} onChange={handleChange} />
        </div>
        <div>
          <label>게임 유형</label>
            <button onClick={() => handleChangeCategory(2)} className={roomData.categoryNumber === 2 ? 'active' : ''}
            style={{
              backgroundColor: roomData.categoryNumber === 2 ? 'blue' : 'transparent',
              color: roomData.categoryNumber === 2 ? 'white' : 'blue',
              border: '1px solid blue' 
            }}>
              개인전
            </button>
            <button onClick={() => handleChangeCategory(1)} className={roomData.categoryNumber === 1 ? 'active' : ''}
            style={{
              backgroundColor: roomData.categoryNumber === 1 ? 'green' : 'transparent',
              color: roomData.categoryNumber === 1 ? 'white' : 'green',
              border: '1px solid green' 
            }}>
              팀전
            </button>
        </div>
        <div>
          <label>
            비밀번호
            <input
              type="checkbox"
              checked={showPasswordInput}
              onChange={handleTogglePasswordInput}
            />
          </label>
          {showPasswordInput && (
            <input
              type="text"
              name="password"
              value={roomData.password}
              onChange={handleChange}
            />
          )}
        </div>
        <div>
          <label>capacity</label>
          {roomData.categoryNumber === 2 ? (
            <div>
              <input
                type="text"
                name="capacity"
                value={roomData.capacity}
                onChange={handleChange}
                onFocus={() => setShowCapacityOptions(true)}
                readOnly // 입력요소 쓰는거 방지
              />
              {showCapacityOptions && (
                <ul className="capacity-options">
                  <li onClick={() => handleCapacityOptionClick(1)}>1</li>
                  <li onClick={() => handleCapacityOptionClick(2)}>2</li>
                  <li onClick={() => handleCapacityOptionClick(3)}>3</li>
                  <li onClick={() => handleCapacityOptionClick(4)}>4</li>
                </ul>
              )}
            </div>
          ) : (
            <input type="number" name="capacity" value={4} disabled />
          )}
          </div>
        <button onClick={() => { handleCreateRoom();}}>확인</button>
        <button onClick={onClose}>닫기</button>
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
        const response = await axios.get('https://localhost:8443/api/v1/gameRooms/listRooms');
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
      const response = await axios.post('https://localhost:8443/api/v1/gameRooms/authentication', enterData);
  
      const resultMessage = response.data.message;
  
      if (response.data.message == "입장성공") {
        handleEnterChatRoom(roomNumber);
      }
      else {
        alert(resultMessage);
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
      const response = await axios.post('https://localhost:8443/api/v1/gameRooms/create', roomData);
      CreatedroomNumber = response.data.roomNumber;
      handleEnterChatRoom(CreatedroomNumber);
    } catch (error) {
      console.error('Error craating a new room:', error);
    }
  };

  // 비밀번호 입력창 보이기/숨기기 함수
  const togglePasswordInput = () => {
    setShowPasswordInput(!showPasswordInput);
  };
  
  // 비밀번호가 입력되면 실행되는 함수
  const handlePasswordInput = (event) => {
    setInputPassword(event.target.value);
  };
  
  
  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} onCreateRoom={handleCreateRoom} />
      <div>
        <button onClick={handleOpenModal}>방만들기</button>
        <hr></hr>
      </div>
      {chatRooms.map((room) => (
        
        <div key={room.id}>
          {/* 비밀번호 있을때 버튼 */}
          {room.password  && (
            <button onClick={togglePasswordInput}>비밀번호 입력</button>
          )}
          {/* 비밀번호 입력창 */}
          {showPasswordInput && (
            <div>
              <label>비밀번호 입력:</label>
              <input
                type="password"
                value={inputPassword}
                onChange={handlePasswordInput}
              />
              <button onClick={() => checkEnterChatRoom(room.roomNumber, room.password)} style={{ cursor: 'pointer' }}>입장하기</button>
            </div>
          )}
          {/* 비밀번호 없을때 버튼 */}
          {!room.password  && (
            <button onClick={() => checkEnterChatRoom(room.roomNumber, room.password)} style={{ cursor: 'pointer' }}>입장하기</button>
          )}
          
        {/* <InputPassword isOpen={passwordModalOpen} onClose={closePasswordModal} /> */}
          <p>방제목: {room.title}</p>
          <p>{room.typeName}</p>
          <p>방장: {room.nickname}</p>
          <p>현재원/정원 {room.cntUser}/{room.capacity}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ChatRoomList;
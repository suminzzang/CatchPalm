import React, { useState, useEffect, useRef } from 'react';
import './ChatRoomItem.css'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import { allResolved } from 'q';
import APPLICATION_SERVER_URL from '../ApiConfig';

let name = '';
let userNumber = ''; // userNumber 전역변수로 

var stompClient =null;
var colors = [
  '#2196F3', '#32c787', '#00BCD4', '#ff5652',
  '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

const ChatRoomItem = () => {
  useEffect(() => {
    // localStorage에서 데이터 가져오기
    const storedData = localStorage.getItem('userData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      name = parsedData.userNickname;
      userNumber = parsedData.userNumber;
    }
  }, []);

  const messageAreaRef = useRef(null);
  const { roomNumber } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);

  
  const [messages, setMessages] = useState(''); // 보내는 메세지
  // const [messageText, setMessageText] = useState(''); // 받는 메세지
  const [isVisible, setIsVisible] = useState(false); 

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleMessageChange = (event) => {
    setMessages(event.target.value);
  };

  useEffect(() => {
    handleStartChatting()
    const fetchRoomInfo = async () => {
      try {
        const response = await axios.get(`${APPLICATION_SERVER_URL}/api/v1/gameRooms/getGameRoomInfo/${roomNumber}`);
        const data = response.data;
        setRoomInfo(data);
      } catch (error) {
        console.error('Error fetching room info:', error);
      }
    };
    fetchRoomInfo();
  }, [roomNumber]);
  
  // 소켓연결---------------------------------
  // 소켓연결 끊길때: 컴포넌트 변경돨 때 수행 소스 -> 웹소켓 연결 끈기.
  useEffect(() => {
    return () => {
      stompClient.disconnect();
    };
  },[]);
  const connect =()=>{
    let Sock = new SockJS(`${APPLICATION_SERVER_URL}/ws`);
    stompClient = over(Sock);
    stompClient.connect({},onConnected, onError);
  }
  // 연결 됬다면 구독 매핑 및 연결 유저 정보 전송
  const onConnected = () => {
    stompClient.subscribe(`/topic/chat/${roomNumber}`, onMessageReceived);
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: name, type: 'JOIN', userNumber: userNumber, roomNumber: roomNumber})
    )
    handleToggleVisibility();
  }
  // 연결이 안된경우
  const onError = (err) => {
    console.log(err);
  }

  // 서버에서 메세지 수신R

  const onMessageReceived = (payload) => {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');
    
    if (message.type === 'JOIN') {
      messageElement.classList.add('event-message');
      message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
      messageElement.classList.add('event-message');
      message.content = message.sender + ' left!';
    } else {
      messageElement.classList.add('chat-message');

      var avatarElement = document.createElement('i');
      var avatarText = document.createTextNode(message.sender[0]);
      avatarElement.appendChild(avatarText);
      avatarElement.style.backgroundColor = getAvatarColor(message.sender);

      messageElement.appendChild(avatarElement);

      var usernameElement = document.createElement('span');
      var usernameText = document.createTextNode(message.sender);
      usernameElement.appendChild(usernameText);
      messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageAreaRef.current.appendChild(messageElement);
    messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
  };

  const getAvatarColor = (messageSender) => {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    // Implement the logic to send a message using WebSocket
    // You may need to add the WebSocket logic here to send messages.
    if(messages && stompClient) {
      var chatMessage = {
          sender: name,
          content: messages,
          userNum: userNumber,
          type: 'CHAT',
          roomNumber: roomNumber
      };
      stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
      setMessages('');
  }
  event.preventDefault();
  };
  const handleStartChatting=()=>{
    connect();
  }
  if (!roomInfo) {
    return <div>Loading...</div>;
  }
  
  
  return (
    <div>
      <h1>채팅 애플리케이션</h1>
      {/* <WebSocket
        roomNumber={roomNumber}
        username="john_doe" // 적절한 사용자 이름으로 설정해주세요.
        userNumber={456} // 적절한 사용자 번호로 설정해주세요.
      /> */}
      <div>
        <h3>{roomInfo.title}</h3>
        <p>방장: {roomInfo.nickname}</p>
        <p>현재원/정원: {roomInfo.cntUser}/{roomInfo.capacity}</p>
        <p>개인전/팀전: {roomInfo.typeName}</p>
        <p>{roomNumber}</p>
        {/* 기타 방 정보 표시 */}
      </div>
      <div id="chat-page" className="hidden">
        <div className="chat-container">
          <div className="chat-header">
            <h2 id="roomN">Spring WebSocket Chat Demo - By 민우짱</h2>
          </div>
          <ul ref={messageAreaRef}></ul>
          <form id="messageForm" name="messageForm" onSubmit={handleSendMessage}>
            <div className="form-group">
              <div className="input-group clearfix">
                <input
                  type="text"
                  id="message"
                  placeholder="Type a message..."
                  autoComplete="off"
                  className="form-control"
                  value={messages}
                  onChange={handleMessageChange}
                />
                <button type="submit" className="primary">
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div> 
    </div>

    
  );
};

export default ChatRoomItem;
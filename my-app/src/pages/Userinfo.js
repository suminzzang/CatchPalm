import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Userinfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const defaultProfileImg = "/assets/basicprofile.jpg";

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            
            const response = await axios.get('https://localhost:8443/api/v1/users/me', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                setUserInfo(response.data);
            }
        };

        fetchData();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const base64String = await blobToBase64(file);

        const token = localStorage.getItem('token');
        await axios.patch('https://localhost:8443/api/v1/users/modify', {
            profileImg: base64String
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const response = await axios.get('https://localhost:8443/api/v1/users/me', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            setUserInfo(response.data);
        }
    };

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handlePasswordChange = async () => {
        const newPassword = prompt('Enter new password:');
        
        if (newPassword) {
            const token = localStorage.getItem('token');
            
            const response = await axios.patch('https://localhost:8443/api/v1/users/modify', {
                age: "",
                password: newPassword,
                profileImg: "",
                profileMusic: "",
                sex: "",
                synk: "",
                nickname: ""
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                setUserInfo(prevState => ({ ...prevState, userPassword: newPassword }));
                alert('비밀번호가 변경되었습니다!');
            }
        }
    }

    const handleNicknameChange = async () => {
        const newNickname = prompt('Enter new nickname:');
        
        if (newNickname) {
            const token = localStorage.getItem('token');

            const duplicationResponse = await axios.get('https://localhost:8443/api/v1/users/duplicated', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    nickname: newNickname
                }
            });
    
            if (duplicationResponse.data.duplicated) {
                alert('이미 사용중인 닉네임입니다');
                return;
            }

            const response = await axios.patch('https://localhost:8443/api/v1/users/modify', {
                age: "",
                password: "",
                profileImg: "",
                profileMusic: "",
                sex: "",
                synk: "",
                nickname: newNickname
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.status === 200) {
                setUserInfo(prevState => ({ ...prevState, userNickname: newNickname }));
                alert('닉네임이 변경되었습니다!');
            }
        }
    }

    const handleProfileImageClick = () => {
        hiddenFileInput.current.click();
    };

    const hiddenFileInput = useRef(null);

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>유저 정보</h1>
            <img src={userInfo.profileImg || defaultProfileImg} alt="Profile" />
            <button onClick={handleProfileImageClick}>
                프로필 사진 변경하기
            </button>
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
            <p>User Number: {userInfo.userNumber}</p>
            <p>User ID: {userInfo.userId}</p>
            <p>
                User Nickname: {userInfo.userNickname} 
                <button onClick={handleNicknameChange}>닉네임 변경하기</button>
            </p>
            <p>Age: {userInfo.age}</p>
            <p>Sex: {userInfo.sex === 0 ? 'Male' : 'Female'}</p>
            <button onClick={handlePasswordChange}>비밀번호 변경하기</button>
        </div>
    );
}

export default Userinfo;

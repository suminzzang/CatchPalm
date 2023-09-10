import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
//  이미 style은 선언되어서 styles로 씀
import styles from './Userinfo.module.css';
import APPLICATION_SERVER_URL from '../ApiConfig';
import { useNavigate } from 'react-router-dom';
import { textAlign } from '@mui/system';

const Userinfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const defaultProfileImg = "/assets/basicprofile.jpg";
    const [profileImg, setProfileImg] = useState(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token'); // 토큰 삭제
        navigate('/');
    };

    const [isEditing, setIsEditing] = useState(true);
    const [editedEmail, setEditedEmail] = useState("");
    const [editedNickname, setEditedNickname] = useState("");
    const [editedSex, setEditedSex] = useState("");
    const [editedAge, setEditedAge] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    const handleEditClick = () => {
        setIsEditing(false);
        setEditedEmail(userInfo.userId); // or whatever the initial value should be
        setEditedNickname(userInfo.userNickname);
        setEditedSex(userInfo.sex);
        setEditedAge(userInfo.age);
    };

    useEffect(() => {
        // 예외처리: 로그인 안된 경우
        if (!token) {
            alert('로그인 후 이용해 주세요.');
            navigate('/');
            return;
        }    
        const fetchData = async () => {            
            const response = await axios.get(`${APPLICATION_SERVER_URL}/api/v1/users/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                setUserInfo(response.data);
                setProfileImg(response.data.profileImg);
                })
                .catch(error => {
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
                    setUserInfo(response.data);
                    setProfileImg(response.data.profileImg);
                })
                .catch(error => {
                console.log(error);
                })
                });
        };
        fetchData();
    }, [token]);
    // 이미지 업로드
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const base64String = await blobToBase64(file);
        const token = localStorage.getItem('token');
        await axios.patch(`${APPLICATION_SERVER_URL}/api/v1/users/modify`, {
            profileImg: base64String,
            age: "",
            backSound: "",
            effectSound: "",
            gameSound: "",
            password: "",
            isCam: "",
            profileMusic: "",
            sex: "",
            synk: "",
            nickname: "",
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
            
        const response = await axios.get(`${APPLICATION_SERVER_URL}/api/v1/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            setUserInfo(response.data);
            setProfileImg(response.data.profileImg);
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
    //이미지 불러와서 디코딩
    const getImageSrc = () => {
        if (profileImg) {
            // Convert Base64 data to an image data URL
            return `data:image/jpeg;base64,${profileImg}`;
        }
        return null;
    };
    
    const handleProfileImageClick = () => {
        hiddenFileInput.current.click();
    };

    const hiddenFileInput = useRef(null);

    const handleDeleteAccount = () => {
        // Confirmation before account deletion
        if (!window.confirm('정말로 회원 탈퇴를 진행하시겠습니까?')) {
          return; // If user cancels (clicks 'No'), stop the function
        }
        
        const token = localStorage.getItem('token');
    
        fetch(`${APPLICATION_SERVER_URL}/api/v1/users/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // or however your server expects the token
            }
        })
        .then(response => {
            localStorage.removeItem('token');
            window.location.reload();
        })
        .catch(error => {
            const errorToken = localStorage.getItem('token');
            if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
              window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
              return; // 함수 실행을 중단하고 반환합니다.
            }
            const token = error.response.headers.authorization.slice(7);
            localStorage.setItem('token', token)
            fetch(`${APPLICATION_SERVER_URL}/api/v1/users/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // or however your server expects the token
                }
            })
            .then(response => {
                localStorage.removeItem('token');
                window.location.reload();
            })
            .catch(error => {
                // Handle any errors here
                console.error('Error:', error);
            });
        })
    };

    if (!userInfo) {
        return <div>Loading...</div>;
    }

    const handleConfirmEdit = async () => {
        // TODO: 수정된 내용을 서버로 전송하고 결과를 확인합니다.
        // 서버 응답이 올바르다면, userInfo 상태를 업데이트하고 isEditing을 false로 설정합니다.
        if (editedNickname.includes('@')) {
            setErrorMessage("닉네임에 '@' 문자를 사용할 수 없습니다.");
            return;  // '@' 문자가 포함되어 있으면 함수를 여기서 종료
        }
        const token = localStorage.getItem('token');
        

        try{
            const response = await axios.patch(`${APPLICATION_SERVER_URL}/api/v1/users/modify`, {
                age: editedAge,
                password: "",
                backSound: "",
                effectSound: "",
                gameSound: "",
                isCam: "",
                profileImg: "",
                profileMusic: "",
                sex: "",
                synk: "",
                nickname: editedNickname,
                }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
        
            if (response.status === 200) {
                setUserInfo(prevState => ({ ...prevState, userNickname: editedNickname }));
                setUserInfo(prevState => ({ ...prevState, age: editedAge }));
            }
            setIsEditing(true);
            setErrorMessage("");
            }
            catch(error){
                if(error.response.status===403){
                    setErrorMessage("중복되는 닉네임입니다.");
                    return;
                }else if(error.response.status==401){
                    const errorToken = localStorage.getItem('token');
                    if (!errorToken) { // token이 null 또는 undefined 또는 빈 문자열일 때
                      window.location.href = '/'; // 이것은 주소창에 도메인 루트로 이동합니다. 원하는 페이지 URL로 변경하세요.
                      return; // 함수 실행을 중단하고 반환합니다.
                    }
                    const token = error.response.headers.authorization.slice(7);
                    localStorage.setItem('token', token);
                    const response = await axios.patch(`${APPLICATION_SERVER_URL}/api/v1/users/modify`, {
                        age: editedAge,
                        password: "",
                        backSound: "",
                        effectSound: "",
                        gameSound: "",
                        isCam: "",
                        profileImg: "",
                        profileMusic: "",
                        sex: "",
                        synk: "",
                        nickname: editedNickname,
                        }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    if (response.status === 200) {
                        setUserInfo(prevState => ({ ...prevState, userNickname: editedNickname }));
                        setUserInfo(prevState => ({ ...prevState, age: editedAge }));
                    }
                    setIsEditing(true);
                    setErrorMessage("");
                }
            }
        };
    
    const handleCancelEdit = () => {
        // 단순히 편집 모드를 종료하고 원래 정보로 돌아갑니다.
        setIsEditing(true);
    };

    return (
        <div 
        style={{
            width:'100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Jua, sans-serif',
            justifyContent: 'center',   // 세로 방향으로 가운데 정렬
        }}
        >
        {isEditing ?(
            <>
            <h1 className={styles.h1} style={{color:'wheat',fontSize:'3rem'}}>유저 정보</h1>
            <img className={styles.img} height={"20%"} width={"20%"} src={getImageSrc(userInfo.profileImg) || defaultProfileImg} alt="Profile"  style={{ margin: 'auto',marginBottom:'0px',marginTop:'0px' }} />
            <br/>
            {/* <button className={styles.neon_button} onClick={handleProfileImageClick}>
                프로필 사진 변경하기
            </button> */}
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleImageUpload}
                style={{ display: 'none', textAlign:'left'}}
            />
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>
            Email : {
                userInfo.userId[0] === 'g' 
                    ? userInfo.userId.slice(7) 
                    : userInfo.userId[0] === 'l' 
                        ? userInfo.userId.slice(6) 
                        : userInfo.userId 
            }
            </p>
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>
                Nickname: {userInfo.userNickname}
                <br/>
                {/* <button className={styles.neon_button} 
                onClick={handleNicknameChange}
                style={{marginLeft:'15%', marginTop:'5%'}}>
                    닉네임 변경하기
                </button> */}
            </p>
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>Age: {userInfo.age}</p>
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>Gender: {userInfo.sex === 0 ? 'Male' : 'Female'}</p>
            <div style={{display:'flex',marginLeft:'15%',marginTop:'20%'}}>
                <div className={styles.neon_button}
                style={{marginRight:'6%'}}>
                    <button className={styles.neon_button} onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>

                <div className={styles.neon_button}
                style={{marginRight:'6%'}}>
                    <button className={styles.neon_button} onClick={handleEditClick}>
                        정보수정
                    </button>
                </div>
            
                <div className={styles.neon_button}>
                    <button className={styles.neon_button} 
                    onClick={handleDeleteAccount}>
                        회원탈퇴
                    </button>
                </div>
            </div>
            </>
        ):(
            <>
            <h1 className={styles.h1} style={{color:'wheat',fontSize:'3rem',paddingTop:'0px'}}>정보 수정</h1>
            <img className={styles.img} height={"20%"} width={"20%"} src={getImageSrc(userInfo.profileImg) || defaultProfileImg} alt="Profile"  style={{ margin: 'auto', marginBottom:'0px',marginTop:'0px' }} />
            <br/>
            <button className={styles.neon_button} style={{width:'40%',margin:'auto', marginBottom:'10px',marginTop:'0px' }} onClick={handleProfileImageClick}>
                프로필 사진 변경하기
            </button>
            <input
                type="file"
                ref={hiddenFileInput}
                onChange={handleImageUpload}
                style={{ display: 'none', textAlign:'left'}}
            />
            <div style={{ display: 'flex', alignItems: 'center',marginBottom:'2%' }}>
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>
            Email : {
                userInfo.userId[0] === 'g' 
                    ? userInfo.userId.slice(7) 
                    : userInfo.userId[0] === 'L' 
                        ? userInfo.userId.slice(6) 
                        : userInfo.userId 
            }
            </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{color:'white', marginLeft:'5rem', fontSize:'1.7rem'}}>Nickname:</span>
            <input style={{display: 'inline-block',color:'white', marginLeft:'0.2rem', fontSize:'1.7rem', backgroundColor: 'transparent', width:'50%', border:'none', borderBottom: '1px solid white'}}
                value= {editedNickname}
                onChange={(e) => {
                    // 만약 상태를 변경하고 싶다면 이 부분에 로직 추가
                    setEditedNickname(e.target.value)
                }}
            >
                {/* <button className={styles.neon_button} 
                onClick={handleNicknameChange}
                style={{marginLeft:'15%', marginTop:'5%'}}>
                    닉네임 변경하기
                </button> */}
            </input>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{color:'white', marginLeft:'5rem', fontSize:'1.7rem'}}>Age:</span>
            <input style={{display: 'inline-block',color:'white', marginLeft:'0.2rem', fontSize:'1.7rem', backgroundColor: 'transparent', width:'10%', border:'none', borderBottom: '1px solid white'}}
                value= {editedAge}
                type='number'

                onChange={(e) => {
                    // 만약 상태를 변경하고 싶다면 이 부분에 로직 추가
                    setEditedAge(e.target.value)
                }}
            >
            </input>
            </div>
            <p style={{color:'white',marginLeft:'5rem',fontSize:'1.7rem'}}>Gender: {userInfo.sex === 0 ? 'Male' : 'Female'}</p>
            {errorMessage && <p style={{color:'red',display: 'block',marginLeft:'5rem'}}>{errorMessage}</p>}
            <div style={{display:'flex',marginLeft:'15%',marginTop:'20%'}}>
                <div className={styles.neon_button}
                style={{marginRight:'6%'}}>
                    <button className={styles.neon_button} onClick={handleConfirmEdit}>
                        확인
                    </button>
                </div>
                <div className={styles.neon_button}>
                    <button className={styles.neon_button} 
                    onClick={handleCancelEdit}>
                        취소
                    </button>
                </div>
            </div>
            </>
        )}
        </div>
    );
}

export default Userinfo;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import APPLICATION_SERVER_URL from '../ApiConfig';


const theme = createTheme({
  typography: {
    fontFamily: '"Jua", sans-serif', 
  },
  palette: {
    text: {
      primary: '#ffffff',  // 기본 글씨 색을 흰색으로 설정
    },
    primary: {
      main: '#ffffff', // "Sign Up" 버튼의 색상을 흰색으로 변경
    },
    action: {
      active: '#ffffff', // 테두리의 활성 상태 색상을 흰색으로 변경
    },
  },
});

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [googleUrl,setGoogleUrl] = useState('');

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const handleChangeUserId = (event) => {
    setUserId(event.target.value);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };


  // 제출 눌렀을 때 예외처리
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/auth/login`, {
        userId,
        password,
      });
      if (response.status === 200) {
        const token = response.data.accessToken;
        localStorage.setItem('token', token);
        navigate('/');
        window.location.reload();
      } else {
        setErrorMessage('아이디 패스워드를 다시 확인해주세요');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('아이디 패스워드를 다시 확인해주세요');
    }
  };

  useEffect(()=>{
    axios.get(`${APPLICATION_SERVER_URL}/api/v1/oauth2/authorization/google`)
      .then(response => {
        let tempGoogleUrl = response.data.slice(9);
        setGoogleUrl(tempGoogleUrl);
      })
      .catch(error => {
        // error handling
        console.error('Something went wrong', error);
      });
  },[]); // empty dependency array means this effect runs once on mount

  const handleGoogleLogin = async () => {
    window.location.href = googleUrl;
  };

  return (
    <ThemeProvider theme={theme}>
          <Box
            sx={{
              my: 4,
              mx: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '100%'
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" color="white">
              Sign in
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField 
                margin="normal"
                required
                fullWidth
                label="UserID"
                value={userId}
                onChange={handleChangeUserId}
                InputLabelProps={{
                  style: {
                    color: 'white'  // 이것은 라벨의 색상을 변경합니다.
                  },
                  notchedOutline: {
                    borderColor: 'white'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white', // 기본 테두리 색상 설정
                    },
                    '&:hover fieldset': {
                      borderColor: 'white', // 호버 상태일 때 테두리 색상 설정
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white', // 포커스 상태일 때 테두리 색상 설정
                    },
                  },
                }}
              />
              <TextField 
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={handleChangePassword}
                InputLabelProps={{
                  style: {
                    color: 'white'  // 이것은 라벨의 색상을 변경합니다.
                  },
                  notchedOutline: {
                    borderColor: 'white'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white', // 기본 테두리 색상 설정
                    },
                    '&:hover fieldset': {
                      borderColor: 'white', // 호버 상태일 때 테두리 색상 설정
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white', // 포커스 상태일 때 테두리 색상 설정
                    },
                  },
                }}
              />
              {errorMessage && <Typography color="error">{errorMessage}</Typography>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2, mb: 2 }}
                onClick={handleGoogleLogin}
              >
                Sign In with Google
              </Button>
            </Box>
          </Box>
    </ThemeProvider>
  );
};

export default Login;

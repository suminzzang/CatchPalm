import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import APPLICATION_SERVER_URL from '../ApiConfig';
import Swal from "sweetalert2"




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

function SignUp() {
  const [errorMessage, setErrorMessage] = useState('');
  
  const [state, setState] = useState({
    userId: '',
    password: '',
    age: '',
    sex: '',
  });

  const [userIdMessage, setUserIdMessage] = useState({text: "", color: "inherit"});

  const navigate = useNavigate();

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState({
      ...state,
      [name]: value,
    });
    
    if (name === 'userId') {
      if (!isValidEmail(value)) {
        setUserIdMessage({text: '유효한 이메일 형식이 아닙니다.', color: "error"});
        return;
      }
      handleCheckUserId(value);
    }
  };

  const handleCheckUserId = async (userId) => {
    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/users/duplicated/userId`, { userId });
      
      if (response.data.duplicated) {
        setUserIdMessage({text: '이미 사용중인 아이디입니다.', color: "error"});
      } else {
        setUserIdMessage({text: '사용 가능한 아이디입니다.', color: "#ffd700"});
      }
    } catch (error) {
      console.error(error);
      alert("아이디 중복검사에 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loadingAlert = Swal.fire({
      title: '이메일 전송 중...',
      zIndex: 10,
      allowOutsideClick: false,
      showConfirmButton: false,  // 추가: 확인 버튼을 숨깁니다.
      onBeforeOpen: () => {
          Swal.showLoading();
      }
  });
  Swal.showLoading();
    try {
      const response = await axios.post(`${APPLICATION_SERVER_URL}/api/v1/users`, {
        userId: state.userId,
        password: state.password,
        age: state.age,
        sex: state.sex,
      });
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "가입하신 이메일을 확인해주세요!",
          zIndex:11,
        });
      }
      
      navigate('/');
    } catch (error) {
      setErrorMessage('입력 형식이 올바르지 않습니다.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" color="white">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
  
            <Grid container spacing={2} >
              <Grid item xs={12} sm={6}>
                <TextField
                  
                  required
                  fullWidth
                  name="age"
                  label="Age"
                  type="number"
                  onChange={handleChange}
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
              </Grid>
              <Box sx={{ height: 16 }} />
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="sex"
                  label="Gender"
                  select
                  SelectProps={{
                    native: true,
                  }}
                  onChange={handleChange}
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
                  >
                  <option value=""  style={{color:'black'}}></option>
                  <option value="0" style={{color:'black'}}>남성</option>
                  <option value="1" style={{color:'black'}}>여성</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoComplete="given-name"
                  name="userId"
                  required
                  fullWidth
                  label="User Email"
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color: 'white'  // 이것은 라벨의 색상을 변경합니다.
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
                <Typography variant="body2" color={userIdMessage.color}>{userIdMessage.text}</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  onChange={handleChange}
                  InputLabelProps={{
                    style: {
                      color: 'white'  // 이것은 라벨의 색상을 변경합니다.
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
              </Grid>
              {errorMessage && <Typography color="error" sx={{ marginTop: '1rem',marginLeft:'1rem'}}>{errorMessage}</Typography>}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 3, mb: 2 }}
                  >
                  Sign Up
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SignUp;

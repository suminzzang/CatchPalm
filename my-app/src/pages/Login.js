import React, { useState } from 'react';
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

const theme = createTheme();

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleBackButtonClick = () => {
    navigate('/');
  };

  const handleChangeUserId = (event) => {
    setUserId(event.target.value);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://localhost:8443/api/v1/auth/login', {
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

  const handleGoogleLogin = async () => {
    try {
      const response = await axios.get('https://localhost:8443/api/v1/oauth2/authorization/google');
      if (response.status === 200) {
        localStorage.setItem('token', response.data.accessToken);
        navigate('/');
        window.location.reload();
      } else {
        setErrorMessage('Google 로그인 실패');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Google 로그인 실패');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
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
              />
              <TextField 
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={handleChangePassword}
              />
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
              <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2" onClick={handleBackButtonClick}>
                    Back to main page
                  </Link>
                </Grid>
              </Grid>
              {errorMessage && <Typography color="error">{errorMessage}</Typography>}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default Login;

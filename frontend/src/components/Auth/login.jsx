import React, { useState } from 'react';
import { TextField, Button, Container, Typography, IconButton, Grid, Snackbar, Alert } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/images/téléchargement.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError("L'email est requis.");
    }
    if (!password) {
      setPasswordError('Le mot de passe est requis.');
    }
    if (!email || !password) return;

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);

      setSnackbarMessage('Connexion réussie');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Erreur lors de la connexion.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container
      maxWidth="xs"
      style={{
        marginLeft: '530px',
        marginTop: '90px',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
      }}
    >
      <Grid container direction="column" alignItems="center">
        <img src={logo} alt="Logo" style={{ width: '100px' }} />
        <Typography variant="h4" component="h1" gutterBottom style={{ color: 'black' }}>
          Connexion
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
          InputProps={{
            startAdornment: <Email position="start" />,
          }}
        />
        <TextField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          InputProps={{
            startAdornment: <Lock position="start" />,
            endAdornment: (
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        <Button
          variant="contained"
          style={{
            backgroundColor: '#ffc107',
            color: '#000',
            marginTop: '20px',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            transition: 'background-color 0.3s, transform 0.2s',
          }}
          fullWidth
          onMouseOver={(e) => (e.target.style.backgroundColor = '#ffb300')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#ffc107')}
          onClick={handleLogin}
        >
          Se connecter
        </Button>

        <Typography variant="body2" style={{ marginTop: '20px', color: 'black' }}>
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/register" style={{ textDecoration: 'none', color: '#0F09C8' }}>
            Créez-en un ici
          </Link>
        </Typography>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;

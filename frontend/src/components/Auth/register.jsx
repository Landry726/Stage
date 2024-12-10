import React, { useState } from 'react';
import { TextField, Button, Container, Typography, IconButton, Alert, Snackbar } from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/images/téléchargement.jpg';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validation des champs
    if (!username || !email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur inattendue.');
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setError('');
    setSuccess(false);
  };

  return (
    <Container
      maxWidth="xs"
      style={{
        marginTop: '90px',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '70vh',
      }}
    >
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          Inscription réussie
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>

      <img src={logo} alt="Logo" style={{ width: '100px' }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Inscription
      </Typography>
      <TextField
        label="Nom d'utilisateur"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        InputProps={{
          startAdornment: <Person position="start" />,
        }}
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        InputProps={{
          startAdornment: <Lock position="start" />,
          endAdornment: (
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        }}
      />
      <Button
        variant="contained"
        style={{
          backgroundColor: '#ffc107', // Couleur jaune doré
          color: '#000',
          marginTop: '20px',
          borderRadius: '10px',
          padding: '10px 20px',
          fontSize: '16px',
          transition: 'background-color 0.3s, transform 0.2s',
        }}
        fullWidth
        onClick={handleRegister}
      >
        S'inscrire
      </Button>

      <Typography variant="body2" style={{ marginTop: '20px', color: 'black', textAlign: 'center' }}>
        Vous avez déjà un compte ?{' '}
        <Link to="/" style={{ textDecoration: 'none', color: '#0F09C8' }}>
          Connectez-vous ici
        </Link>
      </Typography>
    </Container>
  );
};

export default Register;

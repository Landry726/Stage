// frontend/src/components/Login.js
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Snackbar, IconButton, Grid, Alert } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/téléchargement.jpg'; // Ajustez le chemin si nécessaire

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [succes, setSucces] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Réinitialiser les erreurs
    setEmailError('');
    setPasswordError('');
    setError('');

    // Validation des champs vides
    if (!email) {
      setEmailError('L\'email est requis.');
    }
    if (!password) {
      setPasswordError('Le mot de passe est requis.');
    }
    if (!email || !password) return; // Empêche la suite si un champ est vide

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      setSucces(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      // Vérifier l'erreur et afficher un message approprié
      if (err.response?.status === 401) {
        setError('Email ou mot de passe incorrect.'); // Afficher une erreur si les identifiants sont incorrects
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la connexion.'); // Autres erreurs
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSucces(false);
    setError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container 
      maxWidth="xs" 
      style={{ 
        marginLeft: '400px', 
        marginTop: '10px', 
        padding: '50px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        borderColor: 'fcfc03',
      }}
    >
      {/* Snackbar pour afficher les messages de succès ou d'erreur */}
      <Snackbar
        open={succes}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity='success' onClose={handleClose}>
          Connexion réussie
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar
          open={true} 
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert severity='error' onClose={handleClose}>
            {error}
          </Alert>
        </Snackbar>
      )}

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
          error={!!emailError || !!error} // Afficher l'erreur si présente
          helperText={emailError || (error && 'Email ou mot de passe incorrect.')} // Texte d'aide pour l'erreur
          InputProps={{
            startAdornment: <Email position="start" />, // Icône d'email
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
          error={!!passwordError || !!error} // Afficher l'erreur si présente
          helperText={passwordError || (error && 'Email ou mot de passe incorrect.')} // Texte d'aide pour l'erreur
          InputProps={{
            startAdornment: <Lock position="start" />, // Icône de verrou
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
            backgroundColor: '#ffd700', // Couleur jaune adoucie
            color: '#000', // Couleur du texte
            marginTop: '20px',
            borderRadius: '10px',
            borderColor: 'fcfc03',
          }} 
          fullWidth 
          onClick={handleLogin}
        >
          Se connecter
        </Button>

        {/* Lien vers la page d'enregistrement avec texte alternatif */}
        <Typography variant="body2" style={{ marginTop: '20px', color: 'black' }}>
          Vous n'avez pas encore de compte ? <Link to="/register" style={{ textDecoration: 'none', color: '#0F09C8' }}>Créez-en un ici</Link>
        </Typography>
      </Grid>
    </Container>
  );
};

export default Login;

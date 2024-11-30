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
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
      });
      console.log("Connexion réussie");
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      setError(error.response.data.message);
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
        marginLeft: '400px', 
        marginTop: '10px', 
        padding: '50px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh' 
      }}
    >
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
          startAdornment: <Person position="start" />, // Icône pour le nom d'utilisateur
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
        InputProps={{
          startAdornment: <Lock position="start" />, // Icône de verrou
          endAdornment: (
            <IconButton 
              onClick={() => setShowPassword(!showPassword)} // Toggle pour afficher/masquer le mot de passe
              edge="end"
              style={{ padding: 0 }} // Pour éviter l'espacement excessif
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
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
          borderRadius: '10px'
        }} 
        fullWidth 
        onClick={handleRegister}
      >
        S'inscrire
      </Button>

      <Typography variant="body2" style={{ marginTop: '20px', color: 'black', textAlign: 'center' }}>
        Vous avez déjà un compte ? <Link to="/" style={{ textDecoration: 'none', color: '#0F09C8' }}>Connectez-vous ici</Link>
      </Typography>

      {/* Snackbar pour afficher les messages de succès ou d'erreur */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity='success' variant='filled'>
          Inscription réussie
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity='error' variant='filled'>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;

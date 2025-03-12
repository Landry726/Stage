import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Typography, Box, IconButton, Snackbar, Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Autocomplete } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MissionForm = () => {
  const [membres, setMembres] = useState([]);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();

  // Récupérer les membres depuis l'API
  useEffect(() => {
    const fetchMembres = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/membres');
        setMembres(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };
    fetchMembres();
  }, []);

  // Fonction de soumission du formulaire
  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://localhost:3000/api/missions', data);

      if (response.status === 200) {
        setSnackbarMessage('Mission ajoutée avec succès.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        navigate('/mission');
      }
    } catch (error) {
      setSnackbarMessage(`Erreur lors de l'ajout : ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: '30px',
        padding: 5,
        boxShadow: 5,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/mission')} sx={{ mr: 1, color: 'primary.main' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Enregistrer une Mission
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Autocomplete pour Membre */}
          <Grid item xs={12}>
            <Autocomplete
              options={membres}
              getOptionLabel={(option) => option.nom || ''}
              onChange={(event, value) => {
                setSelectedMembre(value);
                setValue('membreId', value ? value.id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Membre"
                  variant="outlined"
                  error={!!errors.membreId}
                  helperText={errors.membreId ? 'Le membre est requis' : ''}
                />
              )}
            />
            {/* Champ caché pour soumettre membreId */}
            <input
              type="hidden"
              {...register('membreId', { required: 'Le membre est requis' })}
            />
          </Grid>

          {/* Montant */}
          <Grid item xs={12}>
            <TextField
              label="Montant"
              variant="outlined"
              fullWidth
              type="number"
              {...register('montant', { required: 'Le montant est requis' })}
              error={!!errors.montant}
              helperText={errors.montant ? errors.montant.message : ''}
            />
          </Grid>

          {/* Mois */}
          <Grid item xs={12}>
        <TextField
          label="Mois"
          variant="outlined"
          fullWidth
          type="month"
          {...register('mois', { required: 'Le mois est requis' })}
          error={!!errors.mois}
          helperText={errors.mois ? errors.mois.message : ''}
          sx={{
            '& input': {
              padding: '20px 50px', // Ajustez la valeur selon vos besoins
            },
          }}
        />
      </Grid>


          {/* Bouton Ajouter */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                padding: '12px',
                background: 'linear-gradient(to right, #007bff, #0056b3)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '1rem',
                border: '1px solid #0056b3',
                '&:hover': {
                  background: 'linear-gradient(to right, #0056b3, #004494)',
                },
              }}
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MissionForm;

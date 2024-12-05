import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Typography, Box, InputAdornment, MenuItem, FormControl, Select, InputLabel,IconButton
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCalendarAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS pour le toast
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Save } from '@mui/icons-material';

const MissionForm = () => {
  const [membres, setMembres] = useState([]);
  const { register, handleSubmit, formState: { errors } } = useForm();
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
        toast.success("Mission ajoutée avec succès !");
        navigate('/mission');
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la mission");
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
        <IconButton onClick={() => navigate('/mission')} sx={{ mr: 1 ,color: 'primary.main'}}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Enregistrer un Mission
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Select pour Membre */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.membreId}>
              <InputLabel id="membre-label">Membre</InputLabel>
              <Select
                labelId="membre-label"
                label="Membre"
                size="medium"
                style={{
                  marginBottom: '20px',
                  borderRadius: '5px',
                }}
                {...register('membreId', { required: 'Le Membre est requis' })}
                defaultValue=""
              >
                {membres.map((membre) => (
                  <MenuItem key={membre.id} value={membre.id}>
                    {membre.nom}
                  </MenuItem>
                ))}
              </Select>
              {errors.membreId && <p style={{ color: 'red' }}>{errors.membreId.message}</p>}
            </FormControl>
          </Grid>

          {/* Montant */}
          <Grid item xs={12}>
            <TextField
              label="Montant"
              variant="outlined"
              size="medium"
              style={{
                marginBottom: '20px',
                borderRadius: '10px',
              }}
              fullWidth
              type="number"
              {...register('montant', { required: 'Le montant est requis' })}
              error={!!errors.montant}
              helperText={errors.montant ? errors.montant.message : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faDollarSign} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Mois */}
          <Grid item xs={12}>
            <TextField
              label="Mois"
              variant="outlined"
              size="medium"
              style={{
                marginBottom: '20px',
                borderRadius: '10px',
              }}
              fullWidth
              type="month"
              {...register('mois', { required: 'Le mois est requis' })}
              error={!!errors.mois}
              helperText={errors.mois ? errors.mois.message : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                  </InputAdornment>
                ),
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
    </Box>
  );
};

export default MissionForm;

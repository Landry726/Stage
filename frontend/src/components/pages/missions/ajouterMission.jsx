import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Box, InputAdornment, MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDollarSign, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import CSS pour le toast
import { useNavigate } from 'react-router-dom';

const MissionForm = () => {
  const [membres, setMembres] = useState([]);  // État pour stocker les membres
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const navigate = useNavigate();

  // Récupérer les membres depuis l'API
  useEffect(() => {
    const fetchMembres = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/membres'); // Remplacez par votre URL d'API
        setMembres(response.data);  // Stocke les membres dans l'état
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };
    fetchMembres();
  }, []);

  // Fonction de soumission du formulaire
  const onSubmit = async (data) => {
    try {
      // Envoi des données au backend
      const response = await axios.post('http://localhost:3000/api/missions', data);
      
      // Affichage du message de succès
      if (response.status === 200) {
        toast.success("Mission ajoutée avec succès !");
        navigate('/mission')
      }
    } catch (error) {
      // Affichage du message d'erreur
      toast.error("Erreur lors de l'ajout de la mission");
    }


  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Ajouter une Mission
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Grid container spacing={2}>

          {/* Select pour Membre */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.membreId}>
              <InputLabel id="membre-label">Membre</InputLabel>
              <Select
                labelId="membre-label"
                label="Membre"
                {...register('membreId', { required: 'Le Membre est requis' })}
                defaultValue=""
              >
                {membres.map((membre) => (
                  <MenuItem key={membre.id} value={membre.id}>
                    {membre.nom} {/* Affiche le nom du membre */}
                  </MenuItem>
                ))}
              </Select>
              {errors.membreId && <p>{errors.membreId.message}</p>}
            </FormControl>
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

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
            >
              Ajouter Mission
            </Button>
          </Grid>

        </Grid>
      </form>
    </Box>
  );
};

export default MissionForm;

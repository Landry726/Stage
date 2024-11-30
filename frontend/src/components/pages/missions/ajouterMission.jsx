import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Grid, Typography, Box, InputAdornment, MenuItem, FormControl, Select, InputLabel, Card, CardContent,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS pour le toast
import { useNavigate } from 'react-router-dom';

const MissionForm = () => {
  const [membres, setMembres] = useState([]); // État pour stocker les membres
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Récupérer les membres depuis l'API
  useEffect(() => {
    const fetchMembres = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/membres'); // Remplacez par votre URL d'API
        setMembres(response.data); // Stocke les membres dans l'état
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
        navigate('/mission');
      }
    } catch (error) {
      // Affichage du message d'erreur
      toast.error("Erreur lors de l'ajout de la mission");
    }
  };

  return (
    <Box   maxWidth="md" sx={{
      padding:5,
      borderRadius: 3,
      boxShadow: 3,
      mr : 5,
      marginLeft : -1,
  }}>
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
                    size="medium"  // Agrandit le champ de texte
                    style={{
                        marginBottom: '20px', 

                        borderRadius: '10px',  // Coins arrondis
                    }} // Espacement sous le champ
                    {...register('membreId', { required: 'Le Membre est requis' })}
                    defaultValue=""
                  >
                    {membres.map((membre) => (
                      <MenuItem key={membre.id} value={membre.id}>
                        {membre.nom} {/* Affiche le nom du membre */}
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
                  size="medium"  // Agrandit le champ de texte
                  style={{
                      marginBottom: '20px', 

                      borderRadius: '10px',  // Coins arrondis
                  }} // Espacement sous le champ
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
                  size="medium"  // Agrandit le champ de texte
                  style={{
                      marginBottom: '20px', 

                      borderRadius: '10px',  // Coins arrondis
                  }} // Espacement sous le champ
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

              {/* Boutons */}
              <Grid item xs={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate('/mission')}
                  sx={{
                    padding: '12px',
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    border: '1px solid #cc0000',
                    '&:hover': {
                        backgroundColor: '#cc0000',
                    },
                }}  
                >
                  Annuler
                </Button>
              </Grid>
              <Grid item xs={6}>
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

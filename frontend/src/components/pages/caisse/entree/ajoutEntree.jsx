import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const AddEntryForm = () => {
  const [motif, setMotif] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [caisseId, setCaisseId] = useState('');
  const [caisses, setCaisses] = useState([]); // Stocke les caisses disponibles

  useEffect(() => {
    // Charger les caisses au chargement du composant
    const fetchCaisses = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/caisse'); // Assurez-vous que cette route retourne toutes les caisses
        setCaisses(response.data); // Met les caisses dans l'état
      } catch (error) {
        toast.error("Erreur lors du chargement des caisses");
        console.error(error);
      }
    };

    fetchCaisses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!motif || !montant || !date || !caisseId) {
      toast.error("Tous les champs sont requis !");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/entree', {
        motif,
        montant: parseFloat(montant),
        date: new Date(date),
        caisseId: parseInt(caisseId),
      });

      if (response.status === 201) {
        toast.success("Entrée ajoutée avec succès !");
        setMotif('');
        setMontant('');
        setDate(dayjs().format('YYYY-MM-DD'));
        setCaisseId('');
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'entrée");
      console.error(error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 3,
        boxShadow: 3,
        maxWidth: 400,
        margin: '0 auto',
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Typography variant="h5" mb={2}>
        Ajouter une Entrée
      </Typography>

      <TextField
        label="Motif"
        variant="outlined"
        fullWidth
        margin="normal"
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
      />

      <TextField
        label="Montant"
        variant="outlined"
        fullWidth
        margin="normal"
        type="number"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
      />

      <TextField
        label="Date"
        variant="outlined"
        fullWidth
        margin="normal"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />

      {/* Sélection de la caisse */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="select-caisse-label">Caisse</InputLabel>
        <Select
          labelId="select-caisse-label"
          value={caisseId}
          label="Caisse"
          onChange={(e) => setCaisseId(e.target.value)}
        >
          {caisses.map((caisse) => (
            <MenuItem key={caisse.id} value={caisse.id}>
              {caisse.nom || `Caisse ${caisse.id}`} {/* Utilisez la propriété "nom" ou un autre identifiant */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          backgroundColor: '#1976d2',
          ':hover': { backgroundColor: '#115293' },
        }}
      >
        Ajouter Entrée
      </Button>
    </Box>
  );
};

export default AddEntryForm;

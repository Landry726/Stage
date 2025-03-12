import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
const AddEntryForm = () => {
  const [motif, setMotif] = useState('');
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [caisseId, setCaisseId] = useState('');
  const [caisses, setCaisses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/caisse');
        setCaisses(response.data);
      } catch (error) {
        handleSnackbar('Erreur lors du chargement des caisses', 'error');
      }
    };
    fetchCaisses();
  }, []);

  const handleSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!motif || !montant || !date || !caisseId) {
      handleSnackbar('Tous les champs sont requis !', 'warning');
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
        handleSnackbar('Entrée ajoutée avec succès !', 'success');
        setMotif('');
        setMontant('');
        setDate(dayjs().format('YYYY-MM-DD'));
        setCaisseId('');
      }
      setTimeout(() => {
        navigate('/Entree');
    }, 2000);
    } catch (error) {
      handleSnackbar("Erreur lors de l'ajout de l'entrée", 'error');
    }
  };
  const handleCancel = () => {
    navigate('/Entree');
};

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 800,
        margin: '30px',
        padding: 5,
        boxShadow: 5,
        borderRadius: 2,
        bgcolor: 'background.paper',
    }}
    >
      <IconButton onClick={handleCancel} sx={{ mr: 1, color: 'primary.main' }}>
                        <ArrowBack />
                    </IconButton>
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
              {caisse.nom || `Caisse ${caisse.id}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2, backgroundColor: '#1976d2', width : '100%',':hover': { backgroundColor: '#115293' } }}
      >
        Ajouter Entrée
      </Button>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddEntryForm;

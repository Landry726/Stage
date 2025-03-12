import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AddSortie = () => {
  const [formData, setFormData] = useState({
    date: "",
    montant: "",
    motif: "",
    caisseId: "",
  });
  const navigate = useNavigate();
  const [caisses, setCaisses] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // success, error, warning, info
  });

  // Charger les caisses disponibles depuis le backend
  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/caisse");
        setCaisses(response.data);
      } catch (error) {
        handleSnackbar("Erreur lors du chargement des caisses", "error");
        console.error(error);
      }
    };

    fetchCaisses();
  }, []);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestion de l'ouverture du Snackbar
  const handleSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Gestion de la fermeture du Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.montant || !formData.motif || !formData.caisseId) {
      handleSnackbar("Tous les champs sont requis", "warning");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/sortie", formData);
      handleSnackbar("Sortie ajoutée avec succès !", "success");

      // Réinitialisation du formulaire après ajout
      setFormData({
        date: "",
        montant: "",
        motif: "",
        caisseId: "",
      });

      console.log("Réponse du serveur :", response.data);
      setTimeout(() => {
        navigate('/Sortie');
    }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la sortie :", error);
      handleSnackbar("Erreur lors de l'ajout de la sortie", "error");
    }
  };
  const handleCancel = () => {
    navigate('/Sortie');
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
      <IconButton onClick={handleCancel} sx={{ mr: 1, color: 'primary.main' }}>
                        <ArrowBack />
      </IconButton>
      <Typography variant="h5" gutterBottom>
        Ajouter une Sortie
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Champ de date */}
        <TextField
          fullWidth
          margin="normal"
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Champ pour le montant */}
        <TextField
          fullWidth
          margin="normal"
          label="Montant"
          name="montant"
          type="number"
          value={formData.montant}
          onChange={handleChange}
        />

        {/* Champ pour le motif */}
        <TextField
          fullWidth
          margin="normal"
          label="Motif"
          name="motif"
          value={formData.motif}
          onChange={handleChange}
        />

        {/* Menu déroulant pour choisir une caisse */}
        <TextField
          fullWidth
          margin="normal"
          label="Caisse"
          name="caisseId"
          select
          value={formData.caisseId}
          onChange={handleChange}
        >
          {caisses.length > 0 ? (
            caisses.map((caisse) => (
              <MenuItem key={caisse.id} value={caisse.id}>
                {caisse.nom || `Caisse ${caisse.id}`}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>Aucune caisse disponible</MenuItem>
          )}
        </TextField>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Ajouter Sortie
        </Button>
      </form>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddSortie;

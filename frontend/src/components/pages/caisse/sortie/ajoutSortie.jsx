import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const AddSortie = () => {
  const [formData, setFormData] = useState({
    date: "",
    montant: "",
    motif: "",
    caisseId: "",
  });

  const [caisses, setCaisses] = useState([]);

  // Charger les caisses disponibles depuis le backend
  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/caisse"); // URL de l'API
        setCaisses(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des caisses");
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

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/sortie", formData); // URL de l'API
      toast.success("Sortie ajoutée avec succès !");
      console.log("Réponse du serveur :", response.data);

      // Réinitialisation du formulaire après ajout
      setFormData({
        date: "",
        montant: "",
        motif: "",
        caisseId: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la sortie :", error);
      toast.error("Erreur lors de l'ajout de la sortie",error);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 500,
        margin: "auto",
        mt: 4,
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
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

      {/* Container pour les notifications */}
      <ToastContainer />
    </Box>
  );
};

export default AddSortie;

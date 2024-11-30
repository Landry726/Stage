import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PaymentForm() {
  const [membreId, setMembreId] = useState('');
  const [missionId, setMissionId] = useState('');
  const [montantPayer, setMontantPayer] = useState('');
  const [mois, setMois] = useState('');
  const [membres, setMembres] = useState([]);
  const [missions, setMissions] = useState([]);

  // Charger les membres et missions au montage
  useEffect(() => {
    const fetchMembres = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/membres');
        setMembres(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des membres");
      }
    };

    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/missions');
        setMissions(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des missions");
      }
    };

    fetchMembres();
    fetchMissions();
  }, []);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valider les données avant l'envoi
    if (!membreId || !missionId || !montantPayer || !mois) {
      toast.error("Tous les champs doivent être remplis.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/paiementMission', {
        membreId,
        missionId,
        montantPayer,
        mois,
      });

      toast.success(response.data.message || "Paiement enregistré avec succès");
      navigate('/liste');
      // Réinitialiser le formulaire après un paiement réussi
      setMembreId('');
      setMissionId('');
      setMontantPayer('');
      setMois('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erreur lors de l'enregistrement du paiement";
      toast.error(errorMsg);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', padding: 3, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <h2>Enregistrer un Paiement</h2>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="membre-label">Membre</InputLabel>
          <Select
            labelId="membre-label"
            value={membreId}
            onChange={(e) => setMembreId(e.target.value)}
            label="Membre"
            required
          >
            {membres.map((membre) => (
              <MenuItem key={membre.id} value={membre.id}>
                {membre.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="mission-label">Mission</InputLabel>
          <Select
            labelId="mission-label"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            label="Mission"
            required
          >
            {missions.map((mission) => (
              <MenuItem key={mission.id} value={mission.id}>
                {mission.description} - {mission.mois}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Montant à Payer"
          type="number"
          value={montantPayer}
          onChange={(e) => setMontantPayer(e.target.value)}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Mois"
          type="month"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          required
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Enregistrer
        </Button>
      </form>

      <ToastContainer />
    </Box>
  );
}

export default PaymentForm;

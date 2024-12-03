import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function PaymentForm() {
  const [membreId, setMembreId] = useState('');
  const [missionId, setMissionId] = useState('');
  const [montantPayer, setMontantPayer] = useState('');
  const [mois, setMois] = useState('');
  const [membres, setMembres] = useState([]);
  const [missions, setMissions] = useState([]);
  const [datePaiement, setDatePaiement] = useState('');
  const [filteredMissions, setFilteredMissions] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (membreId) {
      const missionsFiltrees = missions.filter(
        (mission) => mission.membreId === membreId && (!mois || mission.mois === mois)
      );
      setFilteredMissions(missionsFiltrees);
    } else {
      setFilteredMissions([]);
    }
  }, [membreId, mois, missions]);

  useEffect(() => {
    const selectedMission = filteredMissions.find((mission) => mission.id === missionId);
    setMois(selectedMission ? selectedMission.mois : '');
  }, [missionId, filteredMissions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!membreId || !missionId || !montantPayer || !datePaiement) {
      toast.error("Tous les champs doivent être remplis.");
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/paiementMission', {
        membreId,
        missionId,
        montantPayer,
        mois,
        datePaiement,
      });

      toast.success("Paiement enregistré avec succès");
      setTimeout(() => navigate('/listePaimentMission'), 2000);
      setMembreId('');
      setMissionId('');
      setMontantPayer('');
      setMois('');
      setDatePaiement('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Erreur lors de l'enregistrement du paiement";
      toast.error(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: '80px',
        padding: 4,
        boxShadow: 5,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/listePaimentMission')} sx={{ mr: 1 ,color: 'primary.main'}}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Enregistrer un Paiement
        </Typography>
      </Box>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="membre-label">Membre</InputLabel>
          <Select
            labelId="membre-label"
            value={membreId}
            onChange={(e) => setMembreId(e.target.value)}
            label="Membre"
            required
          >
            <MenuItem value="">Sélectionnez un membre</MenuItem>
            {membres.map((membre) => (
              <MenuItem key={membre.id} value={membre.id}>
                {membre.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="mission-label">Mission</InputLabel>
          <Select
            labelId="mission-label"
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
            label="Mission"
            required
          >
            <MenuItem value="">Sélectionnez une mission</MenuItem>
            {filteredMissions.map((mission) => (
              <MenuItem key={mission.id} value={mission.id}>
                {mission.mois}
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
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Date de Paiement"
          type="date"
          value={datePaiement}
          onChange={(e) => setDatePaiement(e.target.value)}
          required
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<Save />}
        >
          Enregistrer
        </Button>
      </form>
      <ToastContainer />
    </Box>
  );
}

export default PaymentForm;

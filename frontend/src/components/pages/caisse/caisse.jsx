import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const CaisseList = () => {
  const [loading, setLoading] = useState(true);
  const [caisses, setCaisses] = useState([]);
  const [error, setError] = useState(null);

  // States for Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    // Récupérer les données depuis le backend
    axios
      .get('http://localhost:3000/api/caisse') // Assurez-vous que ce lien correspond à votre API
      .then((response) => {
        setCaisses(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3000/api/rapport',
        { responseType: 'blob' } // Permet de récupérer un fichier binaire
      );

      // Créer un lien pour télécharger le fichier
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Rapport_Caisse.xlsx'); // Nom du fichier
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Définir le message de succès pour le Snackbar
      setSnackbarMessage('Le fichier Excel a été téléchargé avec succès !');
      setSnackbarSeverity('success');
      setOpenSnackbar(true); // Ouvrir le Snackbar
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport :', error);

      // Définir le message d'erreur pour le Snackbar
      setSnackbarMessage('Une erreur est survenue lors du téléchargement.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true); // Ouvrir le Snackbar
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false); // Fermer le Snackbar
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          Une erreur s'est produite : {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={3}
      sx={{
        padding: "15px",
        marginLeft: '-220px',
        maxHeight: '100vh',
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflowY: 'auto'
      }}>
      {/* Snackbar pour les alertes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000} // Fermer après 6 secondes
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled">
          <AlertTitle>{snackbarSeverity === 'success' ? 'Succès' : 'Erreur'}</AlertTitle>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Titre et bouton de téléchargement */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Télécharger le rapport
        </Button>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#003399' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Nom de la Caisse</TableCell>
              <TableCell sx={{ color: 'white' }}>Solde Actuel</TableCell>
              <TableCell sx={{ color: 'white' }}>Total des Entrées</TableCell>
              <TableCell sx={{ color: 'white' }}>Total des Sorties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {caisses.map((caisse) => (
              <TableRow key={caisse.id}>
                <TableCell>{caisse.nom || `Caisse ${caisse.id}`}</TableCell>
                <TableCell>{caisse.soldeActuel} Ar</TableCell>
                <TableCell>{caisse.totalEntrees} Ar</TableCell>
                <TableCell>{caisse.totalSorties} Ar</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CaisseList;

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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { ToastContainer, toast } from 'react-toastify'; // Pour les notifications
import 'react-toastify/dist/ReactToastify.css'; // Styles par défaut de react-toastify
import axios from 'axios';

const CaisseList = () => {
  const [loading, setLoading] = useState(true);
  const [caisses, setCaisses] = useState([]);
  const [error, setError] = useState(null);

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

      // Notification de succès
      toast.success('Le fichier Excel a été téléchargé avec succès !', {
        position: toast.POSITION.TOP_RIGHT,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport :', error);
      toast.error('Une erreur est survenue lors du téléchargement.', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
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
    <Box sx={{ padding: '12px', marginTop: '10px', maxHeight: '100vh', overflowY: 'auto', marginLeft: '-220px' }}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Titre et bouton de téléchargement */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#003399' }}>
          Caisses
        </Typography>
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
    </Box>
  );
};

export default CaisseList;

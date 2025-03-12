import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, CircularProgress, Typography,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, IconButton, Snackbar, Alert, createTheme
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { frFR } from "@mui/material/locale";
import { ThemeProvider } from "@mui/material/styles";
import { Edit, Delete, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function PaginatedPaymentList() {
  const [paiements, setPaiements] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPaiement, setCurrentPaiement] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const navigate = useNavigate();

  const fetchPaiements = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/paiementMission');
      setPaiements(response.data);
    } catch (error) {
      setError("Erreur lors du chargement des paiements");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: '' });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const openEditDialog = (paiement) => {
    setCurrentPaiement(paiement);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentPaiement(null);
  };

  const openDeleteDialog = (paiement) => {
    setCurrentPaiement(paiement);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentPaiement(null);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/api/paiementMission/${currentPaiement.id}`, currentPaiement);
      setSnackbar({ open: true, message: "Paiement mis à jour avec succès", severity: "success" });
      closeEditDialog();
      fetchPaiements(); // Actualisation automatique
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la mise à jour", severity: "error" });
      console.error(error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/paiementMission/${currentPaiement.id}`);
      setSnackbar({ open: true, message: "Paiement supprimé avec succès", severity: "success" });
      closeDeleteDialog();
      fetchPaiements(); // Actualisation automatique
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setCurrentPaiement({ ...currentPaiement, [e.target.name]: e.target.value });
  };

  const filteredPaiements = paiements.filter(paiement =>
    paiement.membre.nom.toLowerCase().includes(search.toLowerCase()) ||
    paiement.mission.id.toString().includes(search)
  );

  const handleBack = () => {
    navigate('/mission'); // Redirect to the Cotisation List page
  };

  const theme1 = createTheme(
    {
      palette: {
        primary: {
          main: "#003399",
        },
      },
    },
    frFR
  );

  return (
    <ThemeProvider theme={theme1}>
      <Paper sx={{ padding: '15px', marginTop: '5px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-240px' }}>
        <IconButton onClick={handleBack} sx={{ marginBottom: '20px', color: 'primary.main' }}>
          <ArrowBackIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/ajoutPaimentMisison')}
          sx={{ mb: 2 }}
        >
          Ajouter un paiement
        </Button>
        <TextField
          label="Rechercher un paiement"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" variant="h6" align="center">
            {error}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Membre</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Montant Mission</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Mois</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Montant Payer</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Date du Paiement</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Reste à Payer</TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPaiements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((paiement) => (
                  <TableRow key={paiement.id}>
                    <TableCell>{paiement.membre.nom}</TableCell>
                    <TableCell>{paiement.mission.montant} Ar</TableCell>
                    <TableCell>{paiement.mission.mois}</TableCell>
                    <TableCell>{paiement.montant}Ar</TableCell>
                    <TableCell>{new Date(paiement.datePaiement).toLocaleDateString()}</TableCell>
                    <TableCell>{paiement.restePayer}Ar</TableCell>
                    <TableCell>
                      <IconButton  onClick={() => openEditDialog(paiement)}>
                        <Edit color="warning" />
                      </IconButton>
                      <IconButton onClick={() => openDeleteDialog(paiement)}>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPaiements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={editDialogOpen} onClose={closeEditDialog}>
          <DialogTitle>Modifier le Paiement</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="montant"
              label="Montant"
              type="number"
              fullWidth
              value={currentPaiement?.montant || ''}
              onChange={handleInputChange}
            />
            
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog} variant='contained' color='error'>Annuler</Button>
            <Button onClick={handleEditSubmit}  variant='contained' color='primary'>Enregistrer</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
          <DialogTitle>
          <WarningAmberIcon sx={{ color: 'red', marginRight: 2 }} />Supprimer la Mission
          Confirmer la Suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer ce paiement ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteDialog} variant='contained' color='primary'>Annuler</Button>
            <Button onClick={handleDeleteSubmit} variant='contained' color='error'>Supprimer</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant='filled'>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </ThemeProvider>
  );
}

export default PaginatedPaymentList;

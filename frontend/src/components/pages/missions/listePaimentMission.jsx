import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, CircularProgress, Typography,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, IconButton ,Box
} from '@mui/material';
import { Edit, Delete, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaiements = async () => {
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
    
    fetchPaiements();
  }, []);

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
      setPaiements(paiements.map(p => (p.id === currentPaiement.id ? currentPaiement : p)));
      closeEditDialog();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement", error);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/paiementMission/${currentPaiement.id}`);
      setPaiements(paiements.filter(p => p.id !== currentPaiement.id));
      closeDeleteDialog();
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement", error);
    }
  };

  const handleInputChange = (e) => {
    setCurrentPaiement({ ...currentPaiement, [e.target.name]: e.target.value });
  };

  const filteredPaiements = paiements.filter(paiement =>
    paiement.membre.nom.toLowerCase().includes(search.toLowerCase()) ||
    paiement.mission.id.toString().includes(search)
  );

  return (
    <Box sx={{ padding: '-10px', marginTop: '5px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-230px' }}>
      <TextField
        label="Rechercher un paiement"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => navigate('/ajoutPaimentMisison')}
        sx={{ mb: 2 }}
      >
       Ajouter un paiement
      </Button>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper} >
          <Table sx={{ minWidth:950 }}>
            <TableHead>
              <TableRow>
                <TableCell>Membre</TableCell>
                <TableCell>ID de la Mission</TableCell>
                <TableCell>Mois</TableCell>
                <TableCell>Montant Payer</TableCell>
                <TableCell>Date du Paiement</TableCell>
                <TableCell>Reste à Payer</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPaiements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((paiement) => (
                <TableRow key={paiement.id}>
                  <TableCell>{paiement.membre.nom}</TableCell>
                  <TableCell>{paiement.mission.id}</TableCell>
                  <TableCell>{paiement.mission.mois}</TableCell>
                  <TableCell>{paiement.montant}Ar</TableCell>
                  <TableCell>{new Date(paiement.datePaiement).toLocaleDateString()}</TableCell>
                  <TableCell>{paiement.restePayer}Ar</TableCell>
                  <TableCell>
                    <IconButton onClick={() => openEditDialog(paiement)}>
                      <Edit color="primary" />
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

      {/* Dialog de modification */}
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
          <TextField
            margin="dense"
            name="restePayer"
            label="Reste à Payer"
            type="number"
            fullWidth
            value={currentPaiement?.restePayer || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} color="secondary">Annuler</Button>
          <Button onClick={handleEditSubmit} color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirmer la Suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce paiement ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="secondary">Annuler</Button>
          <Button onClick={handleDeleteSubmit} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PaginatedPaymentList;

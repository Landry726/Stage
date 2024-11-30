import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  IconButton,
  Typography,
  TablePagination,  // Importer TablePagination pour la pagination
  DialogTitle as DialogTitleMui,
  DialogContent as DialogContentMui
} from '@mui/material';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';  // Import Toastify pour notifications
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMission, setEditMission] = useState(null);
  const [missionToDelete, setMissionToDelete] = useState(null);  
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  
  // État pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Par défaut 5 missions par page

  // Récupérer la liste des missions depuis l'API
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/missions');
        setMissions(response.data);
      } catch (error) {
        console.error("Erreur de récupération des missions : ", error);
      }
    };

    fetchMissions();
  }, []);

  // Gérer la mise à jour d'une mission
  const handleUpdate = async () => {
    try {
      const { id, membreId, montant, mois } = editMission;
      const response = await axios.put(`http://localhost:3000/api/missions/${id}`, { membreId, montant, mois });
      setMissions(missions.map(mission => (mission.id === id ? response.data : mission)));
      toast.success('Mission mise à jour avec succès');
      setOpenDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la mission');
    }
  };

  // Gérer la suppression d'une mission
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/missions/${missionToDelete.id}`);
      setMissions(missions.filter(mission => mission.id !== missionToDelete.id));
      toast.success('Mission supprimée avec succès');
      setOpenDeleteDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la mission');
    }
  };

  // Ouvrir la boîte de dialogue pour éditer une mission
  const handleOpenDialog = (mission) => {
    setEditMission(mission);
    setOpenDialog(true);
  };

  // Ouvrir la boîte de dialogue pour confirmer la suppression
  const handleOpenDeleteDialog = (mission) => {
    setMissionToDelete(mission);
    setOpenDeleteDialog(true);
  };

  // Fermer la boîte de dialogue d'édition
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMission(null);
  };

  // Fermer la boîte de dialogue de suppression
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMissionToDelete(null);
  };

  // Gérer les changements de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gérer les changements du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Revenir à la première page après le changement du nombre de lignes
  };

  return (
    <Box  sx={{ padding: '-10px', marginTop: '-20px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-230px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#003399' }}>
      Mission
      </Typography>
      <Link to="/ajoutMission">
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: 30 , marginBottom : 20 }}
          startIcon={<AddIcon />}  // Ajouter une icône d'ajout
        >
          Ajouter une Mission
        </Button>
      </Link>
      
      <Link to="/listePaimentMission">
        <Button
          variant="contained"
          color="primary"
          style={{ marginRight: 30 , marginBottom : 20 }}
          startIcon={<ListIcon />}  // Ajouter une icône de liste
        >
          Liste des paiements
        </Button>
      </Link>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Membre</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Montant</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Mois</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {missions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((mission) => (
              <TableRow key={mission.id}>
                <TableCell>{mission.id}</TableCell>
                <TableCell>{mission.membre?.nom || 'Inconue'}</TableCell>
                <TableCell>{mission.montant}</TableCell>
                <TableCell>{mission.mois}</TableCell>
                <TableCell>
                  <IconButton 
                    color="primary" sx={{ color: 'orange' }}
                    onClick={() => handleOpenDialog(mission)} 
                    style={{ marginRight: 10 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleOpenDeleteDialog(mission)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={missions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialog pour l'édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Modifier la Mission</DialogTitle>
        <DialogContent>
          {editMission && (
            <>
              <TextField
                label="Montant"
                type="number"
                fullWidth
                value={editMission.montant || ''}
                onChange={(e) => setEditMission({ ...editMission, montant: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Mois"
                type="month"
                fullWidth
                value={editMission.mois || ''}
                onChange={(e) => setEditMission({ ...editMission, mois: e.target.value })}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Annuler</Button>
          <Button onClick={handleUpdate} color="primary">Mettre à jour</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitleMui>Confirmer la suppression</DialogTitleMui>
        <DialogContentMui>
          <p>Êtes-vous sûr de vouloir supprimer cette mission ?</p>
        </DialogContentMui>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">Annuler</Button>
          <Button onClick={handleDelete} color="secondary">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les alertes */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        message={alert.message}
        severity={alert.severity}
      />
    </Box>
  );
};

export default MissionList;

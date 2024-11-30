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
  TablePagination,
  MenuItem,  // Import MenuItem pour chaque mois
} from '@mui/material';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';  // Import Toastify pour notifications
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const MissionList = () => {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]); // Liste filtrée des missions
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMission, setEditMission] = useState(null);
  const [missionToDelete, setMissionToDelete] = useState(null);  
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Par défaut 5 missions par page

  // Ajout d'un état pour le mois sélectionné
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/missions');
        setMissions(response.data);
        setFilteredMissions(response.data); // Initialiser filteredMissions
      } catch (error) {
        console.error("Erreur de récupération des missions : ", error);
      }
    };

    fetchMissions();
  }, []);

  // Fonction pour gérer le filtrage des missions par mois
  const handleMonthChange = (event) => {
    const selectedMonth = event.target.value;
    setSelectedMonth(selectedMonth);
    
    if (selectedMonth === 'Tous') {
      // Si l'option "Tous" est sélectionnée, afficher toutes les missions
      setFilteredMissions(missions);
    } else {
      // Filtrer les missions par mois sélectionné
      const filtered = missions.filter(mission => mission.mois === selectedMonth);
      setFilteredMissions(filtered);
    }
  };

  const handleUpdate = async () => {
    try {
      const { id, membreId, montant, mois } = editMission;
      const response = await axios.put(`http://localhost:3000/api/missions/${id}`, { membreId, montant, mois });
      setMissions(missions.map(mission => (mission.id === id ? response.data : mission)));
      setFilteredMissions(filteredMissions.map(mission => (mission.id === id ? response.data : mission)));
      toast.success('Mission mise à jour avec succès');
      setOpenDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la mission');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/missions/${missionToDelete.id}`);
      setMissions(missions.filter(mission => mission.id !== missionToDelete.id));
      setFilteredMissions(filteredMissions.filter(mission => mission.id !== missionToDelete.id));
      toast.success('Mission supprimée avec succès');
      setOpenDeleteDialog(false);
    } catch (error) {
      toast.error('Erreur lors de la suppression de la mission');
    }
  };

  const handleOpenDialog = (mission) => {
    setEditMission(mission);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (mission) => {
    setMissionToDelete(mission);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMission(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMissionToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); 
  };

  // Liste des mois
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <Paper elevation={3} sx={{ padding: "15px", marginLeft: '-220px', maxHeight: '100vh', overflowY: 'auto' }}>
      <Link to="/ajoutMission">
        <Button variant="contained" color="primary" style={{ marginRight: 30 , marginBottom : 20 }} startIcon={<AddIcon />}>
          Ajouter une Mission
        </Button>
      </Link>
      <Link to="/listePaimentMission">
        <Button variant="contained" color="primary" style={{ marginRight: 30 , marginBottom : 20 }} startIcon={<ListIcon />}>
          Liste des paiements
        </Button>
      </Link>

      {/* Champ pour sélectionner le mois */}
      <TextField
        label="Filtrer par mois"
        select
        fullWidth
        value={selectedMonth}
        onChange={handleMonthChange}
        sx={{ marginBottom: '16px' }}
      >
        <MenuItem value="Tous">Tous</MenuItem> {/* Option "Tous" */}
        {months.map((mois) => (
          <MenuItem key={mois} value={mois}>
            {mois.charAt(0).toUpperCase() + mois.slice(1)} {/* Mise en majuscule du premier caractère */}
          </MenuItem>
        ))}
      </TextField>

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
            {filteredMissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((mission) => (
              <TableRow key={mission.id}>
                <TableCell>{mission.id}</TableCell>
                <TableCell>{mission.membre?.nom || 'Inconue'}</TableCell>
                <TableCell>{mission.montant}</TableCell>
                <TableCell>{mission.mois}</TableCell>
                <TableCell>
                  <IconButton sx={{ color: 'orange' }} onClick={() => handleOpenDialog(mission)} style={{ marginRight: 10 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleOpenDeleteDialog(mission)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredMissions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Dialog pour modifier une mission */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Modifier la Mission</DialogTitle>
        <DialogContent>
          {editMission && (
            <>
              <TextField
                label="Membre"
                fullWidth
                value={editMission.membreId}
                onChange={(e) => setEditMission({ ...editMission, membreId: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Montant"
                fullWidth
                value={editMission.montant}
                onChange={(e) => setEditMission({ ...editMission, montant: e.target.value })}
                margin="normal"
              />
              <TextField
                label="Mois"
                fullWidth
                value={editMission.mois}
                onChange={(e) => setEditMission({ ...editMission, mois: e.target.value })}
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour la suppression */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Supprimer la Mission</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette mission ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDelete} color="primary">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
        message={alert.message}
        severity={alert.severity}
      />
    </Paper>
  );
};

export default MissionList;

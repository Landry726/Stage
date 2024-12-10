import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const SimpleTable = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user/');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    const user = data.find((u) => u.id === id);
    setCurrentUser(user);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setCurrentUser(null);
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      });

      if (response.ok) {
        setSnackbarMessage('Utilisateur modifié avec succès.');
        setSnackbarSeverity('success');
        fetchData();
      } else {
        setSnackbarMessage("Échec de la modification de l'utilisateur.");
        setSnackbarSeverity('error');
      }
    } catch (error) {
      setSnackbarMessage("Erreur lors de la modification de l'utilisateur.");
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    handleEditClose();
  };

  const handleDelete = (id) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${userToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbarMessage('Utilisateur supprimé avec succès.');
        setSnackbarSeverity('success');
        fetchData();
      } else {
        setSnackbarMessage("Échec de la suppression de l'utilisateur.");
        setSnackbarSeverity('error');
      }
    } catch (error) {
      setSnackbarMessage("Erreur lors de la suppression de l'utilisateur.");
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    handleDeleteClose();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper elevation={3}sx={{
      padding: "10px",
      marginLeft:  '-220px',
      maxHeight: '100vh',
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      overflowY: 'auto'
    }}>
      <TableContainer component={Paper} >
        <Table>
          <TableHead sx={{ backgroundColor: '#003399' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleEdit(row.id)} sx={{ color: 'orange' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(row.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Edit Modal */}
      <Modal open={editModalOpen} onClose={handleEditClose}>
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 4,
            width: { xs: '90%', sm: 400 },
            margin: 'auto',
            marginTop: '15%',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6">Modifier l'utilisateur</Typography>
          <TextField
            label="Nom"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentUser?.username || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, username: e.target.value })}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentUser?.email || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <Button onClick={handleEditClose} variant='contained' color='error'>
              Annuler
            </Button>
            <Button onClick={handleEditSave} variant='contained' color='primary'>
              Enregistrer
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>
          <WarningAmberIcon sx={{ color: 'red', marginRight: 1 }} />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} variant='contained' color='primary'>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} variant='contained' color='error'>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} variant="filled" severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SimpleTable;

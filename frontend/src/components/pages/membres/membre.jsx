import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    IconButton,
    Button,
    TablePagination,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
    Box,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';

const MembersTable = () => {
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [open, setOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            setFilteredMembers(
                members.filter((member) =>
                    member.nom.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        } else {
            setFilteredMembers(members);
        }
    }, [searchQuery, members]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/membres');
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }
            const data = await response.json();
            setMembers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (member) => {
        setCurrentMember(member);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentMember(null);
    };

    const handleUpdateMember = async () => {
        try {
            await fetch(`http://localhost:3000/api/membres/${currentMember.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentMember),
            });
            showSnackbar('Membre mis à jour avec succès.', 'success');
            handleClose();
            fetchMembers();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            showSnackbar('Erreur lors de la mise à jour.', 'error');
        }
    };

    const handleDeleteMember = async () => {
        try {
            await fetch(`http://localhost:3000/api/membres/${memberToDelete.id}`, {
                method: 'DELETE',
            });
            showSnackbar('Membre supprimé avec succès.', 'success');
            setConfirmDelete(false);
            fetchMembers();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            showSnackbar('Erreur lors de la suppression.', 'error');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDeleteConfirmation = (member) => {
        setMemberToDelete(member);
        setConfirmDelete(true);
    };

    const handleCloseDeleteConfirmation = () => {
        setConfirmDelete(false);
        setMemberToDelete(null);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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
                    Erreur: {error}
                </Typography>
            </Box>
        );
    }

    const columns = [
        { id: 'id', label: 'ID', show: !isSmallScreen },
        { id: 'nom', label: 'Nom', show: true },
        { id: 'poste', label: 'Poste', show: !isSmallScreen },
        { id: 'email', label: 'Email', show: !isMediumScreen },
        { id: 'actions', label: 'Actions', show: true },
    ];

    return (
        <Paper elevation={3}sx={{
            padding: "10px",
            marginLeft:  '-220px',
            maxHeight: '100vh',
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            overflowY: 'auto'
          }}>
            <Link to="/ajoutMembre" style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2 }}>
                    Ajouter membre
                </Button>
            </Link>
            <TextField
                label="Rechercher par nom"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={searchQuery}
                onChange={handleSearchChange}
            />

            <TableContainer>
                <Table>
                    <TableHead sx={{ backgroundColor: '#003399' }}>
                        <TableRow>
                            {columns.map(
                                (column) =>
                                    column.show && (
                                        <TableCell key={column.id} sx={{ color: 'white', fontWeight: 'bold' }}>
                                            {column.label}
                                        </TableCell>
                                    )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((member) => (
                                <TableRow key={member.id}>
                                    {columns.map((column) => {
                                        if (!column.show) return null;

                                        if (column.id === 'actions') {
                                            return (
                                                <TableCell key={column.id}>
                                                    <IconButton
                                                       sx={{ color: 'orange' }}
                                                        onClick={() => handleOpen(member)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            handleOpenDeleteConfirmation(member)
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            );
                                        }

                                        return (
                                            <TableCell key={column.id}>
                                                {member[column.id]}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredMembers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Modifier Membre</DialogTitle>
                <DialogContent>
                    <DialogContentText>Modifiez les informations du membre :</DialogContentText>
                    <TextField
                        label="Nom"
                        fullWidth
                        value={currentMember ? currentMember.nom : ''}
                        onChange={(e) =>
                            setCurrentMember({ ...currentMember, nom: e.target.value })
                        }
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Poste"
                        fullWidth
                        value={currentMember ? currentMember.poste : ''}
                        onChange={(e) =>
                            setCurrentMember({ ...currentMember, poste: e.target.value })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant='contained' color='error'>
                        Annuler
                    </Button>
                    <Button onClick={handleUpdateMember} variant='contained' color='primary'>
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDelete} onClose={handleCloseDeleteConfirmation}>
                <DialogTitle>
                <WarningAmberIcon sx={{ color: 'red', marginRight: 2 }} />
                Confirmer la suppression
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer ce membre ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirmation} variant='contained' color='primary'>
                        Annuler
                    </Button>
                    <Button onClick={handleDeleteMember} variant='contained' color='error'>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                    
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default MembersTable;

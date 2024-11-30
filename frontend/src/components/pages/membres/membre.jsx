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
} from '@mui/material';
import { Link } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        // Filtrer les membres en fonction de la requête de recherche
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
            toast.success('Membre mis à jour avec succès.');
            handleClose();
            fetchMembers(); // Recharger la liste des membres
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            toast.error('Erreur lors de la mise à jour.');
        }
    };

    const handleDeleteMember = async () => {
        try {
            await fetch(`http://localhost:3000/api/membres/${memberToDelete.id}`, {
                method: 'DELETE',
            });
            toast.success('Membre supprimé avec succès.');
            setConfirmDelete(false);
            fetchMembers(); // Recharger la liste des membres
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            toast.error('Erreur lors de la suppression.');
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

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

    return (
        <Paper sx={{ padding: '-10px', marginTop: '5px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-230px' }}>
            <Typography  variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#003399' }}>
                Membre
            </Typography>
           <Link to="/ajoutMembre">
                <Button variant="contained" color="primary" sx={{ marginBottom: '10px' }} startIcon={<AddIcon />}>
                    Ajouter membre
                </Button>
            </Link>


            {/* Champ de recherche */}
            <TextField
                label="Rechercher par nom"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={handleSearchChange}
            />

            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader sx={{ minWidth: 650 }}>
                    <TableHead >
                        <TableRow>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>ID</TableCell>
                            <TableCell sx={{color: 'white' , backgroundColor: '#003399' }}>Nom</TableCell>
                            <TableCell sx={{color: 'white' , backgroundColor: '#003399' }}>Poste</TableCell>
                            <TableCell sx={{ color: 'white' ,backgroundColor: '#003399' }}>Email</TableCell>
                            <TableCell sx={{ color: 'white' ,backgroundColor: '#003399' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredMembers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.id}</TableCell>
                                    <TableCell>{member.nom}</TableCell>
                                    <TableCell>{member.poste}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleOpen(member)}
                                            color="primary"
                                            aria-label="modifier"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleOpenDeleteConfirmation(member)}
                                            color="secondary"
                                            aria-label="supprimer"
                                        >
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
                count={filteredMembers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Modal pour la mise à jour */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Modifier Membre</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Veuillez mettre à jour les informations du membre.
                    </DialogContentText>
                    <TextField
                        label="Nom"
                        value={currentMember?.nom || ''}
                        onChange={(e) => setCurrentMember({ ...currentMember, nom: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Poste"
                        value={currentMember?.poste || ''}
                        onChange={(e) => setCurrentMember({ ...currentMember, poste: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        value={currentMember?.email || ''}
                        onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleUpdateMember} color="primary">
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation de suppression */}
            <Dialog open={confirmDelete} onClose={handleCloseDeleteConfirmation}>
                <DialogTitle>Confirmer la Suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer {memberToDelete?.nom} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirmation} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={handleDeleteMember} color="secondary">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Toastify pour les notifications */}
            <ToastContainer />
        </Paper>
    );
};

export default MembersTable;

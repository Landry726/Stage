// frontend/src/components/pages/membres/ajoutMembre.jsx
import React, { useState } from 'react';
import {
    Button,
    TextField,
    Snackbar,
    IconButton,
    Grid,
    Typography,
    Container,
} from '@mui/material';
import { Person, Work, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Importez useNavigate

const AjoutMembre = () => {
    const [newMember, setNewMember] = useState({ nom: '', poste: '', email: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [errors, setErrors] = useState({ nom: '', poste: '', email: '' });
    const navigate = useNavigate(); // Initialisez useNavigate

    const validateForm = () => {
        let tempErrors = { nom: '', poste: '', email: '' };
        let isValid = true;

        if (!newMember.nom) {
            tempErrors.nom = 'Le nom est requis.';
            isValid = false;
        }
        if (!newMember.poste) {
            tempErrors.poste = 'Le poste est requis.';
            isValid = false;
        }
        if (!newMember.email) {
            tempErrors.email = 'L\'email est requis.';
        } else if (!/\S+@\S+\.\S+/.test(newMember.email)) {
            tempErrors.email = 'L\'email est invalide.';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleAddMember = async () => {
        if (!validateForm()) return;

        try {
            const response = await fetch('http://localhost:3000/api/membres', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMember),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout du membre');
            }

            setSnackbarMessage('Membre ajouté avec succès.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            // Réinitialiser le formulaire
            setNewMember({ nom: '', poste: '', email: '' });
            setErrors({ nom: '', poste: '', email: '' });
            
            // Rediriger vers la liste des membres après un ajout réussi
            setTimeout(() => {
                navigate('/membres'); // Remplacez '/membres' par le chemin correct de votre liste de membres
            }, 1000); // Attendre 1 seconde avant de rediriger
        } catch (error) {
            setSnackbarMessage('Erreur lors de l\'ajout : ' + error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '20px' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Ajouter un Membre
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Nom"
                        value={newMember.nom}
                        onChange={(e) => setNewMember({ ...newMember, nom: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={!!errors.nom}
                        helperText={errors.nom}
                        InputProps={{
                            startAdornment: (
                                <IconButton position="start">
                                    <Person />
                                </IconButton>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Poste"
                        value={newMember.poste}
                        onChange={(e) => setNewMember({ ...newMember, poste: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={!!errors.poste}
                        helperText={errors.poste}
                        InputProps={{
                            startAdornment: (
                                <IconButton position="start">
                                    <Work />
                                </IconButton>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        fullWidth
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email}
                        InputProps={{
                            startAdornment: (
                                <IconButton position="start">
                                    <Email />
                                </IconButton>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" onClick={handleAddMember} fullWidth>
                        Ajouter
                    </Button>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ backgroundColor: snackbarSeverity === 'success' ? 'green' : 'red' }} // Changez la couleur ici
            />
        </Container>
    );
};

export default AjoutMembre;

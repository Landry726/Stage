import React, { useState } from 'react';
import {
    Button,
    TextField,
    Snackbar,
    IconButton,
    Grid,
    Typography,
    Container,
    Paper,
    Box,
    Alert,
} from '@mui/material';
import { Person, Work, Email, ArrowBack, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AjoutMembre = () => {
    const [newMember, setNewMember] = useState({ nom: '', poste: '', email: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [errors, setErrors] = useState({ nom: '', poste: '', email: '' });
    const navigate = useNavigate();

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
    
            // Vérifier si la réponse est OK
            if (!response.ok) {
                const errorData = await response.json();
                // Si le serveur renvoie une erreur liée à un membre existant (par exemple, email déjà pris)
                throw new Error(errorData.error || 'Erreur lors de l\'ajout du membre');
            }
    
            setSnackbarMessage('Membre ajouté avec succès.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
    
            // Réinitialiser le formulaire
            setNewMember({ nom: '', poste: '', email: '' });
            setErrors({ nom: '', poste: '', email: '' });
    
            // Rediriger vers la liste des membres après un ajout réussi
            setTimeout(() => {
                navigate('/membres');
            }, 1000);
        } catch (error) {
            setSnackbarMessage(`Erreur lors de l'ajout : ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };
    

    const handleCancel = () => {
        navigate('/membres');
    };

    return (
        <Container maxWidth="md" sx={{ paddingTop: 4 }}>
            <Box
                elevation={3}
                sx={{
                    maxWidth: 800,
                    margin: '30px',
                    padding: 5,
                    boxShadow: 5,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton onClick={handleCancel} sx={{ mr: 1, color: 'primary.main' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Ajouter Membre
                    </Typography>
                </Box>
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
                            variant="outlined"
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
                            variant="outlined"
                            size="medium"
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
                            variant="outlined"
                            sx={{ mb: 3 }}
                        />
                    </Grid>
                    <Button variant="contained" color="primary" onClick={handleAddMember} fullWidth>
                        Ajouter
                    </Button>
                </Grid>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                      variant='filled'

                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AjoutMembre;

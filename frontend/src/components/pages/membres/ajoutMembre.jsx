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
    const handleCancel = () => {
        navigate('/membres'); // Retourner à la liste des cotisations
    };

    return (
        <Container maxWidth="md" sx={{ paddingTop: 4  }}>
            <Paper  elevation={3}
                sx={{
                    padding: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    mr : 5,
                    marginLeft : -20,
                }}>
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
                            variant="outlined"
                            size="medium"  // Agrandit le champ de texte
                            style={{
                                marginBottom: '20px', 

                                borderRadius: '10px',  // Coins arrondis
                            }} // Espacement sous le champ
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
                            size="medium" // Agrandit le champ de texte
                            style={{
                                marginBottom: '20px',
                                borderRadius: '10px',  // Coins arrondis
                            }} // Espacement sous le champ
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
                            size="medium" // Agrandit le champ de texte
                            style={{
                                marginBottom: '20px',
                                borderRadius: '10px',  // Coins arrondis
                            }} // Espacement sous le champ
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                fullWidth
                                sx={{
                                    padding: '12px',
                                    backgroundColor: '#ff4d4d',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    border: '1px solid #cc0000',
                                    '&:hover': {
                                        backgroundColor: '#cc0000',
                                    },
                                }}
                            >
                                Annuler
                            </Button>
                        </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button variant="contained" color="primary" onClick={handleAddMember} sx={{
                                    padding: '12px',
                                    background: 'linear-gradient(to right, #007bff, #0056b3)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    border: '1px solid #0056b3',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #0056b3, #004494)',
                                    },
                                }} fullWidth>
                            Ajouter
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
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

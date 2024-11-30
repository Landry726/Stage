import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Typography,
    Container,
    Grid,
    InputAdornment,
} from '@mui/material';
import { AccountCircle, MonetizationOn, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection
import { ToastContainer, toast } from 'react-toastify'; // Importer ToastContainer et toast
import 'react-toastify/dist/ReactToastify.css'; // Importer le style de Toastify

function CotisationForm() {
    const [membreId, setMembreId] = useState('');
    const [montant, setMontant] = useState('');
    const [mois, setMois] = useState('');
    const [datePaiement, setDatePaiement] = useState('');
    const [status, setStatus] = useState('');
    const [membres, setMembres] = useState([]);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); // Initialiser useNavigate pour la redirection

    // Récupérer la liste des membres
    useEffect(() => {
        const fetchMembres = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/membres');
                const data = await response.json();
                setMembres(data);
            } catch (error) {
                toast.error('Erreur lors de la récupération des membres');
            }
        };
        fetchMembres();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!membreId) newErrors.membreId = 'Membre est requis';
        if (!montant) newErrors.montant = 'Montant est requis';
        if (!mois) newErrors.mois = 'Mois est requis';
        if (!datePaiement) newErrors.datePaiement = 'Date de paiement est requise';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Retourne true si pas d'erreur
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return; // Si le formulaire est invalide, ne pas envoyer

        const data = {
            membreId: parseInt(membreId),
            montant: parseFloat(montant),
            mois,
            datePaiement,
            status,
        };

        try {
            const response = await fetch('http://localhost:3000/api/cotisations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Erreur lors de l’ajout de la cotisation');

            toast.success('Cotisation ajoutée avec succès !');
            
            // Réinitialiser les champs
            setMembreId('');
            setMontant('');
            setMois('');
            setDatePaiement('');
            setStatus('');

            // Rediriger vers la liste des cotisations après une courte pause pour afficher le message
            setTimeout(() => {
                navigate('/cotisation'); // Remplacez '/cotisations' par le chemin de votre page de liste
            }, 2000);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ backgroundColor: 'white', borderRadius: 2 , marginLeft : '-220px' , maxHeight : '100vh' ,width : '100vh'}}>
            <Typography variant="h4" gutterBottom align="left">
                Ajouter un paiement
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Membre"
                            value={membreId}
                            onChange={(e) => setMembreId(e.target.value)}
                            fullWidth
                            required
                            error={!!errors.membreId}
                            helperText={errors.membreId}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="">
                                <em>Sélectionnez un membre</em>
                            </MenuItem>
                            {membres.map((membre) => (
                                <MenuItem key={membre.id} value={membre.id}>
                                    {membre.nom}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Montant"
                            type="number"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value)}
                            fullWidth
                            required
                            error={!!errors.montant}
                            helperText={errors.montant}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MonetizationOn />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Mois"
                            value={mois}
                            onChange={(e) => setMois(e.target.value)}
                            fullWidth
                            required
                            error={!!errors.mois}
                            helperText={errors.mois}
                        >
                            <MenuItem value="">
                                <em>Sélectionnez un mois</em>
                            </MenuItem>
                            {Array.from({ length: 12 }, (_, i) => (
                                <MenuItem key={i + 1} value={`${i + 1}`}>
                                    {new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(0, i))}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Date de Paiement"
                            type="date"
                            value={datePaiement}
                            onChange={(e) => setDatePaiement(e.target.value)}
                            fullWidth
                            required
                            error={!!errors.datePaiement}
                            helperText={errors.datePaiement}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarToday />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                            Ajouter
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <ToastContainer /> {/* Assurez-vous d'ajouter ToastContainer ici */}
        </Container>
    );
}

export default CotisationForm;

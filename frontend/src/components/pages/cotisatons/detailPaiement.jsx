import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // Import useNavigate
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import ArrowBackIcon

const DetailPaiement = () => {
    const { id } = useParams();  // Récupère l'ID depuis l'URL
    const [paiements, setPaiements] = useState([]);
    const navigate = useNavigate(); // Initialize the navigate function

    useEffect(() => {
        if (id) {
            fetchPaiements(id);
        }
    }, [id]);

    const fetchPaiements = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/cotisations/membres/${id}/mois`);
            const data = await response.json();

            if (Array.isArray(data)) {
                setPaiements(data);
            } else {
                console.error('Erreur de données:', data);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements:', error);
        }
    };

    const handleBack = () => {
        navigate('/cotisation'); // Redirect to the Cotisation List page
    };

    return (
        <Paper sx={{ padding: '15px', marginTop: '10px', maxHeight: '100vh', overflowY: 'auto', marginLeft: '-220px' }}>
            <IconButton onClick={handleBack} sx={{ marginBottom: '20px', color: 'primary.main' }}>
                <ArrowBackIcon /> {/* Back Icon */}
            </IconButton>
            <Typography variant="h5" sx={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
                Paiements Membre
            </Typography>
            <TableContainer sx={{ maxHeight: 500 }}>
                <Table sx={{ minWidth: 650, borderCollapse: 'collapse' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Mois</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Montant</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Date de Paiement</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Nom du Membre</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paiements.length > 0 ? (
                            paiements.map((paiement, index) => (
                                <TableRow key={index}>
                                    <TableCell>{paiement.mois}</TableCell>
                                    <TableCell>{paiement.montant}</TableCell>
                                    <TableCell>{new Date(paiement.datePaiement).toLocaleDateString()}</TableCell>
                                    <TableCell>{paiement.membre.nom}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4}>Aucun paiement trouvé</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DetailPaiement;

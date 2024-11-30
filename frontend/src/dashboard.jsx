import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardCard = ({ icon, title, value, color, loading = false }) => {
    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: 3,
                marginBottom: 2,
                marginRight: 2,
                flex: 1,
                minWidth: '200px',
                '@media (max-width:600px)': {
                    minWidth: '100%',  // Full width on mobile
                },
            }}
        >
            <Box sx={{ marginRight: 2, color: color }}>
                {loading ? <Skeleton variant="circular" width={40} height={40} /> : icon}
            </Box>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton width="60%" height={20} />
                        <Skeleton width="40%" height={30} />
                    </>
                ) : (
                    <>
                        <Typography variant="subtitle1" color="textSecondary">
                            {title}
                        </Typography>
                        <Typography variant="h5" sx={{ color: color }}>
                            {value}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const [totalCaisses, setTotalCaisses] = useState(0);
    const [totalSorties, setTotalSorties] = useState(0);
    const [totalEntrees, setTotalEntrees] = useState(0);
    const [totalMembres, setTotalMembres] = useState(0);
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState([]);

    useEffect(() => {
        const fetchTotals = async () => {
            try {
                setLoading(true);

                const caissesResponse = await axios.get('http://localhost:3000/api/caisse/total');
                setTotalCaisses(caissesResponse.data.totalCaisses || 0);

                const sortiesResponse = await axios.get('http://localhost:3000/api/sortie/total');
                setTotalSorties(sortiesResponse.data.totalSortie || 0);

                const entreesResponse = await axios.get('http://localhost:3000/api/entree/total');
                setTotalEntrees(entreesResponse.data.totalEntree || 0);

                const membresResponse = await axios.get('http://localhost:3000/api/membres/count');
                setTotalMembres(membresResponse.data.totalMembres || 0);

                const trendsResponse = await axios.get('http://localhost:3000/api/caisse/trends');
                const trends = Array.isArray(trendsResponse.data) ? trendsResponse.data : [];
                setTrendData(trends);

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement des données :', error);
                setLoading(false);
            }
        };

        fetchTotals();
    }, []);

    const chartData = Array.isArray(trendData)
        ? trendData.map((item) => ({
            mois: item.mois,
            entrees: item.entrees || 0,
            sorties: item.sorties || 0,
        }))
        : [];

    return (
        <Box sx={{ padding: 3 }}>
            {/* Cartes des totaux */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                    '@media (max-width: 600px)': {
                        justifyContent: 'center', // Center on mobile
                    },
                }}
            >
                <DashboardCard
                    icon={<AccountBalanceIcon />}
                    title="Total Caisse"
                    value={totalCaisses + ' Ar'} 
                    color="#1976d2"
                    loading={loading}
                />
                <DashboardCard
                    icon={<TrendingUpIcon />}
                    title="Total Entrées"
                    value={totalEntrees + ' Ar'} 
                    color="#4caf50"
                    loading={loading}
                />
                <DashboardCard
                    icon={<TrendingDownIcon />}
                    title="Total Sorties"
                    value={totalSorties + ' Ar' }
                    color="#f44336"
                    loading={loading}
                />
                <DashboardCard
                    icon={<GroupIcon />}
                    title="Total Membres"
                    value={totalMembres}
                    color="#ff9800"
                    loading={loading}
                />
            </Box>

            {/* Graphique des tendances */}
            <Card
                sx={{
                    padding: 2,
                    backgroundColor: '#f4f6f8',
                    borderRadius: 2,
                    boxShadow: 3,
                    marginTop: 3,
                }}
            >
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Tendances des Entrées et Sorties par Mois
                    </Typography>
                    {loading ? (
                        <Skeleton variant="rectangular" height={200} />
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ fontSize: 12 }} />
                                <Legend verticalAlign="top" height={36} />
                                <Line
                                    type="monotone"
                                    dataKey="entrees"
                                    stroke="#4caf50"
                                    fill="#4caf50"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="sorties"
                                    stroke="#f44336"
                                    fill="#f44336"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Dashboard;

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import userLogo from '../../assets/images/logoFID.png';
import DashboardIcon from '@mui/icons-material/Dashboard';

const drawerWidthOpen = 230; // Largeur du Drawer lorsqu'il est ouvert
const drawerWidthClosed = 60; // Largeur du Drawer lorsqu'il est réduit

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    window.location.href = '/'; // Redirection après déconnexion
  };

  const menuItems = [
    { text: 'Tableaux de bord', icon: <DashboardIcon />, route: '/dashboard' },
    { text: 'Utilisateur', icon: <PersonIcon />, route: '/users' },
    { text: 'Membres', icon: <GroupIcon />, route: '/membres' },
    { text: 'Mission', icon: <FlightTakeoffIcon />, route: '/mission' },
    { text: 'Cotisation', icon: <AccountBalanceIcon />, route: '/cotisation' },
    { text: 'Solde Entrée', icon: <MonetizationOnIcon />, route: '/Entree' },
    { text: 'Solde Sortie', icon: <AttachMoneyIcon />, route: '/Sortie' },
    { text: 'Caisse Sociale', icon: <LocalAtmIcon />, route: '/Caisse' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        style={{ background: '#FFD700' }}
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 2 }}>
            <img src={userLogo} alt="User Logo" style={{ width: 150, marginRight: 50 }} />
          </Box>
          <IconButton color="inherit" aria-label="profile" onClick={handleProfileMenuOpen}>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
            <MenuItem onClick={handleProfileMenuClose}>Profil</MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <ExitToAppIcon sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: open ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidthOpen : drawerWidthClosed,
            boxSizing: 'border-box',
            backgroundColor: '#003399',
            color: 'white',
            transition: 'width 0.3s ease',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <Tooltip title={open ? '' : item.text} placement="right" key={index}>
              <ListItem
                component={Link}
                to={item.route}
                button
                sx={{
                  '&:hover': {
                    backgroundColor: '#0056b3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                    marginRight: open ? 2 : 0,
                  },
                  '& .MuiListItemText-primary': {
                    display: open ? 'block' : 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: 'white',
                    fontFamily: 'Arial, sans-serif',
                    letterSpacing: '0.5px',
                  },
                }}
              >
                {item.icon}
                <ListItemText primary={item.text} />
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Dialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Voulez-vous vraiment vous déconnecter ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={confirmLogout} color="error" autoFocus>
            Déconnexion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;

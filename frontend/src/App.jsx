// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';  // Importez ToastContainer et toast
import 'react-toastify/dist/ReactToastify.css';  // Importez le CSS de react-toastify

import Login from './components/Auth/login';
import Register from './components/Auth/register';
import Dashboard from './dashboard';
import User from './components/pages/users/user'; 
import Layout from './components/Nav/layout';
import Membre from './components/pages/membres/membre';
import AjoutMembre from './components/pages/membres/ajoutMembre';
import AjoutCotisation from './components/pages/cotisatons/ajoutCotisation';
import Cotisation from './components/pages/cotisatons/cotisation';
import Mission from './components/pages/missions/mission';
import AjoutMission from './components/pages/missions/ajouterMission';
import AjoutPaimentMisison from './components/pages/missions/ajouterPaiementMission';
import ListePaiement from './components/pages/missions/listePaimentMission';
import AjoutEntree from './components/pages/caisse/entree/ajoutEntree';
import AjoutSortie from './components/pages/caisse/sortie/ajoutSortie';
import Sortie from './components/pages/caisse/sortie/sortie';
import Entree from './components/pages/caisse/entree/entree';
import Caiise from './components/pages/caisse/caisse';

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/users" element={<Layout><User /></Layout>} />
        <Route path='/membres' element={<Layout><Membre/></Layout>}></Route>
        <Route path='/ajoutMembre' element={<Layout><AjoutMembre/></Layout>}></Route>
        <Route path='/ajoutCotisation' element={<Layout><AjoutCotisation/></Layout>}></Route>
        <Route path='/cotisation' element={<Layout><Cotisation/></Layout>}></Route>
        <Route path='/mission' element={<Layout><Mission/></Layout>}></Route>
        <Route path='/ajoutMission' element={<Layout><AjoutMission/></Layout>}></Route>
        <Route path='/ajoutPaimentMisison' element={<Layout><AjoutPaimentMisison/></Layout>}></Route>
        <Route path='/listePaimentMission' element = {<Layout><ListePaiement/></Layout>}></Route>
        <Route path='/AjoutEntree' element = {<Layout><AjoutEntree/></Layout>}></Route>
        <Route path='/AjoutSortie' element = {<Layout><AjoutSortie/></Layout>}></Route>
        <Route path='/Sortie' element = {<Layout><Sortie/></Layout>}></Route>
        <Route path='/Entree' element = {<Layout><Entree/></Layout>}></Route>
        <Route path='/Caisse' element = {<Layout><Caiise/></Layout>}></Route>
        {/* Ajoutez d'autres routes ici */}
      </Routes>
      
      {/* Container pour les toasts */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Router>
  );
};

export default App;

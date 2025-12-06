// pages/Dashboard.js - AVEC ICÔNES
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import "../styles/Dashboard.css";

const Dashboard = () => {
  const serviceBoxes = [
    {
      id: 'profile',
      title: 'Mon Profile',
      description: 'Modifier votre profil',
      path: '/profile',
      icon: 'fas fa-user'
    },
    {
      id: 'todo',
      title: 'To-Do List',
      description: 'Gérer vos tâches',
      path: '/todo',
      icon: 'fas fa-tasks'
    },
    {
      id: 'service',
      title: 'Mes Services',
      description: 'Gérer vos services',
      path: '/services',
      icon: 'fas fa-concierge-bell'
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Trouver des projets',
      path: '/marketplace',
      icon: 'fas fa-store'
    },
    {
      id: 'orders',
      title: 'Mes Commandes',
      description: 'Voir vos commandes',
      path: '/orders',
      icon: 'fas fa-shopping-bag'
    },
    {
      id: 'review',
      title: 'Avis & Notes',
      description: 'Consulter vos avis',
      path: '/reviews',
      icon: 'fas fa-star'
    },
    {
      id: 'messenger',
      title: 'Messagerie',
      description: 'Gérer vos conversations',
      path: '/messenger',
      icon: 'fas fa-comments'
    }
  ];

  const handleBoxClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      
      <div className="ag-format-container">
        <div className="ag-courses_box">
          {serviceBoxes.map((box) => (
            <div key={box.id} className="ag-courses_item">
              <a 
                href="#" 
                className="ag-courses-item_link"
                onClick={(e) => {
                  e.preventDefault();
                  handleBoxClick(box.path);
                }}
              >
                <div className="ag-courses-item_bg"></div>
                
                <div className="ag-courses-item_title">
                  <i className={box.icon}></i>
                  {box.title}
                </div>

                <div className="ag-courses-item_date-box">
                  <i className="fas fa-info-circle"></i>
                  Description:
                  <span className="ag-courses-item_date">
                    {box.description}
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
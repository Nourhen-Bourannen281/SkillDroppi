// components/Sidebar.js - VERSION AMÉLIORÉE
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      {/* Particules de fond */}
      <div className="sidebar-particles">
        <div className="sidebar-particle"></div>
        <div className="sidebar-particle"></div>
        <div className="sidebar-particle"></div>
        <div className="sidebar-particle"></div>
        <div className="sidebar-particle"></div>
      </div>
      
      
      <nav>
        <NavLink to="/dashboard" activeclassname="active">
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/profile" activeclassname="active">
          <i className="fas fa-user"></i>
          <span>Profile</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/todo" activeclassname="active">
          <i className="fas fa-tasks"></i>
          <span>Todo</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/services" activeclassname="active">
          <i className="fas fa-concierge-bell"></i>
          <span>Services</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/orders" activeclassname="active">
          <i className="fas fa-shopping-bag"></i>
          <span>Orders</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/reviews" activeclassname="active">
          <i className="fas fa-star"></i>
          <span>Reviews</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/messenger" activeclassname="active">
          <i className="fas fa-comments"></i>
          <span>Messenger</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
        <NavLink to="/marketplace" activeclassname="active">
          <i className="fas fa-store"></i>
          <span>Marketplace</span>
          <div className="hover-light"></div>
          <div className="active-indicator"></div>
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
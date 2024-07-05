import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from '../config/firebase.config';
import { AuthContext } from './AuthProvider';

import '../Common.css';


export function Login() {
    const { user, setUser } = useContext(AuthContext);
    let location = useLocation();
    let from = location.state?.from?.pathname || "/account";

    const handleLogin = async () => {
        await signInWithPopup(auth, googleProvider).then((result) => {
            <Navigate to={from} replace />;
        }).catch((error) => {
            console.error("Login failed:", error);
        });
    }

    if (user) {
        console.log("User: ", user);
        return <Navigate to={from} replace />;
    }

    return (
        <div>
            <h1>Login to see your cards!</h1>
            <div className='card3'>
                <button onClick={handleLogin} className="login-button">Login with Google</button>
                <br />
                <button className="login-button">Login with Github</button>
            </div>
        </div>
    );
}

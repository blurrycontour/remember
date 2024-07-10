import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from '../config/firebase.config';
import { AuthContext } from './AuthProvider';

import '../css/Common.css';
import '../css/Button.css';


export function Login() {
    const { user } = useContext(AuthContext);
    let location = useLocation();
    let from = location.state?.from?.pathname || "/account";

    const API_URL = '/api';

    const informUserLogin = async (token) => {
        await axios.post(`${API_URL}/account/user`, {}, { headers: { "Authorization": `Bearer ${token}` } });
    };

    const handleLogin = async (provider) => {
        await signInWithPopup(auth, provider).then((result) => {
            informUserLogin(result.user.accessToken);
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
                <button onClick={() => handleLogin(googleProvider)} className="login-button">Login with Google</button>
                <br />
                <button onClick={() => handleLogin(githubProvider)} className="login-button">Login with Github</button>
            </div>
        </div>
    );
}

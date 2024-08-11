import React, { useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from '../config/firebase.config';
import { AuthContext } from './AuthProvider';
import { CheckAndSetDarkMode, SetAxiosRetry } from '../core/Utils';
import { GoogleLoginButton, GithubLoginButton } from "react-social-login-buttons";

import logo from '../logo192.png';


SetAxiosRetry();

export function Login()
{
    const { user } = useContext(AuthContext);
    let location = useLocation();
    let from = location.state?.from?.pathname || "/account";

    const API_URL = process.env.REACT_APP_API_URL;


    const informUserLogin = async (token) =>
    {
        await axios.post(`${API_URL}/account/user`, {}, { headers:
            {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": true,
                "disable-tunnel-reminder": true,
                "localtonet-skip-warning": true
            }
        });
    };

    const handleLogin = async (provider) =>
    {
        await signInWithPopup(auth, provider).then((result) =>
        {
            informUserLogin(result.user.accessToken);
            <Navigate to={from} replace />;
        }).catch((error) =>
        {
            console.error("Login failed:", error);
        });
    }

    useEffect(() =>
    {
        CheckAndSetDarkMode();
        // eslint-disable-next-line
    }, []);

    if (user)
    {
        console.log(user);
        return <Navigate to={from} replace />;
    }

    return (
        <div className='login-container'>
            <div className='card2' style={{ alignItems: 'center' }}>
                <img src={logo} alt="remember-logo" className="user-photo" />
                <h1>&nbsp;Remember</h1>
            </div>
            <h2 style={{ textAlign: 'center', margin: '5px' }}>Login to see your cards!</h2>
            <div className='transparent-card'>
                <GoogleLoginButton onClick={() => handleLogin(googleProvider)} className="login-button">
                    <span>Login with Google</span>
                </GoogleLoginButton>
                <br />
                <GithubLoginButton onClick={() => handleLogin(githubProvider)} className="login-button">
                    <span>Login with GitHub</span>
                </GithubLoginButton>
            </div>
        </div>
    );
}

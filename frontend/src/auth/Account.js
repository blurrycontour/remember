import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './AuthProvider';
import axios from 'axios';
import { SetAxiosDefaults } from '../core/Utils';

import '../css/Common.css';
import '../css/Button.css';


export function Account()
{
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const API_URL = '/api';

    SetAxiosDefaults();

    const handleLogout = () =>
    {
        user.auth.signOut();
    }

    const fetchStats = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/account/stats`);
            setStats(response.data);
        } catch (error)
        {
            console.error(error);
        }
    };

    useEffect(() =>
    {
        fetchStats();
    }, []);

    return (
        <div>
            <div className='card2'>
                <div className='header'>
                    <div className='back-button'>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <h1>Welcome!</h1>
                </div>
            </div>
            <div className='card3'>
                <h2>{user.displayName}</h2>
                {user.photoURL && <img src={user.photoURL} alt='User Photo' style={{ width: '100px', height: '100px', borderRadius: '50%' }} />}
                <h3>{user.email}</h3>
                <button onClick={handleLogout} className='login-button'>Log out</button>
            </div>

            {!!stats && <div className='card3'>
                <h2 style={{ margin: '0.5em' }}>Statistics!</h2>
                <h3 style={{ margin: '0.5em' }}>Categories → {stats["#categories"]}</h3>
                <h3 style={{ margin: '0.5em' }}>Cards → {stats["#cards"]}</h3>
            </div>}
        </div>
    );
}

import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './AuthProvider';
import axios from 'axios';
import { SetAxiosDefaults } from '../core/Utils';

import '../css/Common.css';
import '../css/Button.css';


export function Account() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const API_URL = process.env.REACT_APP_API_URL;

    SetAxiosDefaults();

    const handleLogout = () => {
        user.auth.signOut();
    }

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/account/stats`);
            setStats(response.data);
            setStatusMessage('');
        } catch (error) {
            console.error(error);
            setStatusMessage(error.response?.data);
        }
    };

    useEffect(() => {
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
                <h2 style={{ margin: '0.5em' }}>Statistics 📊</h2>
                <hr />
                <h3 style={{ margin: '0.5em' }}>Categories → {stats.category.count}</h3>
                <h3 style={{ margin: '0.5em' }}>{stats.category.add}➕ &nbsp; {stats.category.update}🖋️ &nbsp; {stats.category.delete}🗑️ &nbsp; </h3>
                <hr />
                <h3 style={{ margin: '0.5em' }}>Cards → {stats.card.count}</h3>
                <h3 style={{ margin: '0.5em' }}>{stats.card.add}➕ &nbsp; {stats.card.update}🖋️ &nbsp; {stats.card.delete}🗑️</h3>
            </div>}

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
        </div>
    );
}

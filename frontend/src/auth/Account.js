import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from './AuthProvider';
import '../Common.css';


export function Account() {
    const { user } = useContext(AuthContext);

    const handleLogout = () => {
        user.auth.signOut();
    }

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
        </div>
    );
}

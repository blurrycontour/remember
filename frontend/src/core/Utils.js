import axios from 'axios';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';


export function deleteCardPrompt(removeFunction, removeID) {
    return async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete the card?');
        if (!isConfirmed) return;
        removeFunction(removeID);
    }
}

export function SetAxiosDefaults() {
    const { user } = useContext(AuthContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${user?.accessToken}`;
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'ok';
}

export function GetUserButton() {
    const { user } = useContext(AuthContext);
    return (
        <div className='account-button'>
            <Link to="/account">
                <img src={user?.photoURL} alt={user?.displayName} className="user-photo" />
            </Link>
        </div>
    );
}

import axios from 'axios';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';


export function deleteCardPrompt(removeFunction, removeItem)
{
    return async () =>
    {
        const isConfirmed = removeItem.front ?
            window.confirm(`Are you sure you want to delete the card: '${removeItem.front}' ?`) :
            window.confirm(`Are you sure you want to delete the category: '${removeItem.name}' ?`);
        if (!isConfirmed) return;
        removeFunction(removeItem.id);
    }
}

export function SetAxiosDefaults()
{
    const { user } = useContext(AuthContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${user?.accessToken}`;
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'ok';
}

export function GetUserButton()
{
    const { user } = useContext(AuthContext);
    return (
        <div className='nav-button'>
            <Link to="/account">
                <img src={user?.photoURL} alt={user?.displayName} className="user-photo" />
            </Link>
        </div>
    );
}

export function CheckAndSetDarkMode()
{
    const isDarkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkModeEnabled)
    {
        document.body.classList.add('dark-mode');
    }
    return isDarkModeEnabled;
}

export const NotFound = () => (
    <div>
        <h1>404 - Not Found</h1>
        <h3 style={{ textAlign: 'center' }}>The page you are looking for doesn't exist!</h3>
    </div>
);

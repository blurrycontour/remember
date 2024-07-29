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
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = true;
    axios.defaults.headers.common['disable-tunnel-reminder'] = true;
}

export function GetUserButton()
{
    const { user } = useContext(AuthContext);
    return (
        <Link to="/account">
            <img src={user?.photoURL} alt={user?.displayName} className="user-photo" />
        </Link>
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


export function SortItems(items, type, order)
{
    return items.sort((a, b) =>
    {
        let comparison = 0;
        switch (type)
        {
            case 'front':
                comparison = a.front.localeCompare(b.front);
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'created':
                comparison = new Date(a.created) - new Date(b.created);
                break;
            case 'updated':
                comparison = new Date(a.updated) - new Date(b.updated);
                break;
            default:
                comparison = a.front.localeCompare(b.front);
        }
        return order === 'asc' ? comparison : -comparison;
    });
};

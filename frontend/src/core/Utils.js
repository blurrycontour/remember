import axios from 'axios';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import axiosRetry from 'axios-retry';
import { useSwipeable } from 'react-swipeable';


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
    document.documentElement.setAttribute('data-color-mode', isDarkModeEnabled ? 'dark' : 'light');
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
            case 'nCards':
                comparison = a["#cards"] - b["#cards"];
                break;
            default:
                comparison = a.front.localeCompare(b.front);
        }
        return order === 'asc' ? comparison : -comparison;
    });
};


export function HandleAxiosError(error, setErrorMessage)
{
    console.error(error);
    error.response ?
    (
        error.response.headers['content-type'] === 'text/html' ?
        setErrorMessage(error.message) : setErrorMessage(error.response.data)
    )
    :
    setErrorMessage('Failed to connect to API server!');
}


export function SetAxiosRetry() {
    axiosRetry(axios, {
        retries: 5,
        retryCondition: (error) => {
            return error.response?.status === 502;
        },
        retryDelay: (retryCount) => {
            return 25;
        },
        onRetry: (retryCount, error, requestConfig) => {
            console.log(`Retry #${retryCount} for request: ${requestConfig.url}`);
        }
    });
}

export function PreventSwipe()
{
    const handlers = useSwipeable({
        onSwiped: (eventData) => eventData.event.stopPropagation(),
        onSwiping: (eventData) => eventData.event.stopPropagation(),
    });
    return handlers;
}

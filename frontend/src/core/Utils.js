import axios from 'axios';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import axiosRetry from 'axios-retry';
import { useSwipeable } from 'react-swipeable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';


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
    axios.defaults.headers.common['localtonet-skip-warning'] = true;
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

export function UseLocalStorage() {
    const { user } = useContext(AuthContext);
    const userEmail = user?.email || 'unknown';

    const setStorageItem = (key, value) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        data[key] = value;
        localStorage.setItem(userEmail, JSON.stringify(data));
    };

    const getStorageItem = (key, defaultValue) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        return data[key] || defaultValue;
    };

    return { setStorageItem, getStorageItem };
}

export const SearchBar = ({ setSearchString, fetchSearchResults }) => {
    return (
        <div className="tool-card">
            <input
                className='overlay-input'
                type='text'
                placeholder="Search..."
                onChange={(e) => { setSearchString(e.target.value); }} />
            <span style={{ padding: '0px 8px' }}></span>
            <button onClick={fetchSearchResults} style={{ minWidth: '70px' }} className='green-button'>
                <FontAwesomeIcon size="xl" icon={faMagnifyingGlass} />
            </button>
        </div>
    );
};

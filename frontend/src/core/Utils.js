import axios from 'axios';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import axiosRetry from 'axios-retry';
import { useSwipeable } from 'react-swipeable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faEdit, faTrashAlt, faBars, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { MarkdownPreview } from './Editor';


export const API_URL = process.env.REACT_APP_API_URL;

export function deleteCardPrompt(removeFunction, removeItem, xFunctions=[])
{
    return async () =>
    {
        for (const xFunction of xFunctions) xFunction(null);

        const isConfirmed = removeItem.front ?
            window.confirm(`Delete the Card: '${removeItem.front}' ?`) :
            window.confirm(`Delete the Category: '${removeItem.name}' ?`);
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
    const userEmail = user?.email || 'unknown@user';

    const setStorageItem = (key, value) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        data[key] = value;
        localStorage.setItem(userEmail, JSON.stringify(data));
    };

    const getStorageItem = (key, defaultValue) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        return data[key] || defaultValue;
    };

    const setUserStorageItem = (userEmail, key, value) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        data[key] = value;
        localStorage.setItem(userEmail, JSON.stringify(data));
    };

    return { setStorageItem, getStorageItem, setUserStorageItem };
}


export const toggleFavorite = async (card, setOptionsVisible, setStatusMessage) =>
{
    setOptionsVisible(null);
    try
    {
        const response = await axios.patch(`${API_URL}/card/${card.id}/favorite`);
        if (typeof (response.data) === 'string')
        {
            setStatusMessage('Bad response from API server!');
            return;
        }
        card.favorite = response.data.favorite;
    } catch (error)
    {
        HandleAxiosError(error, setStatusMessage);
    }
};

// UI Components


export const SearchBar = ({ setSearchString, fetchSearchResults }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            fetchSearchResults();
        }
    };

    return (
        <div className="tool-card">
            <input
                className='overlay-input'
                type='text'
                placeholder="Search..."
                onChange={(e) => { setSearchString(e.target.value); }}
                onKeyDown={handleKeyPress}
            />
            <span style={{ padding: '0px 8px' }}></span>
            <button onClick={fetchSearchResults} style={{ minWidth: '70px' }} className='green-button'>
                <FontAwesomeIcon size="xl" icon={faMagnifyingGlass} />
            </button>
        </div>
    );
};


export function CardTemplate({
        card,
        showBack,
        onShowBack,
        removeCard,
        setStatusMessage,
        setOptionsVisibleCard,
        optionsVisibleCard,
        optionsMenuRef,
        openOverlay=null,
        category=null
    }) {

    const toggleOptions = (cardId) => {
        optionsVisibleCard === cardId ? setOptionsVisibleCard(null) : setOptionsVisibleCard(cardId);
    };

    return (
        <div key={card.id} className="card">
            <div className="options-icon">
                <FontAwesomeIcon icon={faBars} size="lg" onClick={() => toggleOptions(card.id)} />
                {optionsVisibleCard === card.id && (
                    <div className="options-menu" ref={optionsMenuRef}>
                        {openOverlay && (
                            <button onClick={() => openOverlay(2, card)}>
                                <FontAwesomeIcon icon={faEdit} size="lg" />
                                &nbsp;&nbsp;Edit
                            </button>
                        )}
                        <button onClick={() => toggleFavorite(card, setOptionsVisibleCard, setStatusMessage)}>
                            <FontAwesomeIcon icon={faStar} size="lg" />
                            &nbsp;&nbsp;{card.favorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                        <button onClick={deleteCardPrompt(removeCard, card, [setOptionsVisibleCard])}>
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                            &nbsp;&nbsp;Delete
                        </button>
                    </div>
                )}
            </div>
            <div style={{ cursor: 'pointer' }} onClick={onShowBack}>
                <h2 className='card-hx'>{card.front}</h2>
                {category && <hr />}
                {showBack && (
                    <div>
                        {!category && <hr />}
                        <MarkdownPreview source={card.back} />
                    </div>
                )}
                {category && (
                    <h3 className='card-hx' style={{ fontSize: '1em' }}>
                        <Link to={`/category/${category.id}`}>Category → {category.name}</Link>
                    </h3>
                )}
            </div>
        </div>
    );
}

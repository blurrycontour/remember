import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faEdit, faTrashAlt, faBars, faMagnifyingGlass, faLayerGroup, faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { MarkdownPreview } from './Editor';
import { HandleAxiosError, SetAxiosAuthorization, API_URL } from './Axios';


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


export function PreventSwipe()
{
    const handlers = useSwipeable({
        onSwiped: (eventData) => eventData.event.stopPropagation(),
        onSwiping: (eventData) => eventData.event.stopPropagation(),
    });
    return handlers;
}


export const toggleFavorite = async (card, setOptionsVisible, setStatusMessage) =>
{
    setOptionsVisible(null);
    try
    {
        await SetAxiosAuthorization();
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

    const navigate = useNavigate();

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
                                &nbsp;&nbsp;Edit Card
                            </button>
                        )}
                        {openOverlay && (
                            <button onClick={() => openOverlay(3, card)}>
                                <FontAwesomeIcon icon={faRightLeft} size="lg" />
                                &nbsp;&nbsp;Change Category
                            </button>
                        )}
                        <button onClick={() => toggleFavorite(card, setOptionsVisibleCard, setStatusMessage)}>
                            <FontAwesomeIcon icon={faStar} size="lg" />
                            &nbsp;&nbsp;{card.favorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                        <button onClick={() => {toggleOptions(card.id); navigate(`/category/${card.category_id}`)}} style={{ whiteSpace: 'nowrap' }}>
                            <FontAwesomeIcon icon={faLayerGroup} size="lg" />
                            &nbsp;&nbsp;Visit Category
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


export const formattedTime = (time=null) =>
{
    const now = time ? time : new Date();
    const pad = (num) => (num < 10 ? '0' : '') + num;
    const offset = -now.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = pad(Math.floor(Math.abs(offset) / 60));
    const minutes = pad(Math.abs(offset) % 60);
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${sign}${hours}${minutes}`;
};

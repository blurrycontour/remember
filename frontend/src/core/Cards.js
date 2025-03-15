import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faEye, faEyeSlash, faPlusSquare, faSliders } from '@fortawesome/free-solid-svg-icons';
import { faSortAlphaDown, faSortAlphaUp, faSortNumericDown, faSortNumericUp } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, SortItems, HandleAxiosError, SetAxiosRetry, PreventSwipe, UseLocalStorage, SearchBar } from './Utils';
import { MarkdownEditor, MarkdownPreview } from './Editor';


SetAxiosRetry();

export function Cards()
{
    let { id } = useParams();
    const { setStorageItem, getStorageItem } = UseLocalStorage();
    const [searchString, setSearchString] = useState('');
    const [cards, setCards] = useState([]);
    const [category, setCategory] = useState(null);
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(0);
    const [currentCard, setCurrentCard] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [errorMessage, setErrorMessage] = useState('');
    const [expandedCards, setExpandedCards] = useState({});
    const [expandAllCards, setExpandAllCards] = useState(false);
    const [sortType, setSortType] = useState(getStorageItem('sortTypeCards', 'front'));
    const [sortOrder, setSortOrder] = useState(setStorageItem('sortOrderCards', 'asc'));

    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();
    const preventSwipeHandlers = PreventSwipe();


    // =========== Search functions ===========
    const fetchSearchResults = async () =>
    {
        try
        {
            setCards([]);
            setStatusMessage('Searching...');
            const response = await axios.get(`${API_URL}/search/`, {
                params: {
                    query: searchString,
                    itype: 'card',
                    category_id: id
                }
            });
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setCards(SortItems(response.data, sortType, sortOrder));
            if (response.data.length === 0) setStatusMessage('No cards found!');
            else setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    // =========== Sort functions ===========
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };


    // =========== Card functions ===========
    const fetchCards = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/category/${id}`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            // setCards(response.data.cards);
            setCards(SortItems(response.data.cards, sortType, sortOrder));
            setCategory(response.data.category);
            if (response.data.cards.length === 0) setStatusMessage('No cards found!');
            else setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    const addCard = async () =>
    {
        try
        {
            await axios.post(`${API_URL}/card/`, { category_id: category.id, front: newCardFront, back: newCardBack });
            closeOverlay();
            fetchCards();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const updateCard = async () =>
    {
        try
        {
            await axios.put(`${API_URL}/card/${currentCard.id}`, { category_id: currentCard.id, front: currentCard.front, back: currentCard.back });
            closeOverlay();
            fetchCards();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const removeCard = async (cardId) =>
    {
        try
        {
            await axios.delete(`${API_URL}/card/${cardId}`);
            fetchCards();
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    // =========== Overlay functions ===========
    const openOverlay = (type, card) =>
    {
        setCurrentCard(card);
        setIsOverlayOpen(type);
        setErrorMessage('');
        document.querySelector('.content').classList.add('blur-background');
        document.body.classList.add('dark-background');
    };

    const closeOverlay = () =>
    {
        setCurrentCard(null);
        setNewCardFront('');
        setNewCardBack('');
        setErrorMessage('');
        setIsOverlayOpen(0);
        document.querySelector('.content').classList.remove('blur-background');
        document.body.classList.remove('dark-background');
    };

    const expandCollapseAllCards = () =>
    {
        const _expandAllCards = !expandAllCards;
        const updatedExpandedCards = {};
        cards.forEach(card =>
        {
            updatedExpandedCards[card.id] = _expandAllCards;
        });
        setExpandedCards(updatedExpandedCards);
        setExpandAllCards(_expandAllCards);
    };

    useEffect(() =>
    {
        fetchCards();
        // eslint-disable-next-line
    }, []);

    useEffect(() =>
    {
        setCards(prevCards => SortItems([...prevCards], sortType, sortOrder));
        setStorageItem('sortTypeCards', sortType);
        setStorageItem('sortOrderCards', sortOrder);
        // eslint-disable-next-line
    }, [sortType, sortOrder]);


    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    {!!category &&
                        <div className="normal-icon">
                            <h1>
                                <FontAwesomeIcon size="1x" icon={expandAllCards ? faEyeSlash : faEye} onClick={expandCollapseAllCards} />
                            </h1>
                        </div>
                    }
                    <h1> &nbsp;&nbsp; {category?.name} &nbsp;&nbsp; </h1>
                    {!!category &&
                        <div className="normal-icon" style={category?.id ? {opacity: 1} : {opacity: 0.3}} >
                            <h1>
                                <FontAwesomeIcon icon={faPlusSquare} size="1x" onClick={category.id ? () => openOverlay(1, null) : () => {}} />
                            </h1>
                        </div>
                    }
                </div>

                {/* Sort bar */}
                {!!category &&
                    <div className='tool-card' style={{width: 'auto'}}>
                        <h3><FontAwesomeIcon icon={faSliders} size="lg" /></h3>
                        <span style={{padding: '0px 5px'}}></span>
                        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                            <option value="front">Front</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                        </select>
                        <span style={{padding: '0px 5px'}}></span>
                        <button onClick={toggleSortOrder} className='sort-button'>
                            {sortOrder === 'asc' ? (
                                sortType === 'front' ? (
                                    <FontAwesomeIcon icon={faSortAlphaDown} size="xl" />
                                ) : (
                                    <FontAwesomeIcon icon={faSortNumericDown} size="xl" />
                                )
                            ) : (
                                sortType === 'front' ? (
                                    <FontAwesomeIcon icon={faSortAlphaUp} size="xl" />
                                ) : (
                                    <FontAwesomeIcon icon={faSortNumericUp} size="xl" />
                                )
                            )}
                        </button>
                    </div>
                }

                {/* Search bar */}
                <SearchBar
                    setSearchString={setSearchString}
                    fetchSearchResults={fetchSearchResults}
                />

                <div className='cards-container'>
                    {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}

                    {cards.length !== 0 && cards.map(card => (
                        <div key={card.id} className="card">
                            <div className="edit-icon">
                                <FontAwesomeIcon icon={faEdit} size="lg" onClick={() => openOverlay(2, card)} />
                            </div>
                            <div style={{ cursor: 'pointer' }} onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>
                                <h2 className='card-hx'>{card.front}</h2>
                                {expandedCards[card.id] && (
                                    <div>
                                        <div className="delete-icon">
                                            <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCard, card)} />
                                        </div>
                                        <hr />
                                        <MarkdownPreview source={card.back} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay' {...preventSwipeHandlers}>
                    <h3>Edit Card 🧾</h3>
                    <p>Front
                        <textarea
                            className='overlay-textarea'
                            style={{ height: '65px' }}
                            value={currentCard.front}
                            onChange={(e) => { setCurrentCard({ ...currentCard, front: e.target.value }); setErrorMessage(''); }}
                        />
                    </p>
                    <p style={{ marginBottom: '10px' }}>Back</p>
                    <MarkdownEditor value={currentCard.back} onChange={(v) => { setCurrentCard({ ...currentCard, back: v }); setErrorMessage(''); }} height={200} />
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={updateCard} className='green-button'>Save</button>
                    <button onClick={closeOverlay} className='red-button'>Cancel</button>
                </div>
            )}

            {/* Add overlay window */}
            {isOverlayOpen === 1 && (
                <div className='overlay' {...preventSwipeHandlers}>
                    <h3>Add a new Card 🧾</h3>
                    <p>Front
                        <textarea
                            className='overlay-textarea'
                            style={{ height: '65px' }}
                            value={newCardFront}
                            onChange={(e) => { setNewCardFront(e.target.value); setErrorMessage(''); }}
                        />
                    </p>
                    <p style={{ marginBottom: '10px' }}>Back</p>
                    <MarkdownEditor value={newCardBack} onChange={(v) => { setNewCardBack(v); setErrorMessage(''); }} height={200} />
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={addCard} className='green-button'>Add Card</button>
                    <button onClick={closeOverlay} className='red-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

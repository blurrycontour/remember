import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faEye, faEyeSlash, faPlusSquare, faSliders } from '@fortawesome/free-solid-svg-icons';
import { faBook, faArrowDownAZ, faArrowDownZA, faArrowDown19, faArrowDown91 } from '@fortawesome/free-solid-svg-icons';
import { SortItems, PreventSwipe, SearchBar, CardTemplate } from './Utils';
import { SetAxiosDefaults, SetAxiosAuthorization, HandleAxiosError, SetAxiosRetry, UseLocalStorage, API_URL } from './Axios';
import { MarkdownEditor } from './Editor';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    const [optionsVisibleCard, setOptionsVisibleCard] = useState(null);
    const [selected, setSelected] = useState(new Date());


    SetAxiosDefaults();
    const preventSwipeHandlers = PreventSwipe();
    const optionsMenuRef = useRef(null);


    // =========== Search functions ===========
    const fetchSearchResults = async () =>
    {
        try
        {
            setCards([]);
            setStatusMessage('Searching...');
            await SetAxiosAuthorization();
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
            await SetAxiosAuthorization();
            const response = await axios.get(`${API_URL}/category/${id}`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            // setCards(response.data.cards);
            setCards(SortItems(response.data.cards, sortType, sortOrder));
            setCategory(response.data.category);
            console.log("category", response.data.category);
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
            await SetAxiosAuthorization();
            await axios.post(`${API_URL}/card/`, { category_id: category.id, front: newCardFront, back: newCardBack });
            closeOverlay();
            await fetchCards();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const updateCard = async () =>
    {
        try
        {
            await SetAxiosAuthorization();
            await axios.put(`${API_URL}/card/${currentCard.id}`, { category_id: currentCard.id, front: currentCard.front, back: currentCard.back });
            closeOverlay();
            await fetchCards();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const removeCard = async (cardId) =>
    {
        try
        {
            await SetAxiosAuthorization();
            await axios.delete(`${API_URL}/card/${cardId}`);
            await fetchCards();
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

    const handleClickOutside = (event) => {
        if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
            setOptionsVisibleCard(null);
        }
    };

    const onDateSelect = (date, type) =>
    {
        setSelected(date);
        if (date === null) return;
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const dateStr = `${day} ${month} ${year}`;
        if (type === 'new') setNewCardFront(dateStr);
        else setCurrentCard({ ...currentCard, front: dateStr });
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() =>
    {
        fetchCards();
        // eslint-disable-next-line
    }, [id]);

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
                    <h1>
                        {category?.diary && <span><FontAwesomeIcon icon={faBook} size="sm" />&nbsp;</span>}
                        {category?.name}
                    </h1>
                </div>

                {/* Sort bar */}
                {!!category &&
                    <div className='tool-card' style={{ width: 'auto' }}>
                        &nbsp;
                        <h3><FontAwesomeIcon icon={faSliders} size="lg" /></h3>
                        <span style={{ padding: '0px 7px' }}></span>
                        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                            <option value="front">Front</option>
                            <option value="created">Created</option>
                            <option value="updated">Updated</option>
                        </select>
                        &nbsp;
                        <button onClick={toggleSortOrder} className='sort-button'>
                            {sortOrder === 'asc' ? (
                                sortType === 'name' ? (
                                    <FontAwesomeIcon icon={faArrowDownAZ} size="xl" />
                                ) : (
                                    <FontAwesomeIcon icon={faArrowDown19} size="xl" />
                                )
                            ) : (
                                sortType === 'name' ? (
                                    <FontAwesomeIcon icon={faArrowDownZA} size="xl" />
                                ) : (
                                    <FontAwesomeIcon icon={faArrowDown91} size="xl" />
                                )
                            )}
                        </button>
                        &nbsp;
                        {!!category &&
                            <div className="normal-icon">
                                <h1>
                                    <FontAwesomeIcon size="1x" icon={expandAllCards ? faEyeSlash : faEye} onClick={expandCollapseAllCards} />
                                </h1>
                            </div>
                        }
                        <span style={{ padding: '0px 7px' }}></span>
                        {!!category &&
                            <div className="normal-icon" style={category?.id ? {opacity: 1} : {opacity: 0.3}} >
                                <h1>
                                    <FontAwesomeIcon icon={faPlusSquare} size="1x" onClick={category.id ? () => openOverlay(1, null) : () => {}} />
                                </h1>
                            </div>
                        }
                        &nbsp;
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
                        <CardTemplate
                            card={card}
                            showBack={expandedCards[card.id]}
                            onShowBack={() => setExpandedCards({ ...expandedCards, [card.id]: !expandedCards[card.id] })}
                            optionsVisibleCard={optionsVisibleCard}
                            setOptionsVisibleCard={setOptionsVisibleCard}
                            openOverlay={openOverlay}
                            removeCard={removeCard}
                            optionsMenuRef={optionsMenuRef}
                            setStatusMessage={setStatusMessage}
                        />
                    ))}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay' {...preventSwipeHandlers}>
                    <h3>Edit Card 🧾</h3>
                    <p>Front
                        { category?.diary &&
                            <DatePicker
                            showIcon
                            toggleCalendarOnIconClick
                            icon={<FontAwesomeIcon className="normal-icon" icon={faCalendarDays} size="sm" />}
                            isClearable
                            wrapperClassName="datePicker"
                            dateFormat="yyyy-MM-dd"
                            selected={selected}
                            onChange={(date) => onDateSelect(date, 'edit')}
                            placeholderText="No date selected!"
                            />
                        }
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
                        { category?.diary &&
                            <DatePicker
                                showIcon
                                toggleCalendarOnIconClick
                                icon={<FontAwesomeIcon className="normal-icon" icon={faCalendarDays} size="sm" />}
                                isClearable
                                wrapperClassName="datePicker"
                                dateFormat="yyyy-MM-dd"
                                selected={selected}
                                onChange={(date) => onDateSelect(date, 'new')}
                                placeholderText="No date selected!"
                            />
                        }
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

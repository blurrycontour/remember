import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faEye, faEyeSlash, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults } from './Utils';


export function Cards()
{
    let { id } = useParams();
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

    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();

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
            setCards(response.data.cards);
            setCategory(response.data.category);
            if (response.data.cards.length === 0) setStatusMessage('No cards found!');
            else setStatusMessage('');
        } catch (error)
        {
            console.error(error);
            setStatusMessage(error.response?.data);
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
            console.error(error);
            setErrorMessage(error.response?.data);
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
            console.error(error);
            setErrorMessage(error.response?.data);
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
            console.error(error);
            setStatusMessage(error.response?.data);
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

    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    <div className="normal-icon">
                        <h1>
                            <FontAwesomeIcon size="1x" icon={expandAllCards ? faEyeSlash : faEye} onClick={expandCollapseAllCards} />
                        </h1>
                    </div>
                    <h1> &nbsp;&nbsp; {category?.name} &nbsp;&nbsp; </h1>
                    {!!category &&
                        <div className="normal-icon">
                            <h1>
                                <FontAwesomeIcon icon={faPlusSquare} size="1x" onClick={() => openOverlay(1, null)} />
                            </h1>
                        </div>}
                </div>

                <div className='cards-container'>
                    {cards.length !== 0 && cards.map(card => (
                        <div key={card.id} className="card">
                            <div className="edit-icon">
                                <FontAwesomeIcon icon={faEdit} size="lg" onClick={() => openOverlay(2, card)} />
                            </div>
                            <div style={{ cursor: 'pointer' }} onClick={() => setExpandedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}>
                                <h2>{card.front}</h2>
                                {expandedCards[card.id] && (
                                    <div>
                                        <div className="delete-icon">
                                            <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCard, card)} />
                                        </div>
                                        <hr />
                                        <h3>{card.back}</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay'>
                    <h3>Edit Card</h3>
                    <p>Front <textarea style={{ height: '65px' }} value={currentCard.front} onChange={(e) => { setCurrentCard({ ...currentCard, front: e.target.value }); setErrorMessage(''); }} /></p>
                    <p>Back <textarea style={{ height: '122px' }} value={currentCard.back} onChange={(e) => { setCurrentCard({ ...currentCard, back: e.target.value }); setErrorMessage(''); }} /></p>
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={updateCard} className='green-button'>Save</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}

            {/* Add overlay window */}
            {isOverlayOpen === 1 && (
                <div className="overlay">
                    <h3>Add a new Card 🧾</h3>
                    <p>Front <textarea style={{ height: '65px' }} value={newCardFront} onChange={(e) => { setNewCardFront(e.target.value); setErrorMessage(''); }} /></p>
                    <p>Back <textarea style={{ height: '122px' }} value={newCardBack} onChange={(e) => { setNewCardBack(e.target.value); setErrorMessage(''); }} /></p>
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={addCard} className='green-button'>Add Card</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

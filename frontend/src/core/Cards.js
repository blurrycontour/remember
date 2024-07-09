import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faHome, faUser, faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults } from './Utils';

import '../css/Common.css';
import '../css/Button.css';


export function Cards()
{
    let { id } = useParams();
    const [cards, setCards] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(0);
    const [currentCard, setCurrentCard] = useState(null);

    const API_URL = '/api';
    SetAxiosDefaults();

    // Card functions
    const fetchCards = async () =>
    {
        const response = await axios.get(`${API_URL}/category/${id}`);
        setCards(response.data.cards);
        setCategoryName(response.data.name);
    };

    const addCard = async () =>
    {
        const response = await axios.post(`${API_URL}/card/`, { category: categoryName, front: newCardFront, back: newCardBack });
        if (response.data === null)
        {
            alert("Card already exists in this category!");
            return;
        }
        closeOverlay();
        fetchCards();
    };

    const updateCard = async () =>
    {
        // const response = await axios.post(`${API_URL}/card/`, { category: categoryName, front: newCardFront, back: newCardBack});
        // if (response.data === null) {
        //     alert("Card already exists in this category!");
        //     return;
        // }
        closeOverlay();
        fetchCards();
    };

    const removeCard = async (cardId) =>
    {
        await axios.delete(`${API_URL}/card/${cardId}`);
        fetchCards();
    };

    // Overlay functions
    const openOverlay = (type, card) =>
    {
        setCurrentCard(card);
        setIsOverlayOpen(type);
        document.querySelector('.content').classList.add('blur-background');
        document.body.classList.add('dark-background');
    };

    const closeOverlay = () =>
    {
        setCurrentCard(null);
        setNewCardFront('');
        setNewCardBack('');
        setIsOverlayOpen(0);
        document.querySelector('.content').classList.remove('blur-background');
        document.body.classList.remove('dark-background');
    };

    useEffect(() =>
    {
        fetchCards();
    }, []);

    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    <div className='header'>
                        <div className='back-button'>
                            <Link to="/">
                                <FontAwesomeIcon icon={faHome} size="2x" />
                            </Link>
                        </div>
                        <h1>{categoryName} &nbsp; </h1>
                        <div className="normal-icon">
                            <FontAwesomeIcon icon={faPlusSquare} size="2x" onClick={() => openOverlay(1, null)} />
                        </div>
                        <div className='account-button'>
                            <Link to="/account">
                                <FontAwesomeIcon icon={faUser} size="2x" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className='cards-container'>
                    {cards.length !== 0 ? cards.map(card => (
                        <div key={card.ID} className="card">
                            <div className="delete-icon">
                                <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCard, card.ID)} />
                            </div>
                            <div className="show-icon">
                                <FontAwesomeIcon icon={faEdit} size="lg" onClick={() => openOverlay(2, card)} />
                            </div>
                            <h2>{card.Front.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h2>
                            <hr />
                            <h3>{card.Back.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>
                        </div>
                    )) : <h3 style={{ textAlign: 'center' }}>No cards found!</h3>}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay'>
                    <h3>Edit Card</h3>
                    <p>Front <textarea value={currentCard.Front} onChange={(e) => setCurrentCard({ ...currentCard, Front: e.target.value })} /></p>
                    <p>Back <textarea value={currentCard.Back} onChange={(e) => setCurrentCard({ ...currentCard, Back: e.target.value })} /></p>
                    <button onClick={updateCard} className='green-button'>Save</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}

            {/* Add overlay window */}
            {isOverlayOpen === 1 && (
                <div className="overlay">
                    <h3>Add a new Card 🧾</h3>
                    <p>Front <textarea value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)} /></p>
                    <p>Back <textarea value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)} style={{ height: '' }} /></p>
                    <button onClick={addCard} className='green-button'>Add Card</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

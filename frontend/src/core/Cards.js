import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt } from './Common';
import '../Common.css';


export function Cards() {
    let { id } = useParams();
    const [cards, setCards] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    const API_URL = '/api';


    const fetchCards = async () => {
        const response = await axios.get(`${API_URL}/category/${id}`);
        setCards(response.data);
    };

    const addCard = async () => {
        // TODO: check if newCardFront exists in categoryName
        const response = await axios.post(`${API_URL}/card/`, { category: categoryName, front: newCardFront, back: newCardBack});
        if (response.data === null) {
            alert("Card already exists in this category!");
            return;
        }
        setNewCardFront('');
        setNewCardBack('');
        fetchCards();
    };

    const removeCard = async (cardId) => {
        await axios.delete(`${API_URL}/card/${cardId}`);
        fetchCards();
    };

    const categoryIdToName = async (categoryId) => {
        const response = await axios.get(`${API_URL}/category/id_to_name/${categoryId}`);
        setCategoryName(response.data);
    };

    useEffect(() => {
        fetchCards();
        categoryIdToName(id);
    }, []);

    return (
        <div>
            <div className='card2'>
                <div className='header'>
                    <div className='back-button'>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <h1>{categoryName}</h1>
                    <div className='account-button'>
                        <Link to="/account">
                            <FontAwesomeIcon icon={faUser} size="2x" />
                        </Link>
                    </div>
                </div>
            </div>
            <div className='cards-container'>
                {cards.map(card => (
                    <div key={card.ID} className="card">
                        <div className="delete-icon">
                        <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCard, card.ID)} />
                        </div>
                        <h2>{card.Front.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h2>
                        <hr/>
                        <h3>{card.Back.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>
                    </div>
                ))}
            </div>
            <br/>
            <br/>
            <div className="card1">
                <h3>Add a new card 🧾</h3>
                <p>Front <textarea value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)}/></p>
                <p>Back <textarea value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)} style={{height: ''}}/></p>
                <button onClick={addCard}>Add Card</button>
            </div>
        </div>
    );
}

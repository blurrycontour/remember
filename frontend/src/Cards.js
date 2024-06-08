import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './Category.css';


function Cards() {
    let { id } = useParams();
    const [cards, setCards] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [newCardFront, setNewCardFront] = useState('');
    const [newCardBack, setNewCardBack] = useState('');

    const API_URL = 'http://localhost:5000';


    const fetchCards = async () => {
        const response = await axios.get(`${API_URL}/category/${id}`);
        setCards(response.data);
    };

    const addCard = async () => {
        await axios.post(`${API_URL}/card`, { category: categoryName, front: newCardFront, back: newCardBack});
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
            <h1>{categoryName}</h1>
            <div className='cards-container'>
                {cards.map(card => (
                    <div key={card.ID} className="card">
                        <div className="delete-icon">
                        <FontAwesomeIcon icon={faTrashAlt} size="2x" onClick={() => {
                            if (window.confirm('Are you sure you want to delete this card?')) {
                                removeCard(card.ID);
                            }
                        }} />
                        </div>
                        <h2>{card.Front}</h2>
                        <h3>{card.Back}</h3>
                    </div>
                ))}
            </div>
            <br/>
            <br/>
            <div className="card1">
                <h3>Add a new card</h3>
                <p>Front <input type='text' value={newCardFront} onChange={(e) => setNewCardFront(e.target.value)}/></p>
                <p>Back <input type='text' value={newCardBack} onChange={(e) => setNewCardBack(e.target.value)}/></p>
                <button onClick={addCard}>Add Card</button>
            </div>
        </div>
    );
}

export default Cards;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Common.css';


function Random() {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('all');
    const [randomCard, setRandomCard] = useState({});
    const [showBack, setShowBack] = useState(false);

    const API_URL = '/api';


    const fetchCategories = async () => {
        const response = await axios.get(`${API_URL}/category/`);
        setCategories(response.data);
    };

    const fetchRandomCard = async () => {
        if (categoryId === 'all') {
            const response = await axios.get(`${API_URL}/main/random`);
            setRandomCard(response.data);
        } else {
            const response = await axios.get(`${API_URL}/main/random/${categoryId}`);
            setRandomCard(response.data);
        }
    }

    const removeCard = async (cardId) => {
        await axios.delete(`${API_URL}/card/${cardId}`);
        setRandomCard({});
    };

    useEffect(() => {
        fetchCategories();
        fetchRandomCard();
        console.log('useEffect');
    }, []);

    return (
        <div>
            <h1>Random Card</h1>
            <div className="card1">
                <select onChange={(e) => setCategoryId(e.target.value)}>
                    <option key={"all"} value={"all"} selected >Any</option>
                    {categories.map(category => (
                        <option key={category.ID} value={category.ID}>{category.Name} -- {category["#Cards"]}</option>
                    ))}
                </select>
                <span> </span>
                <br />
                <button onClick={() => window.location.href = `/category`} style={{ backgroundColor: '#007BFF' }}>All Categories</button>
                <span> </span>
                <button onClick={fetchRandomCard} style={{ float: 'inline-end' }}>Random Card</button>
            </div>
            {randomCard &&
            <div className='cards-container'>
                <div key={randomCard.ID} className="card">
                    <div className="delete-icon">
                        <FontAwesomeIcon icon={faTrashAlt} size="xl" onClick={() => {
                            if (window.confirm('Are you sure you want to delete this card?')) {
                                removeCard(randomCard.ID);
                            }
                        }} />
                    </div>
                    <h2>{randomCard.Front.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h2>
                    <hr />
                    {showBack && <h3>{randomCard.Back.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>}
                    <div className="show-icon">
                        <FontAwesomeIcon size="xl" icon={showBack ? faEyeSlash : faEye} onClick={() => setShowBack(!showBack)} />
                    </div>
                    <p>Category → {randomCard.Category}</p>
                </div>
            </div>}
        </div>
    );
}

export default Random;

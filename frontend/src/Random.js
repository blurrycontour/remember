import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './Common.css';


function Random() {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [randomCard, setRandomCard] = useState({});

    const API_URL = 'http://localhost:5000';


    const fetchCategories = async () => {
        const response = await axios.get(`${API_URL}/category`);
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
    }, []);

    return (
        <div>
            <h1>Random Card</h1>
            <div className="card1">
                <select onChange={(e) => setCategoryId(e.target.value)}>
                    <option key={"all"} value={"all"}>Any</option>
                    {categories.map(category => (
                        <option key={category.ID} value={category.ID}>{category.Name} -- {category["#Cards"]}</option>
                        ))}
                </select>
                <span> </span>
                <br/>
                <button onClick={fetchRandomCard}>Random Card</button>
                <span> </span>
                <button onClick={() => window.location.href = `/category`} style={{backgroundColor: '#007BFF'}}>All Categories</button>
            </div>
            <div className='cards-container'>
                <div key={randomCard.ID} className="card">
                    <div className="delete-icon">
                        <FontAwesomeIcon icon={faTrashAlt} size="1x" onClick={() => {
                            if (window.confirm('Are you sure you want to delete this card?')) {
                                removeCard(randomCard.ID);
                            }
                        }} />
                    </div>
                    <h2>{randomCard.Front}</h2>
                    <hr/>
                    <h3>{randomCard.Back}</h3>
                    <p>Category: {randomCard.Category}</p>
                </div>
            </div>
        </div>
    );
}

export default Random;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, setAxiosDefaults } from './Utils';
import '../Common.css';


export function Random() {
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('all');
    const [randomCard, setRandomCard] = useState(null);
    const [showBack, setShowBack] = useState(false);

    const API_URL = '/api';
    setAxiosDefaults();

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
        setRandomCard(null);
    };

    useEffect(() => {
        fetchCategories();
        fetchRandomCard();
    }, []);


    return (
        <div>
            <div className='card2'>
                <div className='header'>
                    <h1>Random Card</h1>
                    <div className='account-button'>
                        <Link to="/account">
                            <FontAwesomeIcon icon={faUser} size="2x" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card1">
                <select onChange={(e) => setCategoryId(e.target.value)} defaultValue={"all"}>
                    <option key={"all"} value={"all"}>Any</option>
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
            {!!randomCard &&
                <div className='cards-container'>
                    <div key={randomCard.ID} className="card">
                        <div className="delete-icon">
                            <FontAwesomeIcon icon={faTrashAlt} size="xl" onClick={deleteCardPrompt(removeCard, randomCard.ID)} />
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, GetUserButton } from './Utils';

import '../css/Common.css';
import '../css/Button.css';


export function Random()
{
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('all');
    const [randomCard, setRandomCard] = useState(null);
    const [showBack, setShowBack] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const API_URL = '/api';
    SetAxiosDefaults();


    const fetchCategories = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/category/`);
            setCategories(response.data);
        } catch (error)
        {
            console.error(error);
            setErrorMessage(error.response?.data);
        }
    };

    const fetchRandomCard = async () =>
    {
        setRandomCard(null);
        setErrorMessage('');
        try
        {
            const response = categoryId === 'all' ?
                await axios.get(`${API_URL}/main/random`) :
                await axios.get(`${API_URL}/main/random/${categoryId}`);
            setRandomCard(response.data);
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
            setRandomCard(null);
            fetchRandomCard();
        } catch (error)
        {
            console.error(error);
            setErrorMessage(error.response?.data);
        }
    };

    useEffect(() =>
    {
        fetchCategories();
        fetchRandomCard();
    }, []);


    return (
        <div>
            <div className='card2'>
                <div className='header'>
                    <h1>Random Card</h1>
                    <GetUserButton />
                </div>
            </div>

            <div className="card" style={{ backgroundColor: '#eee' }}>
                <select onChange={(e) => setCategoryId(e.target.value)} defaultValue={"all"}>
                    <option key={"all"} value={"all"}>Any</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name} → {category["#cards"]}</option>
                    ))}
                </select>
                <span> </span>
                <br />
                <button onClick={() => navigate('/category')} className='blue-button'>All Categories</button>
                <span> </span>
                <button onClick={fetchRandomCard} style={{ float: 'inline-end' }} className='green-button'>Random Card</button>
            </div>

            {!!randomCard &&
                <div className='cards-container'>
                    <div key={randomCard.card.id} className="card">
                        <div className="delete-icon">
                            <FontAwesomeIcon icon={faTrashAlt} size="xl" onClick={deleteCardPrompt(removeCard, randomCard.card.id)} />
                        </div>
                        <h2>{randomCard.card.front.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h2>
                        <hr />
                        {showBack && <h3>{randomCard.card.back.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>}
                        <div className="show-icon">
                            <FontAwesomeIcon size="xl" icon={showBack ? faEyeSlash : faEye} onClick={() => setShowBack(!showBack)} />
                        </div>
                        <Link to={`/category/${randomCard.category.id}`} className='text-link'>Category → {randomCard.category.name}</Link>
                    </div>
                </div>}

            {!!errorMessage && <h3 style={{ textAlign: 'center' }}>{errorMessage}</h3>}
        </div>
    );
}

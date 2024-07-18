import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults } from './Utils';


export function Random()
{
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('all');
    const [randomCard, setRandomCard] = useState(null);
    const [showBack, setShowBack] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();


    const fetchCategories = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/category/`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setCategories(response.data);
            setStatusMessage('');
        } catch (error)
        {
            console.error(error);
            error.response ? setStatusMessage(error.response.data) : setStatusMessage('Failed to connect to API server!');
        }
    };

    const fetchRandomCard = async () =>
    {
        setRandomCard(null);
        try
        {
            const response = categoryId === 'all' ?
                await axios.get(`${API_URL}/main/random`) :
                await axios.get(`${API_URL}/main/random/${categoryId}`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setRandomCard(response.data);
            setStatusMessage('');
        } catch (error)
        {
            console.error(error);
            error.response ? setStatusMessage(error.response.data) : setStatusMessage('Failed to connect to API server!');
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
            error.response ? setStatusMessage(error.response.data) : setStatusMessage('Failed to connect to API server!');
        }
    };

    useEffect(() =>
    {
        fetchCategories();
        fetchRandomCard();
        // eslint-disable-next-line
    }, []);


    return (
        <div>
            <div className='card2'>
                <h1>Random Card</h1>
            </div>

            <div className="card">
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
                        <Link to={`/category/${randomCard.category.id}`}>Category → {randomCard.category.name}</Link>
                    </div>
                </div>}

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
        </div>
    );
}

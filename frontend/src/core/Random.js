import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faEyeSlash, faRandom } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, HandleAxiosError, SetAxiosRetry, UseLocalStorage } from './Utils';
import { MarkdownPreview } from './Editor';


SetAxiosRetry();

export function Random()
{
    const { setStorageItem, getStorageItem } = UseLocalStorage();
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(getStorageItem('randomSelectedCategoryId', 'all'));
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
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setCategories(response.data);
            setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    const fetchRandomCard = async () =>
    {
        try
        {
            setRandomCard(null);
            setStatusMessage('Loading...');
            const response = categoryId === 'all' ?
                await axios.get(`${API_URL}/main/random`) :
                await axios.get(`${API_URL}/main/random/${categoryId}`);
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setStatusMessage('');
            setRandomCard(response.data);
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
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
            HandleAxiosError(error, setStatusMessage);
        }
    };

    useEffect(() =>
    {
        fetchCategories();
        fetchRandomCard();
        // eslint-disable-next-line
    }, []);

    useEffect(() =>
    {
        setStorageItem('randomSelectedCategoryId', categoryId);
        // eslint-disable-next-line
    }, [categoryId]);


    return (
        <div>
            <div className='card2'>
                <h1>Random Card</h1>
            </div>

            <div className="tool-card">
                <button onClick={() => navigate('/category/all')} className='blue-button'
                    style={{ margin: '8px 2px', minWidth: '100px', width: '100%' }}>
                    All Cards
                </button>
                <span style={{ padding: '0px 8px' }}></span>
                <button onClick={() => navigate('/category/favorites')} className='blue-button'
                    style={{ margin: '8px 2px', minWidth: '100px', width: '100%' }}>
                    Favorites
                </button>
            </div>

            <div className="tool-card">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option key={"all"} value={"all"}>[All] → {categories.reduce((sum, category) => sum + category["#cards"], 0)}</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name} → {category["#cards"]}</option>
                    ))}
                </select>
                <span style={{ padding: '0px 8px' }}></span>
                <button onClick={fetchRandomCard} style={{ minWidth: '100px' }} className='green-button'>
                    <FontAwesomeIcon size="xl" icon={faRandom} />
                </button>
            </div>

            {!!randomCard &&
                <div className='cards-container'>
                    <div key={randomCard.card.id} className="card">
                        <div className="delete-icon">
                            <FontAwesomeIcon icon={faTrashAlt} size="xl" onClick={deleteCardPrompt(removeCard, randomCard.card)} />
                        </div>
                        <div className="show-icon">
                            <FontAwesomeIcon size="xl" icon={showBack ? faEyeSlash : faEye} onClick={() => setShowBack(!showBack)} />
                        </div>
                        <div style={{ cursor: 'pointer' }} onClick={() => setShowBack(!showBack)}>
                            <h2 className='card-hx'>{randomCard.card.front}</h2>
                            <hr />
                            {showBack && <MarkdownPreview source={randomCard.card.back} />}
                            <h3 className='card-hx' style={{ fontSize: '1em' }}>
                                <Link to={`/category/${randomCard.category.id}`}>Category → {randomCard.category.name}</Link>
                            </h3>
                        </div>
                    </div>
                </div>}

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
        </div>
    );
}

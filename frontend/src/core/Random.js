import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom } from '@fortawesome/free-solid-svg-icons';
import { SetAxiosDefaults, HandleAxiosError, SetAxiosRetry, UseLocalStorage, API_URL, CardTemplate } from './Utils';


SetAxiosRetry();

export function Random()
{
    const { setStorageItem, getStorageItem } = UseLocalStorage();
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(getStorageItem('randomSelectedCategoryId', 'all'));
    const [randomCard, setRandomCard] = useState(null);
    const [showBack, setShowBack] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [optionsVisibleCard, setOptionsVisibleCard] = useState(null);

    const navigate = useNavigate();
    const optionsMenuRef = useRef(null);
    SetAxiosDefaults();


    const fetchCategories = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/category/?meta=true`);
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
            const response = await axios.get(`${API_URL}/main/random/${categoryId}`);
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

    const handleClickOutside = (event) => {
        if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
            setOptionsVisibleCard(null);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    {/* <option key={"all"} value={"all"}>[All] → {categories.reduce((sum, category) => sum + category["#cards"], 0)}</option> */}
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name} → {category["#cards"]}</option>
                    ))}
                </select>
                <span style={{ padding: '0px 8px' }}></span>
                <button onClick={fetchRandomCard} style={{ minWidth: '100px' }} className='green-button'>
                    <FontAwesomeIcon size="xl" icon={faRandom} />
                </button>
            </div>

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}

            {!!randomCard &&
                <div className='cards-container'>
                    <CardTemplate
                        card={randomCard.card}
                        showBack={showBack}
                        onShowBack={() => setShowBack(!showBack)}
                        optionsVisibleCard={optionsVisibleCard}
                        setOptionsVisibleCard={setOptionsVisibleCard}
                        removeCard={removeCard}
                        optionsMenuRef={optionsMenuRef}
                        setStatusMessage={setStatusMessage}
                        category={randomCard.category}
                    />
                </div>
            }
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, HandleAxiosError, SetAxiosRetry, UseLocalStorage } from './Utils';


SetAxiosRetry();

export function Search()
{
    const [searchString, setSearchString] = useState('');
    const [statusMessage, setStatusMessage] = useState('Search everything!');
    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();


    const fetchSearchResults = async () =>
    {
        try
        {
            setStatusMessage('Searching...');
            const response = await axios.get(`${API_URL}/search/`);
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };


    return (
        <div>
            <div className="tool-card" style={{ padding: '10px 10px' }}>
                <input
                    className='overlay-input'
                    type='text'
                    placeholder="Search..."
                    onChange={(e) => { setSearchString(e.target.value); }} />
                <span style={{ padding: '0px 8px' }}></span>
                <button onClick={fetchSearchResults} style={{ minWidth: '70px' }} className='green-button'>
                    <FontAwesomeIcon size="xl" icon={faMagnifyingGlass} />
                </button>
            </div>

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
        </div>
    );
}

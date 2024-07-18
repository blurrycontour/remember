import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GetUserButton } from './Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { DarkModeSwitch } from 'react-toggle-dark-mode';


export function Header()
{
    const [isDarkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () =>
    {
        document.body.classList.toggle('dark-mode');
        const _isDarkMode = document.body.classList.contains('dark-mode');
        setDarkMode(_isDarkMode);
        localStorage.setItem('darkMode', _isDarkMode ? 'enabled' : 'disabled');
    };

    useEffect(() =>
    {
        const isDarkModeEnabled = localStorage.getItem('darkMode') === 'enabled';
        setDarkMode(isDarkModeEnabled);
        if (isDarkModeEnabled)
        {
            document.body.classList.add('dark-mode');
        }
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <div className='header'>
                <div className='card2'>
                    <div className='back-button'>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <DarkModeSwitch
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        size={40}
                    />
                    <GetUserButton />
                </div>
            </div>
            <div style={{ height: '60px' }}></div>
        </div>
    );
}

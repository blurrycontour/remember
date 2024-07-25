import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GetUserButton, CheckAndSetDarkMode } from './Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
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
        const isDarkModeEnabled = CheckAndSetDarkMode();
        setDarkMode(isDarkModeEnabled);
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <div className='header'>
                <div className='card2' style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className='nav-button'>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <div className='nav-button'>
                        <Link to="/category">
                            <FontAwesomeIcon icon={faLayerGroup} size="2x" />
                        </Link>
                    </div>
                    <div className='nav-button'>
                        <DarkModeSwitch
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                            size={38}
                        />
                    </div>
                    <GetUserButton />
                </div>
            </div>
            <div style={{ height: '70px' }}></div>
        </div>
    );
}

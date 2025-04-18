import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GetUserButton, UseLocalStorage } from './Axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faLayerGroup, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { DarkModeSwitch } from 'react-toggle-dark-mode';


export function Header()
{
    const { setStorageItem, getStorageItem, setUserStorageItem } = UseLocalStorage();
    const [isDarkMode, setDarkMode] = useState(false);
    const location = useLocation();

    const toggleDarkMode = () =>
    {
        document.body.classList.toggle('dark-mode');
        const _isDarkMode = document.body.classList.contains('dark-mode');
        document.documentElement.setAttribute('data-color-mode', _isDarkMode ? 'dark' : 'light');
        setDarkMode(_isDarkMode);
        setStorageItem('darkMode', _isDarkMode ? 'enabled' : 'disabled');
        // localStorage.setItem('unknown@user', JSON.stringify({'darkMode': _isDarkMode ? 'enabled' : 'disabled'}));
    };

    const getNavClass = (path) => {
        if (path === '/category/') {
            if (location.pathname.includes("/category/")) {
                const currentCardID = location.pathname.split('/').pop();
                setStorageItem('lastCardID', currentCardID);
                return 'nav-button active';
            } else {
                return 'nav-button';
            }
        } else if (path === '/') {
            return ['/','/random'].includes(location.pathname) ? 'nav-button active' : 'nav-button';
        }
        else {
            return location.pathname === path ? 'nav-button active' : 'nav-button';
        }
    };

    const getCategoryLink = () => {
        const lastCardID = getStorageItem('lastCardID', 'all');
        return lastCardID ? `/category/${lastCardID}` : "/category";
    };

    useEffect(() =>
    {
        const darkModeValue = getStorageItem('darkMode', 'unset');
        if (darkModeValue !== 'unset') setUserStorageItem('unknown@user', 'darkMode', darkModeValue);
        const isDarkModeEnabled = darkModeValue === 'enabled';
        if (isDarkModeEnabled) document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-color-mode', isDarkModeEnabled ? 'dark' : 'light');
        setDarkMode(isDarkModeEnabled);
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            <div className='header'>
                <div className='card2' style={{ justifyContent: 'space-between', alignItems: 'center', margin: '0' }}>
                    <div className={getNavClass('/')}>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <div className={getNavClass('/category')}>
                        <Link to="/category">
                            <FontAwesomeIcon icon={faLayerGroup} size="2x" />
                        </Link>
                    </div>
                    <div className={getNavClass('/category/')}>
                        <Link to={getCategoryLink()}>
                            <FontAwesomeIcon icon={faNoteSticky} size="2x" />
                        </Link>
                    </div>
                    <div className='nav-button'>
                        <DarkModeSwitch
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                            size={38}
                        />
                    </div>
                    <div className={getNavClass('/account')}>
                        <GetUserButton />
                    </div>
                </div>
            </div>
            <div style={{ height: '65px' }}></div>
        </div>
    );
}

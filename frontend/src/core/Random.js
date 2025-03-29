import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faRandom } from '@fortawesome/free-solid-svg-icons';
import { CardTemplate } from './Utils';
import { SetAxiosDefaults, SetAxiosAuthorization, HandleAxiosError, SetAxiosRetry, UseLocalStorage, API_URL } from './Axios';
import Select from 'react-select';


SetAxiosRetry();

const CustomOption = (props) => {
    const { data, isSelected, innerRef, innerProps } = props;
    return (
        <div ref={innerRef} {...innerProps} style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                style={{ marginRight: '10px' }}
            />
            <label>{data.label}</label>
        </div>
    );
};

export function Random()
{
    const { setStorageItem, getStorageItem } = UseLocalStorage();
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState(getStorageItem('randomSelectedCategoryId', ['all']));
    const [randomCard, setRandomCard] = useState(null);
    const [showBack, setShowBack] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [optionsVisibleCard, setOptionsVisibleCard] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(document.querySelector('.dark-mode') !== null);

    const navigate = useNavigate();
    const optionsMenuRef = useRef(null);

    SetAxiosDefaults();


    const fetchCategories = async () =>
    {
        try
        {
            await SetAxiosAuthorization();
            const response = await axios.get(`${API_URL}/category/?meta=true`);
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setCategories(
                response.data.map(category => {
                    return { value: category.id, label: `${category.name} → ${category["#cards"]}` }
               })
            );
            if (categoryId.length === 0) setStatusMessage('Select at least one category!');
            else setStatusMessage('');
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
            if (categoryId.length === 0) {
                setStatusMessage('Select at least one category!');
                return;
            }
            await SetAxiosAuthorization();
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
            await SetAxiosAuthorization();
            await axios.delete(`${API_URL}/card/${cardId}`);
            setRandomCard(null);
            await fetchRandomCard();
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

    // Dynamically track changes to the `.dark-mode` class
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.querySelector('.dark-mode') !== null);
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => {
            observer.disconnect();
        };
    }, []);


    return (
        <div>
            <div className='card2'>
                <h1>Random Card</h1>
            </div>

            <div className="tool-card">
                <button onClick={() => navigate('/category/all')} className='blue-button'
                    style={{ minWidth: '120px', width: '100%' }}>
                    All Cards
                </button>
                <span style={{ padding: '0px 5px' }}></span>
                <button onClick={() => navigate('/category/favorites')} className='blue-button'
                    style={{ minWidth: '80px', width: '100%' }}>
                    <FontAwesomeIcon size="lg" icon={faStar} />
                </button>
                <span style={{ padding: '0px 5px' }}></span>
                <button onClick={fetchRandomCard} style={{ minWidth: '80px', width: '100%' }} className='green-button'>
                    <FontAwesomeIcon size="lg" icon={faRandom} />
                </button>
            </div>

            <div className="tool-card">
                <Select
                    className="multi-select"
                    value={categories.filter(category => categoryId.includes(category.value))}
                    placeholder="Select categories..."
                    isSearchable={true}
                    isMulti={true}
                    name="categories"
                    options={categories}
                    classNamePrefix="select"
                    hideSelectedOptions={false}
                    closeMenuOnSelect={false}
                    onChange={(selectedOptions) => {
                        const selectedIds = selectedOptions.map(option => option.value);
                        setCategoryId(selectedIds);
                    }}
                    components={{ Option: CustomOption }}
                    styles={{
                        control: (baseStyles) => ({
                            ...baseStyles,
                            backgroundColor: isDarkMode ? '#333' : '#fff', // Dark or light background
                            color: isDarkMode ? '#fff' : '#000', // Light or dark text
                            borderColor: isDarkMode ? '#555' : '#ccc', // Border color for dark/light mode
                        }),
                        singleValue: (baseStyles) => ({
                            ...baseStyles,
                            color: isDarkMode ? '#fff' : '#000', // Light or dark text for selected value
                        }),
                        menu: (baseStyles) => ({
                            ...baseStyles,
                            backgroundColor: isDarkMode ? '#333' : '#fff', // Dark or light background for dropdown
                            color: isDarkMode ? '#fff' : '#000', // Light or dark text for dropdown items
                        }),
                        option: (baseStyles, { isFocused, isSelected }) => ({
                            ...baseStyles,
                            backgroundColor: isFocused
                                ? isDarkMode
                                    ? '#444'
                                    : '#eee'
                                : isSelected
                                ? isDarkMode
                                    ? '#555'
                                    : '#ddd'
                                : isDarkMode
                                ? '#333'
                                : '#fff', // Highlight colors for dark/light mode
                            color: isFocused || isSelected ? isDarkMode ? '#ccc' : '#000' : isDarkMode ? '#ccc' : '#000', // Text color
                        }),
                        multiValue: (baseStyles) => ({
                            ...baseStyles,
                            backgroundColor: isDarkMode ? '#444' : '#eee', // Background color for selected items
                            color: isDarkMode ? '#fff' : '#000', // Text color for selected items
                        }),
                        multiValueLabel: (baseStyles) => ({
                            ...baseStyles,
                            color: isDarkMode ? '#fff' : '#000', // Text color for selected items
                        }),
                    }}
                />
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
                </div>}
        </div>
    );
}

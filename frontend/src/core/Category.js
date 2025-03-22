import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faBars, faPlusSquare, faLayerGroup, faSliders } from '@fortawesome/free-solid-svg-icons';
import { faArrowDownAZ, faArrowDownZA, faArrowDown19, faArrowDown91 } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, SortItems, HandleAxiosError, SetAxiosRetry, PreventSwipe, UseLocalStorage, SearchBar } from './Utils';
import { MarkdownEditor, MarkdownPreview } from './Editor';


SetAxiosRetry();

export function Category()
{
    const { setStorageItem, getStorageItem } = UseLocalStorage();
    const [searchString, setSearchString] = useState('');
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(0);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortType, setSortType] = useState(getStorageItem('sortTypeCategories', 'name'));
    const [sortOrder, setSortOrder] = useState(getStorageItem('sortOrderCategories', 'asc'));
    const [optionsVisibleCategory, setOptionsVisibleCategory] = useState(null);

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();
    const preventSwipeHandlers = PreventSwipe();
    const optionsMenuRef = useRef(null);


    // =========== Search functions ===========
    const fetchSearchResults = async () =>
    {
        try
        {
            setCategories([]);
            setStatusMessage('Searching...');
            const response = await axios.get(`${API_URL}/search/`, {
                params: {
                    query: searchString,
                    itype: 'category'
                }
            });
            if (response.headers['content-type'] === 'text/html')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setCategories(SortItems(response.data, sortType, sortOrder));
            if (response.data.length === 0) setStatusMessage('No categories found!');
            else setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    // =========== Sort functions ===========
    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    };

    // =========== Category functions ===========
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
            setCategories(SortItems(response.data, sortType, sortOrder));
            if (response.data.length === 0) setStatusMessage('No categories found!');
            else setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    const addCategory = async () =>
    {
        try
        {
            await axios.post(`${API_URL}/category/`, { name: newCategoryName, description: newCategoryDesc });
            closeOverlay();
            fetchCategories();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const updateCategory = async () =>
    {
        try
        {
            await axios.put(`${API_URL}/category/${currentCategory.id}`, { name: currentCategory.name, description: currentCategory.description });
            closeOverlay();
            fetchCategories();
        } catch (error)
        {
            HandleAxiosError(error, setErrorMessage);
        }
    };

    const removeCategory = async (categoryId) =>
    {
        try
        {
            await axios.delete(`${API_URL}/category/${categoryId}`);
            fetchCategories();
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };

    // ========== Overlay functions ===========
    const openOverlay = (type, category) =>
    {
        setCurrentCategory(category);
        setIsOverlayOpen(type);
        setErrorMessage('');
        document.querySelector('.content').classList.add('blur-background');
        document.body.classList.add('dark-background');
    };

    const closeOverlay = () =>
    {
        setCurrentCategory(null);
        setNewCategoryName('');
        setNewCategoryDesc('');
        setErrorMessage('');
        setIsOverlayOpen(0);
        document.querySelector('.content').classList.remove('blur-background');
        document.body.classList.remove('dark-background');
    };

    const toggleOptions = (categoryId) => {
        optionsVisibleCategory === categoryId ? setOptionsVisibleCategory(null) : setOptionsVisibleCategory(categoryId);
    };

    const handleClickOutside = (event) => {
        if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
            setOptionsVisibleCategory(null);
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
        // eslint-disable-next-line
    }, []);

    useEffect(() =>
    {
        setCategories(prevCategories => SortItems([...prevCategories], sortType, sortOrder));
        setStorageItem('sortTypeCategories', sortType);
        setStorageItem('sortOrderCategories', sortOrder);
        // eslint-disable-next-line
    }, [sortType, sortOrder]);


    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    <h1>Categories &nbsp; </h1>
                </div>

                {/* Sort bar */}
                <div className='tool-card' style={{ width: 'auto' }}>
                    &nbsp;
                    <h3><FontAwesomeIcon icon={faSliders} size="lg" /></h3>
                    <span style={{ padding: '0px 7px' }}></span>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="nCards">#Cards</option>
                    </select>
                    &nbsp;
                    <button onClick={toggleSortOrder} className='sort-button'>
                        {sortOrder === 'asc' ? (
                            sortType === 'name' ? (
                                <FontAwesomeIcon icon={faArrowDownAZ} size="xl" />
                            ) : (
                                <FontAwesomeIcon icon={faArrowDown19} size="xl" />
                            )
                        ) : (
                            sortType === 'name' ? (
                                <FontAwesomeIcon icon={faArrowDownZA} size="xl" />
                            ) : (
                                <FontAwesomeIcon icon={faArrowDown91} size="xl" />
                            )
                        )}
                    </button>
                    &nbsp;
                    <div className="normal-icon">
                        <h1>
                            <FontAwesomeIcon icon={faPlusSquare} size="1x" onClick={() => openOverlay(1, null)} />
                        </h1>
                    </div>
                    &nbsp;
                </div>

                {/* Search bar */}
                <SearchBar
                    setSearchString={setSearchString}
                    fetchSearchResults={fetchSearchResults}
                />

                <div className='cards-container'>
                    {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}

                    {categories.length !== 0 && categories.map(category => (
                        <div key={category.id} className="card">
                            <h2 className='card-hx'>{category.name}</h2>
                            {!!category.description && <MarkdownPreview source={category.description} />}
                            <h4 className='card-hx' style={{ color: 'gray', paddingBottom: '15px' }}>Number of Cards → {category["#cards"]}</h4>
                            <button onClick={() => navigate(`/category/${category.id}`)} className='blue-button'>View</button>
                            <div className="options-icon">
                                <FontAwesomeIcon icon={faBars} size="lg" onClick={() => toggleOptions(category.id)} />
                                {optionsVisibleCategory === category.id && (
                                    <div className="options-menu" ref={optionsMenuRef}>
                                        <button onClick={() => openOverlay(2, category)}>
                                            <FontAwesomeIcon icon={faEdit} size="lg" />
                                            &nbsp;&nbsp;Edit
                                        </button>
                                        <button onClick={deleteCardPrompt(removeCategory, category, [setOptionsVisibleCategory])}>
                                            <FontAwesomeIcon icon={faTrashAlt} size="lg" />
                                            &nbsp;&nbsp;Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay' {...preventSwipeHandlers}>
                    <h3>Edit Category &nbsp;<FontAwesomeIcon icon={faLayerGroup} size="1x" /></h3>
                    <p>Category Name
                        <input
                            className='overlay-input'
                            type='text'
                            value={currentCategory.name}
                            onChange={(e) => { setCurrentCategory({ ...currentCategory, name: e.target.value }); setErrorMessage(''); }} />
                    </p>
                    <p style={{ marginBottom: '10px' }}>Category Description</p>
                    <MarkdownEditor value={currentCategory.description} onChange={(v) => { setCurrentCategory({ ...currentCategory, description: v }); setErrorMessage(''); }} />
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={updateCategory} className='green-button'>Save</button>
                    <button onClick={closeOverlay} className='red-button'>Cancel</button>
                </div>
            )}

            {/* Add overlay window */}
            {isOverlayOpen === 1 && (
                <div className='overlay' {...preventSwipeHandlers}>
                    <h3>Add a new Category &nbsp;<FontAwesomeIcon icon={faLayerGroup} size="1x" /></h3>
                    <p>Category Name
                        <input
                            className='overlay-input'
                            type='text'
                            value={newCategoryName}
                            onChange={(e) => { setNewCategoryName(e.target.value); setErrorMessage(''); }} />
                    </p>
                    <p style={{ marginBottom: '10px' }}>Category Description</p>
                    <MarkdownEditor value={newCategoryDesc} onChange={(v) => { setNewCategoryDesc(v); setErrorMessage(''); }} />
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={addCategory} className='green-button'>Add Category</button>
                    <button onClick={closeOverlay} className='red-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

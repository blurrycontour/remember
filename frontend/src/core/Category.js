import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faPlusSquare, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, SortItems, HandleAxiosError, SetAxiosRetry, PreventSwipe } from './Utils';
import { MarkdownEditor, MarkdownPreview } from './Editor';


SetAxiosRetry();

export function Category()
{
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(0);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [errorMessage, setErrorMessage] = useState('');
    const [sortType, setSortType] = useState(localStorage.getItem('sortTypeCategories') || 'name');
    const [sortOrder, setSortOrder] = useState(localStorage.getItem('sortOrderCategories') || 'asc');
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;
    SetAxiosDefaults();
    const preventSwipeHandlers = PreventSwipe();

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
            // setCategories(response.data);
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

    useEffect(() =>
    {
        fetchCategories();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        setCategories(prevCategories => SortItems([...prevCategories], sortType, sortOrder));
        localStorage.setItem('sortTypeCategories', sortType);
        localStorage.setItem('sortOrderCategories', sortOrder);
    }, [sortType, sortOrder]);


    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    <h1>Categories &nbsp; </h1>
                    <div className="normal-icon">
                        <h1>
                            <FontAwesomeIcon icon={faPlusSquare} size="1x" onClick={() => openOverlay(1, null)} />
                        </h1>
                    </div>
                </div>

                <div className='tool-card' style={{width: 'auto'}}>
                    <h3 style={{ minWidth: '70px' }} >Sort by:</h3>
                    <span style={{padding: '0px 5px'}}></span>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="nCards">#Cards</option>
                    </select>
                    <span style={{padding: '0px 5px'}}></span>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{minWidth: '128px'}}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className='cards-container'>
                    {categories.length !== 0 && categories.map(category => (
                        <div key={category.id} className="card">
                            <h2 className='card-hx'>{category.name}</h2>
                            {!!category.description && <MarkdownPreview source={category.description} />}
                            <h4 className='card-hx' style={{ color: 'gray', paddingBottom: '15px' }}>Number of Cards → {category["#cards"]}</h4>
                            <button onClick={() => navigate(`/category/${category.id}`)} className='blue-button'>View</button>
                            <div className="delete-icon">
                                <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCategory, category)} />
                            </div>
                            <div className="edit-icon">
                                <FontAwesomeIcon icon={faEdit} size="lg" onClick={() => openOverlay(2, category)} />
                            </div>
                        </div>
                    ))}

                    {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
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

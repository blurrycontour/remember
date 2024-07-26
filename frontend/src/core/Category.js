import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults, SortItems } from './Utils';


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
            console.error(error);
            error.response ? setStatusMessage(error.response.data) : setStatusMessage('Failed to connect to API server!');
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
            console.error(error);
            setErrorMessage(error.response?.data);
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
            console.error(error);
            setErrorMessage(error.response?.data);
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
            console.error(error);
            setStatusMessage(error.response?.data);
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
                    <span style={{padding: '0px 8px'}}></span>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="name">Name</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                    </select>
                    <span style={{padding: '0px 8px'}}></span>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className='cards-container'>
                    {categories.length !== 0 && categories.map(category => (
                        <div key={category.id} className="card">
                            <h2>{category.name}</h2>
                            {!!category.description && <h3>{category.description.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>}
                            <h3 style={{ color: 'gray', paddingBottom: '15px' }}>Number of Cards → {category["#cards"]}</h3>
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
                <div className='overlay'>
                    <h3>Edit Category</h3>
                    <p>Category Name
                        <input
                            type='text'
                            value={currentCategory.name}
                            onChange={(e) => { setCurrentCategory({ ...currentCategory, name: e.target.value }); setErrorMessage(''); }} />
                    </p>
                    <p>Category Description
                        <textarea value={currentCategory.description} onChange={(e) => { setCurrentCategory({ ...currentCategory, description: e.target.value }); setErrorMessage(''); }} />
                    </p>
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={updateCategory} className='green-button'>Save</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}

            {/* Add overlay window */}
            {isOverlayOpen === 1 && (
                <div className="overlay">
                    <h3>Add a new Category</h3>
                    <p>Category Name
                        <input
                            type='text'
                            value={newCategoryName}
                            onChange={(e) => { setNewCategoryName(e.target.value); setErrorMessage(''); }} />
                    </p>
                    <p>Category Description
                        <textarea value={newCategoryDesc} onChange={(e) => { setNewCategoryDesc(e.target.value); setErrorMessage(''); }} />
                    </p>
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={addCategory} className='green-button'>Add Category</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

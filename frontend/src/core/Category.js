import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faHome, faUser, faEdit, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults } from './Utils';

import '../css/Common.css';
import '../css/Button.css';


export function Category()
{
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [isOverlayOpen, setIsOverlayOpen] = useState(0);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const API_URL = '/api';
    SetAxiosDefaults();

    // Category functions
    const fetchCategories = async () =>
    {
        const response = await axios.get(`${API_URL}/category/`);
        setCategories(response.data);
    };

    const addCategory = async () =>
    {
        const response = await axios.post(`${API_URL}/category/`, { name: newCategoryName, description: newCategoryDesc });
        if (response.data === null){
            setErrorMessage('Category already exists!');
            return;
        }
        closeOverlay();
        fetchCategories();
    };

    const removeCategory = async (categoryId) =>
    {
        await axios.delete(`${API_URL}/category/${categoryId}`);
        fetchCategories();
    };

    const updateCategory = async () =>
    {
        // await axios.put(`${API_URL}/category/${currentCategory.ID}`, currentCategory);
        closeOverlay();
        fetchCategories();
    };

    // Overlay functions
    const openOverlay = (type, category) =>
    {
        setCurrentCategory(category);
        setIsOverlayOpen(type);
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
    }, []);

    return (
        <div>
            <div className='content'>
                <div className='card2'>
                    <div className='header'>
                        <div className='back-button'>
                            <Link to="/">
                                <FontAwesomeIcon icon={faHome} size="2x" />
                            </Link>
                        </div>
                        <h1>Categories &nbsp; </h1>
                        <div className="normal-icon">
                            <FontAwesomeIcon icon={faPlusSquare} size="2x" onClick={() => openOverlay(1, null)} />
                        </div>
                        <div className='account-button'>
                            <Link to="/account">
                                <FontAwesomeIcon icon={faUser} size="2x" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className='cards-container'>
                    {categories.length !== 0 ? categories.map(category => (
                        <div key={category.ID} className="card">
                            <h2>{category.Name}</h2>
                            {!!category.Description && <h3>{category.Description.split('\n').map((line, index) => <span key={index}>{line}<br /></span>)}</h3>}
                            <h3>Number of Cards: {category["#Cards"]}</h3>
                            <button onClick={() => window.location.href = `/category/${category.ID}`} className='blue-button'>View</button>
                            <div className="delete-icon">
                                <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCategory, category.ID)} />
                            </div>
                            <div className="show-icon">
                                <FontAwesomeIcon icon={faEdit} size="lg" onClick={() => openOverlay(2, category)} />
                            </div>
                        </div>
                    )) : <h3 style={{ textAlign: 'center' }}>No categories found!</h3>}
                </div>
            </div>

            {/* Edit overlay window */}
            {isOverlayOpen === 2 && (
                <div className='overlay'>
                    <h3>Edit Category</h3>
                    <p>Category Name
                        <input
                            type='text'
                            value={currentCategory.Name}
                            onChange={(e) => setCurrentCategory({ ...currentCategory, Name: e.target.value })} />
                    </p>
                    <p>Category Description
                        <textarea value={currentCategory.Description} onChange={(e) => setCurrentCategory({ ...currentCategory, Description: e.target.value })} />
                    </p>
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
                            onChange={(e) => setNewCategoryName(e.target.value)} />
                    </p>
                    <p>Category Description
                        <textarea value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} />
                    </p>
                    {!!errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <button onClick={addCategory} className='green-button'>Add Category</button>
                    <button onClick={closeOverlay} className='blue-button'>Cancel</button>
                </div>
            )}
        </div>
    );
}

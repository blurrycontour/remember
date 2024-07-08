import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faHome, faUser } from '@fortawesome/free-solid-svg-icons';
import { deleteCardPrompt, SetAxiosDefaults } from './Utils';

import '../Common.css';


export function Category() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');

    const API_URL = '/api';
    SetAxiosDefaults();

    const fetchCategories = async () => {
        const response = await axios.get(`${API_URL}/category/`);
        setCategories(response.data);
        console.log(response.data, !!response.data);
    };

    const addCategory = async () => {
        await axios.post(`${API_URL}/category/`, { name: newCategoryName, description: newCategoryDesc });
        setNewCategoryName('');
        setNewCategoryDesc('');
        fetchCategories();
    };

    const removeCategory = async (categoryId) => {
        await axios.delete(`${API_URL}/category/${categoryId}`);
        fetchCategories();
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <div className='card2'>
                <div className='header'>
                    <div className='back-button'>
                        <Link to="/">
                            <FontAwesomeIcon icon={faHome} size="2x" />
                        </Link>
                    </div>
                    <h1>Categories</h1>
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
                        {!!category.Description && <h3>{category["Description"]}<br/></h3>}
                        <h3>Number of Cards: {category["#Cards"]}</h3>
                        <button onClick={() => window.location.href = `/category/${category.ID}`} className='blue-button'>View</button>
                        <div className="delete-icon">
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={deleteCardPrompt(removeCategory, category.ID)} />
                        </div>
                    </div>
                )) : <h3 style={{ textAlign: 'center' }}>No categories found!</h3>}
            </div>
            <br />
            <br />
            <div className="card1">
                <h3>Add a new category</h3>
                <p>Category Name
                    <input
                        type='text'
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    /></p>
                <p>Category Description
                    <input
                        type='text'
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                    /></p>
                <button onClick={addCategory} className='green-button'>Add Category</button>
            </div>
        </div>
    );
}

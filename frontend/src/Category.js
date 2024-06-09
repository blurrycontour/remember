import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import './Common.css';


function Category() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    const API_URL = '/api';


    const fetchCategories = async () => {
        const response = await axios.get(`${API_URL}/category/`);
        setCategories(response.data);
    };

    const addCategory = async () => {
        await axios.post(`${API_URL}/category/`, { name: newCategoryName });
        setNewCategoryName('');
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
                </div>
            </div>
            <div className='cards-container'>
                {categories.map(category => (
                    <div key={category.ID} className="card">
                        <h2>{category.Name}</h2>
                        <h3>Number of Cards: {category["#Cards"]}</h3>
                        <button onClick={() => window.location.href = `/category/${category.ID}`}>View</button>
                        <div className="delete-icon">
                            <FontAwesomeIcon icon={faTrashAlt} size="lg" onClick={() => {
                                if (window.confirm('Are you sure you want to delete this category?')) {
                                    removeCategory(category.ID);
                                }
                            }} />
                        </div>
                    </div>
                ))}
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
                <button onClick={addCategory}>Add Category</button>
            </div>
        </div>
    );
}

export default Category;

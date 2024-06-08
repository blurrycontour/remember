import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Category.css';


function Category() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const API_URL = 'http://localhost:5000';


    const fetchCategories = async () => {
        const response = await axios.get(`${API_URL}/category`);
        setCategories(response.data);
    };

    const addCategory = async () => {
        await axios.post(`${API_URL}/category`, { name: newCategoryName });
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
            <h1>Categories</h1>
            <div className='cards-container'>
                {categories.map(category => (
                    <div key={category.ID} className="card">
                        <h2>{category.Name}</h2>
                        <p>Number of Cards: {category["#Cards"]}</p>
                        <p>ID: {category.ID}</p>
                        <p>Created: {category.Created}</p>
                        <p>Last updated: {category.Updated}</p>
                        <button onClick={() => window.location.href = `/${category.ID}`}>View</button>
                        <button onClick={() => removeCategory(category.ID)} style={{backgroundColor: '#FF2222'}}>Remove</button>
                    </div>
                ))}
            </div>
            <br/>
            <br/>
            <div className="card1">
                <input
                    type='text'
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button onClick={addCategory}>Add Category</button>
            </div>
        </div>
    );
}

export default Category;

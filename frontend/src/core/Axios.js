import axios from 'axios';
import { Link } from 'react-router-dom';
import axiosRetry from 'axios-retry';
import { auth } from '../config/firebase.config';

export const API_URL = process.env.REACT_APP_API_URL;


export const SetAxiosAuthorization = async () =>
{
    const user = auth.currentUser;

    if (user) {
        try {
            const token = await user.getIdToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
    }
}


export function SetAxiosDefaults()
{
    axios.defaults.headers.common['ngrok-skip-browser-warning'] = true;
    axios.defaults.headers.common['disable-tunnel-reminder'] = true;
    axios.defaults.headers.common['localtonet-skip-warning'] = true;
}


export function GetUserButton()
{
    const user = auth.currentUser;
    return (
        <Link to="/account">
            <img src={user?.photoURL} alt={user?.displayName} className="user-photo" />
        </Link>
    );
}


export function HandleAxiosError(error, setErrorMessage)
{
    console.error(error);
    error.response ?
    (
        error.response.headers['content-type'] === 'text/html' ?
        setErrorMessage(error.message) : setErrorMessage(error.response.data)
    )
    :
    setErrorMessage('Failed to connect to API server!');
}


export function SetAxiosRetry() {
    axiosRetry(axios, {
        retries: 5,
        retryCondition: (error) => {
            return error.response?.status === 502;
        },
        retryDelay: (retryCount) => {
            return 25;
        },
        onRetry: (retryCount, error, requestConfig) => {
            console.log(`Retry #${retryCount} for request: ${requestConfig.url}`);
        }
    });
}


export function UseLocalStorage() {
    const user = auth.currentUser;
    const userEmail = user?.email || 'unknown@user';

    const setStorageItem = (key, value) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        data[key] = value;
        localStorage.setItem(userEmail, JSON.stringify(data));
    };

    const getStorageItem = (key, defaultValue) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        return data[key] || defaultValue;
    };

    const setUserStorageItem = (userEmail, key, value) => {
        const data = JSON.parse(localStorage.getItem(userEmail) || '{}');
        data[key] = value;
        localStorage.setItem(userEmail, JSON.stringify(data));
    };

    return { setStorageItem, getStorageItem, setUserStorageItem };
}

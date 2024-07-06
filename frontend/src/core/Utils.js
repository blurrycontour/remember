import axios from 'axios';
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthProvider';

const API_URL = '/api';

export function deleteCardPrompt(removeFunction, removeID) {
    return async () => {
        const isConfirmed = window.confirm('Are you sure you want to delete the card?');
        // const confirmationCode = window.prompt('Enter code to delete the card');
        // if (confirmationCode === null) return;
        const confirmationCode = "valmiki";
        if (!isConfirmed) return;
        const response = await axios.post(`${API_URL}/card/check_code`, { code: confirmationCode });
        console.log(response.data);
        if (response.data) {
            removeFunction(removeID);
        } else {
            window.alert('Invalid code!')
        }
    }
}

export function setAxiosDefaults() {
    const { user } = useContext(AuthContext);
    axios.defaults.headers.common['Authorization'] = `Bearer ${user?.accessToken}`;
}

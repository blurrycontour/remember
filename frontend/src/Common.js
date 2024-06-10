import axios from 'axios';

const API_URL = '/api';

export function deleteCardPrompt(removeFunction, removeID) {
    return async () => {
        const confirmation_code = window.prompt('Enter code to delete the card');
        if (confirmation_code === null) return;
        const response = await axios.post(`${API_URL}/card/check_code`, { code: confirmation_code });
        console.log(response.data);
        if (response.data) {
            removeFunction(removeID);
        } else {
            window.alert('Invalid code!')
        }
    }
}

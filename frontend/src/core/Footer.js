import React, { useState, useEffect } from 'react';
import axios from 'axios';

import '../css/Common.css';
import '../css/Button.css';


export function Footer()
{
    const [buildInfo, setBuildInfo] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchBuildInfo = async () =>
    {
        try
        {
            const response = await axios.get(`${API_URL}/public/build`, { headers: { 'ngrok-skip-browser-warning': 'ok' } });
            if (typeof (response.data) === 'string')
            {
                setBuildInfo(null);
                return;
            }
            setBuildInfo(response.data);
        } catch (error)
        {
            console.error(error);
            setBuildInfo(null);
        }
    };

    useEffect(() =>
    {
        fetchBuildInfo();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            {!!buildInfo &&
                <div className='footer'>
                    <p>Build: {buildInfo.version}</p>
                </div>
            }
        </div>
    );
}

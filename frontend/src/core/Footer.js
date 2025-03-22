import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SetAxiosRetry, SetAxiosDefaults, API_URL } from './Axios';

SetAxiosRetry();

export function Footer() {
    const [buildInfo, setBuildInfo] = useState(null);

    SetAxiosDefaults();

    const fetchBuildInfo = async () => {
        try {
            const response = await axios.get(`${API_URL}/public/build`);
            if (typeof (response.data) === 'string') {
                setBuildInfo(null);
                return;
            }
            setBuildInfo(response.data);
        } catch (error) {
            console.error(error);
            setBuildInfo(null);
        }
    };

    useEffect(() => {
        fetchBuildInfo();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            {!!buildInfo &&
                <div className='footer'>
                    <p>Build: <a href={`https://github.com/blurrycontour/remember/tree/${buildInfo.version}`}>{buildInfo.version}</a></p>
                </div>
            }
        </div>
    );
}

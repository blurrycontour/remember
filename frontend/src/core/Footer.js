import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SetAxiosRetry, API_URL } from './Utils';

SetAxiosRetry();

export function Footer() {
    const [buildInfo, setBuildInfo] = useState(null);

    const fetchBuildInfo = async () => {
        try {
            const response = await axios.get(`${API_URL}/public/build`, { headers:
                {
                    "ngrok-skip-browser-warning": true,
                    "disable-tunnel-reminder": true,
                    "localtonet-skip-warning": true
                }
            });
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { SetAxiosRetry, SetAxiosAuthorization, SetAxiosDefaults, API_URL } from './Axios';


SetAxiosRetry();

export function Footer() {
    const [buildInfo, setBuildInfo] = useState(null);
    const [tokenTime, setTokenTime] = useState(null);

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

    const fetchTokenTime = async () =>
    {
        try
        {
            await SetAxiosAuthorization();
            const timezoneOffset = -(new Date()).getTimezoneOffset();
            const response = await axios.get(`${API_URL}/account/token-info?tz_offset=${timezoneOffset}`);
            if (typeof (response.data) === 'string')
            {
                setTokenTime(null);
                return;
            }
            setTokenTime(response.data);
        } catch (error)
        {
            console.error(error);
            setTokenTime(null);
        }
    };

    const isTokenExpired = () => {
        if (!tokenTime || !tokenTime.exp) return true;
        const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)
        const tokenExpiryTime = Math.floor(new Date(tokenTime.exp).getTime() / 1000); // Token expiry time in Unix timestamp (seconds)
        return currentTime > tokenExpiryTime;
    };

    useEffect(() => {
        fetchBuildInfo();
        fetchTokenTime();
        // eslint-disable-next-line
    }, []);

    return (
        <div>
            {!!buildInfo &&
                <div className='footer'>
                    <p>
                        <span>
                            {isTokenExpired()  ?
                                <span style={{ color: 'red' }}><FontAwesomeIcon icon={faCircleXmark} /></span> :
                                <span style={{ color: 'green' }}><FontAwesomeIcon icon={faCircleCheck} /></span>
                            }
                        &nbsp;
                        </span>
                        Build: <a href={`https://github.com/blurrycontour/remember/tree/${buildInfo.version}`}>{buildInfo.version}</a>
                    </p>
                </div>
            }
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { SetAxiosRetry, SetAxiosAuthorization, SetAxiosDefaults, API_URL } from './Axios';
import { auth } from '../config/firebase.config';


SetAxiosRetry();

export function Footer() {
    const [buildInfo, setBuildInfo] = useState(null);
    const [tokenTime, setTokenTime] = useState(null);
    const [isExpired, setIsExpired] = useState(true);
    const [currentToken, setCurrentToken] = useState(null);

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
            const user = auth.currentUser;
            setCurrentToken(await user.accessToken);
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

    const updateCurrentTokenIfTokenRefreshed = async () =>
    {
        const latestToken = auth.currentUser.accessToken;
        // console.log('currentToken:', currentToken);
        if (latestToken !== currentToken) {
            await fetchTokenTime();
        }
    };

    const checkTokenExpired = () => {
        if (!tokenTime || !tokenTime.exp) setIsExpired(true);
        const currentTimeUnix = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)
        // const tokenExpiryTimeUnix = Math.floor(new Date("2025-03-24 00:04:15 +0100").getTime() / 1000); // Token expiry time in Unix timestamp (seconds)
        const tokenExpiryTimeUnix = Math.floor(new Date(tokenTime.exp).getTime() / 1000); // Token expiry time in Unix timestamp (seconds)
        setIsExpired(currentTimeUnix > tokenExpiryTimeUnix);
    };

    useEffect(() => {
        fetchBuildInfo();
        fetchTokenTime();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            checkTokenExpired();
        }, 1000); // Check every 1 second

        return () => clearInterval(interval); // Cleanup interval on component unmount
        // eslint-disable-next-line
    }, [tokenTime]);

    useEffect(() => {
        const interval = setInterval(() => {
            updateCurrentTokenIfTokenRefreshed();
        }, 5*1000); // Check every 1 second

        return () => clearInterval(interval); // Cleanup interval on component unmount
        // eslint-disable-next-line
    }, [currentToken]);

    return (
        <div>
            {!!buildInfo &&
                <div className='footer'>
                    <p>
                        <span>
                            {isExpired  ?
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

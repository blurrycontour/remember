import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { SetAxiosRetry, SetAxiosAuthorization, SetAxiosDefaults, API_URL } from './Axios';
import { getAuth, onIdTokenChanged } from "firebase/auth";



SetAxiosRetry();

export function Footer() {
    const [buildInfo, setBuildInfo] = useState(null);
    const [tokenTime, setTokenTime] = useState(null);
    const [isExpired, setIsExpired] = useState(0); // 0: Loading, 1: Expired, 2: Valid

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


    const checkTokenExpired = () => {
        if (!tokenTime || !tokenTime?.exp)
        {
            setIsExpired(0);
            return;
        };
        const currentTimeUnix = Math.floor(Date.now() / 1000); // Current time in Unix timestamp (seconds)
        // const tokenExpiryTimeUnix = Math.floor(new Date("2025-03-24 19:34:15 +0100").getTime() / 1000); // Token expiry time in Unix timestamp (seconds)
        const tokenExpiryTimeUnix = Math.floor(new Date(tokenTime.exp).getTime() / 1000); // Token expiry time in Unix timestamp (seconds)
        setIsExpired(currentTimeUnix > tokenExpiryTimeUnix ? 1 : 2);
    };

    useEffect(() => {
        fetchBuildInfo();
        // fetchTokenTime();
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
        const auth = getAuth();

        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                await fetchTokenTime();
            }

            return () => unsubscribe();
        });
        // eslint-disable-next-line
    }, []);


    const renderIcon = () => {
        switch (isExpired) {
            case 1:
                return <span style={{ color: 'orange' }}><FontAwesomeIcon icon={faCircleExclamation} /></span>;
            case 2:
                return <span style={{ color: 'green' }}><FontAwesomeIcon icon={faCircleCheck} /></span>;
            default:
                return <span style={{ color: 'red' }}><FontAwesomeIcon icon={faCircleXmark} /></span>;
        };
    };

    return (
        <div>
            <div className='footer'>
            <p>
                <span>
                    {renderIcon()}
                &nbsp;
                </span>
                {!!buildInfo &&
                    <span>
                        Build: <a href={`https://github.com/blurrycontour/remember/tree/${buildInfo.version}`}>{buildInfo.version}</a>
                    </span>
                }
            </p>
            </div>
        </div>
    );
}

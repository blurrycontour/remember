import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthProvider';
import axios from 'axios';
import { SetAxiosDefaults, SetAxiosAuthorization, HandleAxiosError, SetAxiosRetry, API_URL } from '../core/Axios';
import { formattedTime } from '../core/Utils';


SetAxiosRetry();

export function Account()
{
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [tokenTime, setTokenTime] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [currentTime, setCurrentTime] = useState(formattedTime());
    const [deltaTime, setDeltaTime] = useState('xx:xx');

    SetAxiosDefaults();

    const handleLogout = () =>
    {
        user.auth.signOut();
    }

    const fetchStats = async () =>
    {
        try
        {
            await SetAxiosAuthorization();
            const response = await axios.get(`${API_URL}/account/stats`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            setStats(response.data);
            setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
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
                setStatusMessage('Bad response from API server!');
                return;
            }
            setTokenTime(response.data);
            setStatusMessage('');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
        }
    };


    useEffect(() =>
    {
        fetchStats();
        fetchTokenTime();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(formattedTime(now));

            if (!tokenTime || !tokenTime?.exp)
            {
                setDeltaTime('xx:xx');
                return;
            }
            const delta = Math.floor((new Date(tokenTime.exp) - now) / 1000);
            if (delta <= 0)
            {
                setDeltaTime('00:00');
                return;
            }
            const pad = (num) => (num < 10 ? '0' : '') + num;
            const minutes = pad(Math.floor(delta / 60));
            const seconds = pad(Math.abs(delta) % 60);
            setDeltaTime(`${minutes}:${seconds}`);
        }, 1000); // Every 1 second

        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [tokenTime]);

    return (
        <div>
            <div className='card2'>
                <h1>Welcome!</h1>
            </div>

            <div className='cards-container'>
                <div className='card3'>
                    <h2>{user?.displayName}</h2>
                    {user?.photoURL && <img src={user?.photoURL} alt='User' style={{ width: '100px', height: '100px', borderRadius: '50%' }} />}
                    <h3>{user?.email}</h3>
                    <button onClick={handleLogout} className='login-button'>Log out</button>
                </div>

                {!!stats && <div className='card3'>
                    <h2 style={{ margin: '0.5em' }}>Statistics 📊</h2>
                    <hr />
                    <h3 style={{ margin: '0.5em' }}>Categories → {stats.category.count}</h3>
                    <h3 style={{ margin: '0.5em' }}>{stats.category.add}➕ &nbsp; {stats.category.update}🖋️ &nbsp; {stats.category.delete}🗑️</h3>
                    <hr />
                    <h3 style={{ margin: '0.5em' }}>Cards → {stats.card.count}</h3>
                    <h3 style={{ margin: '0.5em' }}>{stats.card.add}➕ &nbsp; {stats.card.update}🖋️ &nbsp; {stats.card.delete}🗑️ &nbsp; {stats.card.favorite}⭐</h3>
                </div>}

                {!!tokenTime && <div className='card3'>
                    <h3 style={{ margin: '0.5em' }}>Token Info</h3>
                    <code style={{ margin: '0.5em' }}>iat : {tokenTime.iat}</code>
                    <code style={{ margin: '0.5em' }}>exp : {tokenTime.exp}</code>
                    <code style={{ margin: '0.5em' }}>now : {currentTime}</code>
                    <code style={{ margin: '0.5em' }}>[{deltaTime}]</code>
                </div>}
            </div>

            {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}
        </div>
    );
}

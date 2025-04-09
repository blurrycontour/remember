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
    const [ipInfo, setIpInfo] = useState(null);
    const [tokenTime, setTokenTime] = useState(null);
    const [deletePrompt, setDeletePrompt] = useState(false);
    const [deletePromptInput, setDeletePromptInput] = useState('');
    const [statusMessage, setStatusMessage] = useState('Loading...');
    const [deleteStatusMessage, setDeleteStatusMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(formattedTime());
    const [deltaTime, setDeltaTime] = useState('xx:xx');

    SetAxiosDefaults();

    //// Account handling methods

    const handleLogout = () =>
    {
        user.auth.signOut();
    }

    const handleDeleteUser = async () =>
    {
        if (deletePromptInput !== 'DELETE-ME')
        {
            setDeleteStatusMessage('Invalid input!');
            return;
        }
        try
        {
            await SetAxiosAuthorization();
            const response = await axios.delete(`${API_URL}/account/user`);
            if (typeof (response.data) === 'string')
            {
                setStatusMessage('Bad response from API server!');
                return;
            }
            handleLogout();
            setStatusMessage('Deleted account successfully!');
        } catch (error)
        {
            HandleAxiosError(error, setStatusMessage);
            setStatusMessage((prev) => <span>{prev} <br/> (Failed to delete account!)</span>);
        }
    };


    ///// Stats and token methods

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

    const fetchIpInfo = async () =>
        {
            try
            {
                const response = await axios.get(`${API_URL}/public/ip-info`);
                if (typeof (response.data) === 'string')
                {
                    setStatusMessage('Bad response from API server!');
                    return;
                }
                setIpInfo(response.data);
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
        fetchIpInfo();
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
                    {!!ipInfo && <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                        <code style={{ margin: '0.5em' }}>[{ipInfo.ip}]</code>
                        <code style={{ margin: '0.5em' }}>{ipInfo.isp}</code>
                        <code style={{ margin: '0.5em' }}>{ipInfo.city}, {ipInfo.country}</code>
                        <br/>
                    </div>}
                </div>

                {!!statusMessage && <h3 style={{ textAlign: 'center' }}>{statusMessage}</h3>}

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

                <div className='card3' style={{ backgroundColor: 'rgba(125, 125, 125, 0.05)' }}>
                    <button onClick={() => {setDeletePrompt(true)}} className='red-button'>Delete Account</button>
                    {deletePrompt && <div>
                        <p><b>Are you sure?</b></p>
                        <p>This will permanently <span style={{color: 'red'}}>delete</span> all the data associated with your account!</p>
                        <p>Type <b>DELETE-ME</b> to confirm</p>
                        {!!deleteStatusMessage && <p style={{color: 'red'}}>{deleteStatusMessage}</p>}
                        <input
                            style={{marginTop: '0px'}}
                            className='overlay-input'
                            placeholder=''
                            onChange={(e) => { setDeleteStatusMessage(''); setDeletePromptInput(e.target.value); }}
                        />
                        <button onClick={() => {setDeleteStatusMessage('');setDeletePromptInput('');setDeletePrompt(false)}} className='blue-button'>Cancel</button>
                        <button onClick={handleDeleteUser} className='red-button'>Confirm</button>
                    </div>}
                </div>
            </div>
        </div>
    );
}

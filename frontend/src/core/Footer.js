import React, { useState, useEffect } from 'react';

import '../css/Common.css';
import '../css/Button.css';


export function Footer()
{
    const [buildVersion, setBuildVersion] = useState(null);

    useEffect(() =>
    {
        setBuildVersion(process.env.REACT_APP_BUILD_VERSION);
    }, []);

    return (
        <div>
            {!!buildVersion &&
                <div className='footer'>
                    <p>Build: {buildVersion}</p>
                </div>
            }
        </div>
    );
}

import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate, useLocation } from 'react-router-dom';

export const SwipeableRoutes = ({ children }) =>
{
  const navigate = useNavigate();
  const location = useLocation();

  const handlers = useSwipeable({
    onSwipedLeft: () =>
    {
      if (location.pathname === '/' || location.pathname === '/random') {
        navigate('/category');
      } else if (location.pathname === '/category') {
        const lastCardID = localStorage.getItem('lastCardID');
        navigate(lastCardID ? `/category/${lastCardID}` : '/account');
      } else if (location.pathname.includes('/category/')) {
        navigate('/account');
      } else if (location.pathname === '/account') {
        navigate('/');
      }
    },
    onSwipedRight: () =>
    {
      if (location.pathname === '/' || location.pathname === '/random') {
        navigate('/account');
      } else if (location.pathname === '/category') {
        navigate('/');
      } else if (location.pathname.includes('/category/')) {
        navigate('/category');
      } else if (location.pathname === '/account') {
        const lastCardID = localStorage.getItem('lastCardID');
        navigate(lastCardID ? `/category/${lastCardID}` : '/category');
      }
    },
    // Configure to your needs
    delta: 40, // Minimum distance(px) before a swipe starts.
    preventDefaultTouchmoveEvent: true, // Prevent scrolling during swipe.
    trackTouch: true,
    trackMouse: false,
  });

  return (
    <div style={{ width: '100%', height: '100vh' }} {...handlers}>
      {children}
    </div>
  );
};

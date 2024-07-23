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
      // Swipe left: navigate based on current path
      switch (location.pathname)
      {
        case '/random' || '/':
          navigate('/category');
          break;
        case '/category':
          navigate('/account');
          break;
        case '/account':
          break;
        default:
          navigate('/category');
          break;
      }
    },
    onSwipedRight: () =>
    {
      // Swipe right: navigate based on current path
      switch (location.pathname)
      {
        case '/random' || '/':
          break;
        case '/category':
          navigate('/');
          break;
        case '/account':
          navigate('/category');
          break;
        default:
          navigate('/category');
          break;
      }
    },
    // Configure to your needs
    delta: 10, // Minimum distance(px) before a swipe starts.
    preventDefaultTouchmoveEvent: true, // Prevent scrolling during swipe.
    trackTouch: true,
    trackMouse: false,
  });

  return <div {...handlers}>{children}</div>;
};

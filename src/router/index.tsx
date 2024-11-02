import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import History from '../pages/History';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/settings',
        element: <Settings />,
    },
    {
        path: '/history',
        element: <History />,
    }
]);

export default router; 
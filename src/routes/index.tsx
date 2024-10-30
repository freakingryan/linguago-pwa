import { createHashRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import History from '../pages/History';
import ErrorBoundary from '../components/ErrorBoundary';

export const router = createHashRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <ErrorBoundary><div>出错了</div></ErrorBoundary>,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'settings',
                element: <Settings />,
            },
            {
                path: 'history',
                element: <History />,
            },
        ],
    },
]); 
import { createHashRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Settings from '../pages/Settings';
import History from '../pages/History';
import Conversation from '../pages/Conversation';
import ConversationHistory from '../pages/ConversationHistory';
import Vocabulary from '../pages/Vocabulary';
import LyricsManagement from '../pages/LyricsManagement';
import LyricsDetail from '../pages/LyricsDetail';
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
            {
                path: 'conversation',
                element: <Conversation />,
            },
            {
                path: 'conversation-history',
                element: <ConversationHistory />,
            },
            {
                path: 'vocabulary',
                element: <Vocabulary />,
            },
            {
                path: 'lyrics',
                element: <LyricsManagement />,
            },
            {
                path: 'lyrics/:id',
                element: <LyricsDetail />,
            },
        ],
    },
]); 
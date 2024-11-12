import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from './routes';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import { indexedDBService } from './services/indexedDB';
import './styles/index.css';

// 初始化应用
const initializeApp = async () => {
    try {
        // 初始化 IndexedDB
        await indexedDBService.initialize();
        console.log('IndexedDB initialized successfully');
    } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
    }

    // 渲染应用
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Provider store={store}>
                <ErrorBoundary>
                    <RouterProvider router={router} />
                    <LoadingOverlay />
                </ErrorBoundary>
            </Provider>
        </React.StrictMode>
    );
};

// 启动应用
initializeApp();

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/linguago-pwa/service-worker.js').then(
            (registration) => {
                console.log('ServiceWorker registration successful');
            },
            (err) => {
                console.log('ServiceWorker registration failed: ', err);
            }
        );
    });
} 
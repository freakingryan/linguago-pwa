import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { indexedDBService } from './services/indexedDB';

// 初始化应用
const initializeApp = async () => {
  try {
    // 初始化 IndexedDB
    await indexedDBService.initialize();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>
  );
};

initializeApp();

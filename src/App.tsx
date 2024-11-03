import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from './routes';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import './styles/index.css';
import { useEffect } from 'react';
import { indexedDBService } from './services/indexedDB';

function App() {
  useEffect(() => {
    // 初始化 IndexedDB
    indexedDBService.initialize().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
        <LoadingOverlay />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;

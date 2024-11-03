import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { router } from './routes';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import './styles/index.css';

function App() {
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

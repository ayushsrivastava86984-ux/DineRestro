import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoPaymentModal } from './components/common/DemoPaymentModal';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
        <DemoPaymentModal />
        <ToastContainer />
      </AppProvider>
    </BrowserRouter>
  );
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import { UploadPage } from '@/components/upload/UploadPage';
import { ConfigPage } from '@/components/config/ConfigPage';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { configGuard, checkoutGuard } from './guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/upload" replace />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
      },
      {
        path: 'config',
        element: <ConfigPage />,
        loader: configGuard,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
        loader: checkoutGuard,
      },
    ],
  },
]);

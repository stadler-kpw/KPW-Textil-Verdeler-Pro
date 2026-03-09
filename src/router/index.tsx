import { createBrowserRouter, redirect } from 'react-router-dom';
import App from '@/App';
import { UploadPage } from '@/components/upload/UploadPage';
import { ConfigPage } from '@/components/config/ConfigPage';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { configGuard, checkoutGuard } from './guards';
import { parseDataFromUrl } from '@/lib/url-parser';
import { useConfigStore } from '@/stores/useConfigStore';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        loader: () => {
          const data = parseDataFromUrl(window.location.search);
          if (data.images.length > 0) {
            const store = useConfigStore.getState();
            store.setProductImages(data.images, data.sizes, data.price, data.productRef);
            return redirect('/config');
          }
          window.location.replace('https://www.kp-workwear.com');
          return null;
        },
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

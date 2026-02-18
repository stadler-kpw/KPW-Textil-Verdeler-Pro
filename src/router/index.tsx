import { createBrowserRouter, redirect } from 'react-router-dom';
import App from '@/App';
import { UploadPage } from '@/components/upload/UploadPage';
import { ConfigPage } from '@/components/config/ConfigPage';
import { CheckoutPage } from '@/components/checkout/CheckoutPage';
import { configGuard, checkoutGuard } from './guards';
import { parseDataFromUrl } from '@/lib/url-parser';
import { useConfigStore } from '@/stores/useConfigStore';
import { generateBlueprintViews } from '@/services/geminiService';

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
            // Shopify-Button: Produktdaten in Store setzen und Upload überspringen
            const store = useConfigStore.getState();
            store.setProductImages(data.images, data.sizes, data.price, data.productRef);
            store.setOriginalImages(data.images);
            store.setBlueprintStatus('loading');
            store.setBlueprintError(null);

            // Blueprint-Generierung asynchron im Hintergrund starten
            generateBlueprintViews(data.images[0])
              .then((blueprints) => {
                useConfigStore.getState().replaceBlueprintImages(blueprints);
              })
              .catch((error) => {
                console.error('Blueprint generation failed:', error);
                const s = useConfigStore.getState();
                s.setBlueprintError(
                  error instanceof Error
                    ? error.message
                    : 'Blueprint-Generierung fehlgeschlagen'
                );
                s.fallbackToOriginalImages();
              });

            return redirect('/config');
          }
          return redirect('/upload');
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

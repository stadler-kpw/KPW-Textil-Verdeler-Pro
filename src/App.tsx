import { Outlet } from 'react-router-dom';
import { useUrlParams } from '@/hooks/useUrlParams';

function App() {
  useUrlParams();

  return <Outlet />;
}

export default App;

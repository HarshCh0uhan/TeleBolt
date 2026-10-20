import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiltersProvider } from '../context/FiltersContext';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#181818]">
      <FiltersProvider>
        <Navbar />
        <Outlet />
      </FiltersProvider>
    </div>
  );
};

export default PublicLayout;

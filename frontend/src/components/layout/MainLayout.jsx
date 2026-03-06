import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-18">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

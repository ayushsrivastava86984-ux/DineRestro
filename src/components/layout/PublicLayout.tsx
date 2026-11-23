import { Outlet } from 'react-router-dom';
import { PublicNavbar } from '../navbar/PublicNavbar';
import { PublicFooter } from '../footer/PublicFooter';
import { RestaurantModal } from '../common/RestaurantModal';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5EA] text-[#321D17]">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <RestaurantModal />
    </div>
  );
}

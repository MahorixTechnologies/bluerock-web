import { LandlordDashboard } from "@/components/feature/home/LandlordDashboard";
import { ListingsHome } from "@/components/feature/home/ListingsHome";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";

export default function HomeRoute() {
  return (
    <DashboardRouter
      landlord={<LandlordDashboard />}
      renter={<ListingsHome />}
      public={<ListingsHome />}
    />
  );
}

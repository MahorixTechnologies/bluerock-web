import { LandlordDashboard } from "@/components/feature/home/LandlordDashboard";
import { RenterDashboard } from "@/components/feature/home/RenterDashboard";
import { HomePage as PublicHome } from "@/components/feature/home/HomePage";
import { DashboardRouter } from "@/components/feature/home/DashboardRouter";

export default function HomeRoute() {
  return (
    <DashboardRouter
      landlord={<LandlordDashboard />}
      renter={<RenterDashboard />}
      public={<PublicHome />}
    />
  );
}

import { LandlordDashboard } from "@/components/web/LandlordDashboard";
import { RenterDashboard } from "@/components/web/RenterDashboard";
import { HomePage as PublicHome } from "@/components/web/HomePage";
import { DashboardRouter } from "@/components/web/DashboardRouter";

export default function HomeRoute() {
  return (
    <DashboardRouter
      landlord={<LandlordDashboard />}
      renter={<RenterDashboard />}
      public={<PublicHome />}
    />
  );
}

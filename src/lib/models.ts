export type PropertyType = "House" | "Apartment";

export type Currency = "USD" | "NGN";

export type UserRole = "RENTER" | "LANDLORD" | "ADMIN";

export type Listing = {
  id: string;
  title: string;
  description?: string;
  location: string;
  pricePerNight: number;
  currency: Currency;
  rooms: number;
  bathrooms: number;
  type: PropertyType;
  images: string[];
  amenities: string[];
  rules?: string[];
  featured?: boolean;
  host: {
    name: string;
    phone?: string;
    email?: string;
  };
  availabilityNote: string;
};

export type WebBooking = {
  id: string;
  listingId: string;
  listingTitle: string;
  location: string;
  image: string;
  currency: Currency;
  startDate: string;
  endDate: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  createdAt: string;
};

export type WebUserProfile = {
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  role: UserRole;
};

export type PropertyType =
  | "EntireProperty"
  | "Apartment"
  | "House"
  | "Duplex"
  | "Studio"
  | "SingleRoom"
  | "SharedRoom"
  | "Hostel"
  | "StudentHousing"
  | "HotelRoom"
  | "Other";

export const ALL_PROPERTY_TYPES: readonly PropertyType[] = [
  "EntireProperty",
  "Apartment",
  "House",
  "Duplex",
  "Studio",
  "SingleRoom",
  "SharedRoom",
  "Hostel",
  "StudentHousing",
  "HotelRoom",
  "Other",
] as const;

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
  status?: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED" | "Published";
  featured?: boolean;
  featuredUntil?: string;
  createdAt?: string;
  host: {
    name: string;
    phone?: string;
    email?: string;
  };
  availabilityNote: string;
};

export type ListingCreateInput = {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  currency: Currency;
  rooms: number;
  bathrooms: number;
  type: PropertyType;
  images: string[];
  amenities: string[];
  rules: string[];
};

export type ListingUpdateInput = Partial<ListingCreateInput>;

export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUND_PENDING" | "REFUNDED";

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
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type OwnerBooking = {
  id: string;
  listingId: string;
  startDate: string;
  endDate: string;
  nights: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    location: string;
    currency: Currency;
    pricePerNight: number;
  };
  renter: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
  };
};

export type WebUserProfile = {
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
  role: UserRole;
};

export type OwnerApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "NONE";

export type OwnerApplicationResult = {
  id: string;
  email: string;
  role: UserRole;
  ownerApplicationStatus: OwnerApplicationStatus;
  ownerApplicationAt: string | null;
};

export type PaymentIntent = {
  id: string;
  bookingId: string;
  amount: number;
  currency: Currency;
  status: "CREATED" | "AUTHORIZED" | "CAPTURED" | "CANCELLED";
  clientSecret?: string;
  createdAt: string;
};

export type PaymentTransaction = {
  id: string;
  intentId: string;
  bookingId: string;
  amount: number;
  currency: Currency;
  status: "SUCCESS" | "FAILED" | "PENDING";
  method: "Card" | "Bank" | "Wallet";
  reference: string;
  processedAt: string;
  fee: number;
  net: number;
};

export type Receipt = {
  id: string;
  bookingId: string;
  transactionId: string;
  number: string;
  issuedAt: string;
  lineItems: { label: string; amount: number }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: Currency;
  payer: string;
  recipient: string;
  pdfUrl?: string;
};

export type Refund = {
  id: string;
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "COMPLETED" | "REJECTED";
  reference: string;
  requestedAt: string;
  completedAt?: string;
};

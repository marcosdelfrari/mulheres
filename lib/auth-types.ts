export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "cliente" | "acompanhante";
  phone: string | null;
  verificationStatus: "pending" | "submitted" | "verified" | "rejected";
  verificationMethod: string | null;
  documentPhotoUrl: string | null;
  profilePhotoUrl: string | null;
  verifiedAt: string | null;
};

export type ListingSummary = {
  id: string;
  title: string;
  description: string;
  pricePerHour: number;
  age: number;
  gender: string;
  region: string;
  city: string;
  neighborhood: string;
  phone: string | null;
  whatsapp: string | null;
  services: string[];
  servicesFor: string[];
  serviceLocations: string[];
  status: string;
  isLuxo: boolean;
  luxoUntil: string | null;
  online: boolean;
  photoUrl: string | null;
  photos: string[];
  createdAt: string;
};

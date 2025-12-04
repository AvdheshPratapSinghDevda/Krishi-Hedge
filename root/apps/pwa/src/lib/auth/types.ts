export interface FarmerProfile {
  id: string;
  user_type: 'farmer';
  full_name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  land_size: number;
  primary_crop: string;
  farming_experience: number;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  user_type: 'business';
  business_name: string;
  email: string;
  phone: string;
  gst_number: string;
  business_type: string;
  company_size: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_person: string;
  designation: string;
  trading_volume: number;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserProfile = FarmerProfile | BusinessProfile;

export interface SignupData {
  email: string;
  password: string;
  userType: 'farmer' | 'business';
  profile: Partial<FarmerProfile> | Partial<BusinessProfile>;
}

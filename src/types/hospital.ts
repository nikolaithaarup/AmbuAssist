export type HospitalPhoneNumber = {
  hospitalCode: string;
  hospitalName: string;
  specialtyKey: string;
  displayNameDa: string;
  displayNameEn?: string;
  phone: string;
  fallbackPhone?: string;
  active: boolean;
  updatedAt?: string;
};

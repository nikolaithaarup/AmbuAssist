export type BloodGasValues = {
  ph?: number;
  pco2?: number;
  po2?: number;
  hco3?: number;
  be?: number;
  so2?: number;
  na?: number;
  k?: number;
  ca?: number;
  cl?: number;
  glucose?: number;
  lactate?: number;
  urea?: number;
  creatinine?: number;
  hct?: number;
  hgb?: number;
  crp?: number;
};

export type BasicBloodGasInput = {
  pH?: number;
  pCO2?: number;
  HCO3?: number;
  glucose?: number;
  lactate?: number;
  crp?: number;
  nitrite?: boolean;
  leukocytes?: boolean;
};

export type BloodGasFormValues = {
  ph: string;
  pco2: string;
  po2: string;
  hco3: string;
  be: string;
  so2: string;

  na: string;
  k: string;
  ca: string;
  cl: string;

  glucose: string;
  lactate: string;
  urea: string;
  creatinine: string;

  hct: string;
  hgb: string;

  crp: string;
};

export type ParsedBloodGasValues = {
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

export type BloodGasFieldKey = keyof BloodGasFormValues;

export type ConfirmedByenCorrection = {
  page: number;
  street: string;
  district: string;
};

type CorrectionGroup = Omit<ConfirmedByenCorrection, "street"> & {
  streets: readonly string[];
};

/** Visually verified omissions from the completed 2026-08-31 PDF audit. */
const GROUPS: readonly CorrectionGroup[] = [
  { page: 3, district: "Brønshøj/Husum", streets: ["Bakkeleddet"] },
  { page: 4, district: "Vanløse", streets: ["Birkagervej"] },
  { page: 4, district: "Brønshøj/Husum", streets: ["Bjergmarksvej", "Bjergstedvej"] },
  { page: 5, district: "Bispebjerg", streets: ["Bogfinkevej", "Bogtrykkervej"] },
  { page: 5, district: "Ryvang Øst", streets: ["Borgervænget"] },
  { page: 6, district: "Ydre Nørrebro", streets: ["Bregnerødgade"] },
  { page: 6, district: "Bispebjerg", streets: ["Brofogedvej"] },
  { page: 6, district: "Brønshøj/Husum", streets: ["Broksøvej", "Brovænget", "Brunevang"] },
  { page: 6, district: "Vesterbro", streets: ["Bryggernes Plads"] },
  { page: 7, district: "Brønshøj/Husum", streets: ["Byporten", "Bystævneparken", "Bystævnet", "Byvangen"] },
  { page: 7, district: "Vanløse", streets: ["Børglumvej"] },
  { page: 7, district: "Indre By", streets: ["Børskaj"] },
  { page: 10, district: "Ydre Østerbro", streets: ["Egebæksvej"] },
  { page: 11, district: "Brønshøj/Husum", streets: ["Enigheds Allé", "Eskildstrupvej"] },
  { page: 11, district: "Vanløse", streets: ["Eskjærvej"] },
  { page: 13, district: "Christianshavn", streets: ["Fredens Ark"] },
  { page: 14, district: "Indre Østerbro", streets: ["Fridtjof Nansens Plads"] },
  { page: 18, district: "Ydre Østerbro", streets: ["Havsgårdsvej"] },
  { page: 19, district: "Brønshøj/Husum", streets: ["Hirsevej"] },
  { page: 19, district: "Vanløse", streets: ["Hjertingvej", "Hjortdalsvej"] },
  { page: 19, district: "Ydre Østerbro", streets: ["Hjortøgade"] },
  { page: 19, district: "Indre By", streets: ["Holbergsgade"] },
  { page: 20, district: "Brønshøj/Husum", streets: ["Humlebjerg", "Hustoftevej", "Husum Torv", "Husumvej", "Husum Vænge", "Hvalsøvej", "Hvedevej"] },
  { page: 20, district: "Vanløse", streets: ["Hyltebjerg Allé"] },
  { page: 21, district: "Brønshøj/Husum", streets: ["Håbets Allé"] },
  { page: 26, district: "Brønshøj/Husum", streets: ["Jyderupvej", "Jægersprisvej"] },
  { page: 26, district: "Indre Nørrebro", streets: ["Jægergade"] },
  { page: 28, district: "Indre By", streets: ["Kejsergade"] },
  { page: 28, district: "Brønshøj/Husum", streets: ["Kildeager", "Kildebrøndevej", "Kildeløbet", "Kirketoften"] },
  { page: 29, district: "Brønshøj/Husum", streets: ["Kobbelvænget", "Kongemarksvej", "Kongstedvej", "Korsager Allé", "Krabbesholmvej"] },
  { page: 29, district: "Vanløse", streets: ["Kongsdalvej"] },
  { page: 30, district: "Vesterbro", streets: ["Kychlersgade"] },
  { page: 30, district: "Brønshøj/Husum", streets: ["Kyringevej"] },
  { page: 30, district: "Vanløse", streets: ["Kæragervej"] },
  { page: 30, district: "Indre By", streets: ["Købmagergade"] },
  { page: 31, district: "Indre By", streets: ["Larsens Plads"] },
  { page: 31, district: "Indre Østerbro", streets: ["Lautrupsgade"] },
  { page: 32, district: "Brønshøj/Husum", streets: ["Liselundvej"] },
  { page: 35, district: "Brønshøj/Husum", streets: ["Mosebakken", "Muldager", "Mullerupvej", "Møllebakken"] },
  { page: 35, district: "Bispebjerg", streets: ["Musvågevej"] },
  { page: 37, district: "Indre By", streets: ["Nyropsgade"] },
  { page: 37, district: "Vanløse", streets: ["Nysøvej", "Nøragervej"] },
  { page: 41, district: "Ydre Nørrebro", streets: ["Ragnhildgade"] },
  { page: 41, district: "Indre Nørrebro", streets: ["Ravnsborggade"] },
  { page: 43, district: "Ryvang Øst", streets: ["Rymarksvej"] },
  { page: 43, district: "Brønshøj/Husum", streets: ["Rytterskolehøj"] },
  { page: 47, district: "Brønshøj/Husum", streets: ["Stavnstrupvej", "Stengavl"] },
  { page: 48, district: "Brønshøj/Husum", streets: ["Stubbevangen"] },
  { page: 48, district: "Indre Østerbro", streets: ["Stubkaj", "Sundkaj"] },
  { page: 48, district: "Vanløse", streets: ["Støvringvej"] },
  { page: 51, district: "Brønshøj/Husum", streets: ["Tjærebyvej", "Toftagervej"] },
  { page: 52, district: "Brønshøj/Husum", streets: ["Tunet", "Tuxensvej", "Tværvangen"] },
  { page: 53, district: "Bispebjerg", streets: ["Uglevej"] },
] as const;

export const CONFIRMED_BYEN_CORRECTIONS: readonly ConfirmedByenCorrection[] =
  GROUPS.flatMap(({ page, district, streets }) =>
    streets.map((street) => ({ page, district, street })),
  );

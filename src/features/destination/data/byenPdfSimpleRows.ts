import type { RawStreetRow } from "../types";

/** High-confidence single-district rows audited from every PDF table row. */
export const PDF_SIMPLE_STREET_ROWS: readonly RawStreetRow[] = [
  { street: "A.F. Beyers Vej", bydel: "Vanløse" }, // PDF p. 2
  { street: "A.H. Vedels Plads", bydel: "Christianshavn" }, // PDF p. 2
  { street: "A.L. Drewsens Vej", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Abel Catrines Gade", bydel: "Vesterbro" }, // PDF p. 2
  { street: "Aberdeengade", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Abildgaardsgade", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Abrikosvej", bydel: "Vanløse" }, // PDF p. 2
  { street: "Absalonsgade", bydel: "Vesterbro" }, // PDF p. 2
  { street: "Adelgade", bydel: "Indre By" }, // PDF p. 2
  { street: "Admiralgade", bydel: "Indre By" }, // PDF p. 2
  { street: "Aggersborggade", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Agnes Henningsens Vej", bydel: "Indre Nørrebro" }, // PDF p. 2
  { street: "Ahlefeldtsgade", bydel: "Indre By" }, // PDF p. 2
  { street: "Ahlmannsgade", bydel: "Indre Nørrebro" }, // PDF p. 2
  { street: "Ahornsgade", bydel: "Indre Nørrebro" }, // PDF p. 2
  { street: "Aksel Larsens Plads", bydel: "Ydre Nørrebro" }, // PDF p. 2
  { street: "Aldersrogade", bydel: "Ydre Østerbro" }, // PDF p. 2
  { street: "Alexandravej", bydel: "Bispebjerg" }, // PDF p. 2
  { street: "Alexandriagade", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Allersgade", bydel: "Ydre Nørrebro" }, // PDF p. 2
  { street: "Alléen", bydel: "Indre Nørrebro" }, // PDF p. 2
  { street: "Alsgade", bydel: "Vesterbro" }, // PDF p. 2
  { street: "Amagertorv", bydel: "Indre By" }, // PDF p. 2
  { street: "Amaliegade", bydel: "Indre By" }, // PDF p. 2
  { street: "Amalienborg", bydel: "Indre By" }, // PDF p. 2
  { street: "Amerika Plads", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Amerikakaj", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Amerikavej", bydel: "Vesterbro" }, // PDF p. 2
  { street: "Amicisvej", bydel: "Frederiksberg" }, // PDF p. 2
  { street: "Amorparken", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Andreas Bjørns Gade", bydel: "Christianshavn" }, // PDF p. 2
  { street: "Anker Heegaards Gade", bydel: "Indre By" }, // PDF p. 2
  { street: "Annekegade", bydel: "Ydre Nørrebro" }, // PDF p. 2
  { street: "Antonigade", bydel: "Indre By" }, // PDF p. 2
  { street: "Antwerpengade", bydel: "Indre Østerbro" }, // PDF p. 2
  { street: "Apollovej", bydel: "Vanløse" }, // PDF p. 3
  { street: "Applebys Plads", bydel: "Christianshavn" }, // PDF p. 3
  { street: "Arendalsgade", bydel: "Indre Østerbro" }, // PDF p. 3
  { street: "Arkonagade", bydel: "Vesterbro" }, // PDF p. 3
  { street: "Arnestedet", bydel: "Vanløse" }, // PDF p. 3
  { street: "Arni Magnussons Gade", bydel: "Vesterbro" }, // PDF p. 3
  { street: "Arresøgade", bydel: "Indre Nørrebro" }, // PDF p. 3
  { street: "Arsenalen", bydel: "Christianshavn" }, // PDF p. 3
  { street: "Arsenalvej", bydel: "Christianshavn" }, // PDF p. 3
  { street: "Asiatisk Plads", bydel: "Christianshavn" }, // PDF p. 3
  { street: "Askøgade", bydel: "Ryvang Øst" }, // PDF p. 3
  { street: "Asminderødgade", bydel: "Ydre Nørrebro" }, // PDF p. 3
  { street: "Asnæsgade", bydel: "Indre Nørrebro" }, // PDF p. 3
  { street: "Assensgade", bydel: "Indre Østerbro" }, // PDF p. 3
  { street: "Asylgade", bydel: "Indre By" }, // PDF p. 3
  { street: "August Bournonvilles Passage", bydel: "Indre By" }, // PDF p. 3
  { street: "Australiensvej", bydel: "Ydre Østerbro" }, // PDF p. 3
  { street: "Axeltorv", bydel: "Indre By" }, // PDF p. 3
  { street: "Badstuestræde", bydel: "Indre By" }, // PDF p. 4
  { street: "Bag Elefanterne", bydel: "Vesterbro" }, // PDF p. 4
  { street: "Bag Rådhuset", bydel: "Indre By" }, // PDF p. 4
  { street: "Bagerstræde", bydel: "Vesterbro" }, // PDF p. 4
  { street: "Bakkevej", bydel: "Vanløse" }, // PDF p. 4
  { street: "Balders Plads", bydel: "Ydre Nørrebro" }, // PDF p. 4
  { street: "Baldersgade", bydel: "Ydre Nørrebro" }, // PDF p. 4
  { street: "Ballumgade", bydel: "Vesterbro" }, // PDF p. 4
  { street: "Baltikavej", bydel: "Indre Østerbro" }, // PDF p. 4
  { street: "Banannapark", bydel: "Ydre Nørrebro" }, // PDF p. 4
  { street: "Banebrinken", bydel: "Bispebjerg" }, // PDF p. 4
  { street: "Banegårdspladsen", bydel: "Vesterbro" }, // PDF p. 4
  { street: "Banevingen", bydel: "Ydre Nørrebro" }, // PDF p. 4
  { street: "Banevolden", bydel: "Vesterbro" }, // PDF p. 4
  { street: "Bellisvej", bydel: "Vanløse" }, // PDF p. 4
  { street: "Bertel Thorvaldsens Plads", bydel: "Indre By" }, // PDF p. 5
  { street: "Bevtoftgade", bydel: "Vesterbro" }, // PDF p. 5
  { street: "Bilbaogade", bydel: "Indre Østerbro" }, // PDF p. 5
  { street: "Billedvej", bydel: "Indre Østerbro" }, // PDF p. 5
  { street: "Billesborgvej", bydel: "Vanløse" }, // PDF p. 5
  { street: "Birkedommervej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Birkegade", bydel: "Indre Nørrebro" }, // PDF p. 5
  { street: "Birkholmvej", bydel: "Vanløse" }, // PDF p. 5
  { street: "Bisiddervej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Biskop Krags Vænge", bydel: "Ydre Østerbro" }, // PDF p. 5
  { street: "Bispebjerg Bakke", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bispebjerg Parkallé", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bispebjerg Torv", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bispebjergvej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bispeparken", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bispetorvet", bydel: "Indre By" }, // PDF p. 5
  { street: "Bispevej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bissensgade", bydel: "Vesterbro" }, // PDF p. 5
  { street: "Bjelkes Allé", bydel: "Ydre Nørrebro" }, // PDF p. 5
  { street: "Blytækkervej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Blå Karamel", bydel: "Christianshavn" }, // PDF p. 5
  { street: "Blåmunkevej", bydel: "Bispebjerg" }, // PDF p. 5
  { street: "Bodenhoffs Plads", bydel: "Christianshavn" }, // PDF p. 5
  { street: "Bogholder Allé", bydel: "Vanløse" }, // PDF p. 6
  { street: "Bohlendachvej", bydel: "Christianshavn" }, // PDF p. 6
  { street: "Bohrsgade", bydel: "Vesterbro" }, // PDF p. 6
  { street: "Bolandsvej", bydel: "Ydre Østerbro" }, // PDF p. 6
  { street: "Boldhusgade", bydel: "Indre By" }, // PDF p. 6
  { street: "Bomhusvej", bydel: "Ryvang Øst" }, // PDF p. 6
  { street: "Bomsluttervej", bydel: "Bispebjerg" }, // PDF p. 6
  { street: "Bopa Plads", bydel: "Indre By" }, // PDF p. 6
  { street: "Bordeauxgade", bydel: "Indre Østerbro" }, // PDF p. 6
  { street: "Borgergade", bydel: "Indre By" }, // PDF p. 6
  { street: "Borgmester Jensens Allé", bydel: "Indre Østerbro" }, // PDF p. 6
  { street: "Borgmestervangen", bydel: "Ydre Nørrebro" }, // PDF p. 6
  { street: "Borgskrivervej", bydel: "Bispebjerg" }, // PDF p. 6
  { street: "Bornholmsgade", bydel: "Indre By" }, // PDF p. 6
  { street: "Bredelandsvej", bydel: "Ydre Østerbro" }, // PDF p. 7
  { street: "Bredgade", bydel: "Indre By" }, // PDF p. 7
  { street: "Bremerholm", bydel: "Indre By" }, // PDF p. 7
  { street: "Broagergade", bydel: "Vesterbro" }, // PDF p. 7
  { street: "Brobergsgade", bydel: "Christianshavn" }, // PDF p. 7
  { street: "Brohusgade", bydel: "Indre Nørrebro" }, // PDF p. 7
  { street: "Brolæggerstræde", bydel: "Indre By" }, // PDF p. 7
  { street: "Brombærvej", bydel: "Vanløse" }, // PDF p. 7
  { street: "Brorsonsgade", bydel: "Vesterbro" }, // PDF p. 7
  { street: "Brumleby", bydel: "Indre Østerbro" }, // PDF p. 7
  { street: "Bryggergade", bydel: "Ydre Østerbro" }, // PDF p. 7
  { street: "Bryggervangen", bydel: "Ryvang Øst" }, // PDF p. 7
  { street: "Bryghuspladsen", bydel: "Indre By" }, // PDF p. 7
  { street: "Burmeistersgade", bydel: "Christianshavn" }, // PDF p. 7
  { street: "Bustrupgade", bydel: "Vesterbro" }, // PDF p. 7
  { street: "Bådsmandsstræde", bydel: "Christianshavn" }, // PDF p. 8
  { street: "Bøllegård Allé", bydel: "Bispebjerg" }, // PDF p. 8
  { street: "Bøllemosegårdsvej", bydel: "Ydre Østerbro" }, // PDF p. 8
  { street: "Børsbroen", bydel: "Indre By" }, // PDF p. 8
  { street: "Børsgade", bydel: "Indre By" }, // PDF p. 8
  { street: "Børskovvej", bydel: "Ydre Østerbro" }, // PDF p. 8
  { street: "Calaisgade", bydel: "Indre Østerbro" }, // PDF p. 9
  { street: "Capellakaj", bydel: "Indre Østerbro" }, // PDF p. 9
  { street: "Carl Johans Gade", bydel: "Indre Østerbro" }, // PDF p. 9
  { street: "Carl Nielsens Allé", bydel: "Ydre Østerbro" }, // PDF p. 9
  { street: "Carsten Niebuhrs Gade", bydel: "Vesterbro" }, // PDF p. 9
  { street: "Carstensgade", bydel: "Vesterbro" }, // PDF p. 9
  { street: "Charlotte Muncks Vej", bydel: "Bispebjerg" }, // PDF p. 9
  { street: "Christian IX's Gade", bydel: "Indre By" }, // PDF p. 9
  { street: "Christian IX’s Palæ", bydel: "Indre By" }, // PDF p. 9
  { street: "Christian VII’s Palæ", bydel: "Indre By" }, // PDF p. 9
  { street: "Christiansborg Ridebane", bydel: "Indre By" }, // PDF p. 9
  { street: "Christiansborg Slot", bydel: "Indre By" }, // PDF p. 9
  { street: "Christiansborg Slotsplads", bydel: "Indre By" }, // PDF p. 9
  { street: "Christiansborggade", bydel: "Indre By" }, // PDF p. 9
  { street: "Christiansbro", bydel: "Christianshavn" }, // PDF p. 9
  { street: "Christianshavns Kanal", bydel: "Christianshavn" }, // PDF p. 9
  { street: "Christianshavns Torv", bydel: "Christianshavn" }, // PDF p. 9
  { street: "Christianshavns Voldgade", bydel: "Christianshavn" }, // PDF p. 9
  { street: "Christiansholms Ø", bydel: "Christianshavn" }, // PDF p. 9
  { street: "Dag Hammarskjölds Allé", bydel: "Indre Østerbro" }, // PDF p. 10
  { street: "Dagmarsgade", bydel: "Ydre Nørrebro" }, // PDF p. 10
  { street: "Dahlerupsgade", bydel: "Indre By" }, // PDF p. 10
  { street: "Dalmosevej", bydel: "Bispebjerg" }, // PDF p. 10
  { street: "Damhusdæmningen", bydel: "Vanløse" }, // PDF p. 10
  { street: "Damstien", bydel: "Vanløse" }, // PDF p. 10
  { street: "Danneskiold-Samsøes Allé", bydel: "Christianshavn" }, // PDF p. 10
  { street: "Dannevirkegade", bydel: "Vesterbro" }, // PDF p. 10
  { street: "Danstrupvej", bydel: "Ydre Østerbro" }, // PDF p. 10
  { street: "Dantes Plads", bydel: "Indre By" }, // PDF p. 10
  { street: "David Balfours Gade", bydel: "Christianshavn" }, // PDF p. 10
  { street: "Degnestavnen", bydel: "Bispebjerg" }, // PDF p. 10
  { street: "Delfingade", bydel: "Indre By" }, // PDF p. 10
  { street: "Dokøen", bydel: "Christianshavn" }, // PDF p. 10
  { street: "Dortheavej", bydel: "Bispebjerg" }, // PDF p. 10
  { street: "Dover Passage", bydel: "Indre Østerbro" }, // PDF p. 10
  { street: "Eddagården", bydel: "Ydre Nørrebro" }, // PDF p. 11
  { street: "Edel Sauntes Allé", bydel: "Indre Østerbro" }, // PDF p. 11
  { street: "Edith Rodes Vej", bydel: "Indre Nørrebro" }, // PDF p. 11
  { street: "Edvard Falcks Gade", bydel: "Indre By" }, // PDF p. 11
  { street: "Edvard Griegs Gade", bydel: "Ryvang Øst" }, // PDF p. 11
  { street: "Egelykkevej", bydel: "Vanløse" }, // PDF p. 11
  { street: "Egholmvej", bydel: "Vanløse" }, // PDF p. 11
  { street: "Ehlersvej", bydel: "Ryvang Øst" }, // PDF p. 11
  { street: "Eidsvoll Plads", bydel: "Indre By" }, // PDF p. 11
  { street: "Eik Skaløes Plads", bydel: "Christianshavn" }, // PDF p. 11
  { street: "Ekvipagemestervej", bydel: "Christianshavn" }, // PDF p. 11
  { street: "Elefanten", bydel: "Christianshavn" }, // PDF p. 11
  { street: "Ellebakken", bydel: "Ydre Østerbro" }, // PDF p. 11
  { street: "Elmegade", bydel: "Indre Nørrebro" }, // PDF p. 11
  { street: "Elsdyrgade", bydel: "Indre By" }, // PDF p. 11
  { street: "Elværksvej", bydel: "Vesterbro" }, // PDF p. 11
  { street: "Emdrup Kærvej", bydel: "Bispebjerg" }, // PDF p. 11
  { street: "Emdrup Torv", bydel: "Bispebjerg" }, // PDF p. 11
  { street: "Enghave Plads", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Enveloppevej", bydel: "Christianshavn" }, // PDF p. 12
  { street: "Erik Ejegods Gade", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Eriksgade", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Eriksholmvej", bydel: "Vanløse" }, // PDF p. 12
  { street: "Ernst Meyers Gade", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Esbern Snares Gade", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Eskadrevej", bydel: "Christianshavn" }, // PDF p. 12
  { street: "Eskildsgade", bydel: "Vesterbro" }, // PDF p. 12
  { street: "Esplanaden", bydel: "Indre By" }, // PDF p. 12
  { street: "Esromgade", bydel: "Ydre Nørrebro" }, // PDF p. 12
  { street: "Esthersvej", bydel: "Ryvang Øst" }, // PDF p. 12
  { street: "Estlandsgade", bydel: "Vesterbro" }, // PDF p. 32
  { street: "Fabrikmestervej", bydel: "Christianshavn" }, // PDF p. 13
  { street: "Fabriksområdet", bydel: "Christianshavn" }, // PDF p. 13
  { street: "Fadet", bydel: "Vesterbro" }, // PDF p. 13
  { street: "Fafnersgade", bydel: "Ydre Nørrebro" }, // PDF p. 13
  { street: "Fakse Tværgade", bydel: "Indre Østerbro" }, // PDF p. 13
  { street: "Faksegade", bydel: "Indre Østerbro" }, // PDF p. 13
  { street: "Falkevej", bydel: "Bispebjerg" }, // PDF p. 13
  { street: "Farumgade", bydel: "Ydre Nørrebro" }, // PDF p. 13
  { street: "Farvergade", bydel: "Indre By" }, // PDF p. 13
  { street: "Fenrisgade", bydel: "Ydre Nørrebro" }, // PDF p. 13
  { street: "Fensmarkgade", bydel: "Indre Nørrebro" }, // PDF p. 13
  { street: "Ferringvej", bydel: "Vanløse" }, // PDF p. 13
  { street: "Ferskenvej", bydel: "Vanløse" }, // PDF p. 13
  { street: "Fogedgården", bydel: "Ydre Nørrebro" }, // PDF p. 14
  { street: "Fogedmarken", bydel: "Ydre Nørrebro" }, // PDF p. 14
  { street: "Folevadsvej", bydel: "Bispebjerg" }, // PDF p. 14
  { street: "Folmer Bendtsens Plads", bydel: "Ydre Nørrebro" }, // PDF p. 14
  { street: "Forbindelsesvej", bydel: "Indre Østerbro" }, // PDF p. 14
  { street: "Fordresgårdvej", bydel: "Vanløse" }, // PDF p. 14
  { street: "Fortkaj", bydel: "Indre Østerbro" }, // PDF p. 14
  { street: "Fortunstræde", bydel: "Indre By" }, // PDF p. 14
  { street: "Fossgårdsvej", bydel: "Vanløse" }, // PDF p. 14
  { street: "Fragtvej", bydel: "Kgs. Enghave" }, // PDF p. 14
  { street: "Fredensborggade", bydel: "Ydre Nørrebro" }, // PDF p. 14
  { street: "Fredensgade", bydel: "Indre Nørrebro" }, // PDF p. 14
  { street: "Frederik Bajers Plads", bydel: "Ydre Nørrebro" }, // PDF p. 14
  { street: "Frederik V's Vej", bydel: "Indre Østerbro" }, // PDF p. 14
  { street: "Frederik VII's Gade", bydel: "Indre Nørrebro" }, // PDF p. 14
  { street: "Frederik VIII’s Palæ", bydel: "Indre By" }, // PDF p. 14
  { street: "Frederiksberggade", bydel: "Indre By" }, // PDF p. 14
  { street: "Frederiksborgvej", bydel: "Bispebjerg" }, // PDF p. 14
  { street: "Frederiksgade", bydel: "Indre By" }, // PDF p. 14
  { street: "Frederiksholms Kanal", bydel: "Indre By" }, // PDF p. 14
  { street: "Frederiksstadsgade", bydel: "Vesterbro" }, // PDF p. 14
  { street: "Freundsgade", bydel: "Vesterbro" }, // PDF p. 15
  { street: "Frihavnen", bydel: "Indre Østerbro" }, // PDF p. 15
  { street: "Frimestervej", bydel: "Bispebjerg" }, // PDF p. 15
  { street: "Frode Jakobsens Plads", bydel: "Vanløse" }, // PDF p. 15
  { street: "Frue Plads", bydel: "Indre By" }, // PDF p. 15
  { street: "Fruebjergvej", bydel: "Ydre Østerbro" }, // PDF p. 15
  { street: "Fuglagervej", bydel: "Vanløse" }, // PDF p. 15
  { street: "Fuglefængervej", bydel: "Bispebjerg" }, // PDF p. 15
  { street: "Fyensgade", bydel: "Indre Nørrebro" }, // PDF p. 15
  { street: "Fyrbødervej", bydel: "Bispebjerg" }, // PDF p. 15
  { street: "Fælledvej", bydel: "Indre Nørrebro" }, // PDF p. 15
  { street: "Fælledvejens Passage", bydel: "Indre Nørrebro" }, // PDF p. 15
  { street: "Færgehavns Brygge", bydel: "Indre Østerbro" }, // PDF p. 15
  { street: "Færgehavnsvej", bydel: "Indre Østerbro" }, // PDF p. 15
  { street: "Galionsvej", bydel: "Christianshavn" }, // PDF p. 16
  { street: "Gamle Carlsberg Vej", bydel: "Vesterbro" }, // PDF p. 16
  { street: "Gammel Kalkbrænderi Vej", bydel: "Indre Østerbro" }, // PDF p. 16
  { street: "Gammel Mønt", bydel: "Indre By" }, // PDF p. 16
  { street: "Gammel Strand", bydel: "Indre By" }, // PDF p. 16
  { street: "Gammel Vartov Vej", bydel: "Ryvang Øst" }, // PDF p. 16
  { street: "Gammeltoftsgade", bydel: "Indre By" }, // PDF p. 16
  { street: "Gammeltorv", bydel: "Indre By" }, // PDF p. 16
  { street: "Gammelvagt", bydel: "Indre By" }, // PDF p. 16
  { street: "Gartnergade", bydel: "Indre Nørrebro" }, // PDF p. 16
  { street: "Gartnerivej", bydel: "Ryvang Øst" }, // PDF p. 16
  { street: "Gasværksvej", bydel: "Vesterbro" }, // PDF p. 16
  { street: "Gravervænget", bydel: "Bispebjerg" }, // PDF p. 17
  { street: "Grenågade", bydel: "Indre Østerbro" }, // PDF p. 17
  { street: "Griffenfeldsgade", bydel: "Indre Nørrebro" }, // PDF p. 17
  { street: "Gråbrødrestræde", bydel: "Indre By" }, // PDF p. 17
  { street: "Gråbrødretorv", bydel: "Indre By" }, // PDF p. 17
  { street: "Gråspurvevej", bydel: "Bispebjerg" }, // PDF p. 17
  { street: "Grønbakken", bydel: "Vanløse" }, // PDF p. 17
  { street: "Grøndal Torv", bydel: "Vanløse" }, // PDF p. 17
  { street: "Grøndals Parkvej", bydel: "Vanløse" }, // PDF p. 17
  { street: "Grøndalsvænge Allé", bydel: "Vanløse" }, // PDF p. 17
  { street: "Grønnegade", bydel: "Indre By" }, // PDF p. 17
  { street: "Grønnehøj", bydel: "Vanløse" }, // PDF p. 17
  { street: "Grønningen", bydel: "Indre By" }, // PDF p. 17
  { street: "Grønvangen", bydel: "Vanløse" }, // PDF p. 17
  { street: "H.C. Andersens Boulevard", bydel: "Indre By" }, // PDF p. 19
  { street: "H.C. Lumbyes Gade", bydel: "Ryvang Øst" }, // PDF p. 19
  { street: "H.C. Sneedorffs Allé", bydel: "Christianshavn" }, // PDF p. 19
  { street: "H.V. Rolsteds Vej", bydel: "Kgs. Enghave" }, // PDF p. 21
  { street: "Haderslevgade", bydel: "Vesterbro" }, // PDF p. 18
  { street: "Haifagade", bydel: "Indre Østerbro" }, // PDF p. 18
  { street: "Hallingsgade", bydel: "Indre Østerbro" }, // PDF p. 18
  { street: "Halmtorvet", bydel: "Vesterbro" }, // PDF p. 18
  { street: "Halsskovgade", bydel: "Indre Østerbro" }, // PDF p. 18
  { street: "Halvtolv", bydel: "Christianshavn" }, // PDF p. 18
  { street: "Hamborg Plads", bydel: "Indre Østerbro" }, // PDF p. 18
  { street: "Hambrosgade", bydel: "Indre By" }, // PDF p. 18
  { street: "Hamletsgade", bydel: "Ydre Nørrebro" }, // PDF p. 18
  { street: "Hammerensgade", bydel: "Indre By" }, // PDF p. 18
  { street: "Hammerichsgade", bydel: "Indre By" }, // PDF p. 18
  { street: "Hammershusgade", bydel: "Ydre Østerbro" }, // PDF p. 18
  { street: "Hammershøis Kaj", bydel: "Christianshavn" }, // PDF p. 18
  { street: "Hanebred", bydel: "Vanløse" }, // PDF p. 18
  { street: "Hans Egedes Gade", bydel: "Indre Nørrebro" }, // PDF p. 18
  { street: "Hans Kirks Vej", bydel: "Indre Nørrebro" }, // PDF p. 18
  { street: "Hans Knudsens Plads", bydel: "Ryvang Øst" }, // PDF p. 18
  { street: "Hans Tavsens Gade", bydel: "Indre Nørrebro" }, // PDF p. 18
  { street: "Hanstholmvej", bydel: "Vanløse" }, // PDF p. 18
  { street: "Hedebygade", bydel: "Vesterbro" }, // PDF p. 19
  { street: "Hedemannsgade", bydel: "Indre Østerbro" }, // PDF p. 19
  { street: "Hegnshusene", bydel: "Vanløse" }, // PDF p. 19
  { street: "Heibergsgade", bydel: "Indre By" }, // PDF p. 19
  { street: "Heilsgade", bydel: "Vesterbro" }, // PDF p. 19
  { street: "Heimdalsgade", bydel: "Ydre Nørrebro" }, // PDF p. 19
  { street: "Heinesgade", bydel: "Ydre Nørrebro" }, // PDF p. 19
  { street: "Heisesgade", bydel: "Ryvang Øst" }, // PDF p. 19
  { street: "Helga Larsens Plads", bydel: "Vanløse" }, // PDF p. 19
  { street: "Helgesensgade", bydel: "Indre Østerbro" }, // PDF p. 19
  { street: "Helgolandsgade", bydel: "Vesterbro" }, // PDF p. 19
  { street: "Hellebækgade", bydel: "Ydre Nørrebro" }, // PDF p. 19
  { street: "Helsinkigade", bydel: "Indre Østerbro" }, // PDF p. 19
  { street: "Henrik Gerners Plads", bydel: "Christianshavn" }, // PDF p. 19
  { street: "Henrik Harpestrengs Vej", bydel: "Indre Østerbro" }, // PDF p. 19
  { street: "Hf. Amager Strand", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Bergmannshave", bydel: "Valby" }, // PDF p. 23
  { street: "Hf. Bispevænget", bydel: "Bispebjerg" }, // PDF p. 23
  { street: "Hf. Blomsten", bydel: "Ydre Østerbro" }, // PDF p. 23
  { street: "Hf. Bredegrund", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Brohaven", bydel: "Valby" }, // PDF p. 23
  { street: "Hf. Bryggen", bydel: "Vestamager" }, // PDF p. 23
  { street: "Hf. Dan", bydel: "Valby" }, // PDF p. 23
  { street: "Hf. Danshøj", bydel: "Valby" }, // PDF p. 23
  { street: "Hf. Elmebo", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Elmelv", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Energien", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Engdal", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Engdraget", bydel: "Amager" }, // PDF p. 23
  { street: "Hf. Mellemvej", bydel: "Kgs. Enghave" }, // PDF p. 24
  { street: "Hf. Rosen", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Røde Mellemvej", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Solskrænten", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sommerly", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Stien", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Stjernelund", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Strandbo", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Strandhøj", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Strandlyst", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sundbo", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sundbyvester", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sundvænget", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sydgrænsen", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Sønderbro", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Søndervang", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Trekanten", bydel: "Valby" }, // PDF p. 24
  { street: "Hf. Vennelyst", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Venners Lyst", bydel: "Ydre Østerbro" }, // PDF p. 24
  { street: "Hf. Vestereng", bydel: "Amager" }, // PDF p. 24
  { street: "Hf. Vestgrænsen", bydel: "Amager" }, // PDF p. 24
  { street: "Himmerlandsvej", bydel: "Vanløse" }, // PDF p. 20
  { street: "Hindbærvej", bydel: "Vanløse" }, // PDF p. 20
  { street: "Hindegade", bydel: "Indre By" }, // PDF p. 20
  { street: "Hiort Lorenzens Gade", bydel: "Indre Nørrebro" }, // PDF p. 20
  { street: "Hirtshalsvej", bydel: "Vanløse" }, // PDF p. 20
  { street: "Hjalmar Brantings Plads", bydel: "Indre Østerbro" }, // PDF p. 20
  { street: "Hjelmsgade", bydel: "Ydre Østerbro" }, // PDF p. 20
  { street: "Hjortholms Allé", bydel: "Bispebjerg" }, // PDF p. 20
  { street: "Hjørringgade", bydel: "Indre Østerbro" }, // PDF p. 20
  { street: "Hobrogade", bydel: "Indre Østerbro" }, // PDF p. 20
  { street: "Holbækgade", bydel: "Indre Østerbro" }, // PDF p. 20
  { street: "Humlebækgade", bydel: "Ydre Nørrebro" }, // PDF p. 21
  { street: "Husumgade", bydel: "Ydre Nørrebro" }, // PDF p. 21
  { street: "Hvidkildevej", bydel: "Vanløse" }, // PDF p. 21
  { street: "Hvidkløvervej", bydel: "Bispebjerg" }, // PDF p. 21
  { street: "Hvidtjørnevej", bydel: "Vanløse" }, // PDF p. 21
  { street: "Hyldebærvej", bydel: "Vanløse" }, // PDF p. 21
  { street: "Hyltebro", bydel: "Ydre Nørrebro" }, // PDF p. 21
  { street: "Håndværkerhaven", bydel: "Bispebjerg" }, // PDF p. 22
  { street: "Indertoften", bydel: "Vanløse" }, // PDF p. 25
  { street: "Indiakaj", bydel: "Indre Østerbro" }, // PDF p. 25
  { street: "Indiavej", bydel: "Indre Østerbro" }, // PDF p. 25
  { street: "Industrivej", bydel: "Indre Østerbro" }, // PDF p. 25
  { street: "Ingerslevsgade", bydel: "Vesterbro" }, // PDF p. 25
  { street: "Islands Plads", bydel: "Christianshavn" }, // PDF p. 25
  { street: "Israels Plads", bydel: "Indre By" }, // PDF p. 25
  { street: "Istanbulgade", bydel: "Indre Østerbro" }, // PDF p. 25
  { street: "Istedgade", bydel: "Vesterbro" }, // PDF p. 25
  { street: "J.A. Schwartz Gade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "J.E. Ohlsens Gade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Jacob Erlandsens Gade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Jacob Lindbergs Vej", bydel: "Bispebjerg" }, // PDF p. 26
  { street: "Jarmers Plads", bydel: "Indre By" }, // PDF p. 26
  { street: "Jellingegade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Jens Juels Gade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Jens Kofods Gade", bydel: "Indre By" }, // PDF p. 26
  { street: "Jens Munks Gade", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Jensen Klints Plads", bydel: "Bispebjerg" }, // PDF p. 26
  { street: "Jeppes Allé", bydel: "Bispebjerg" }, // PDF p. 26
  { street: "Jerichausgade", bydel: "Vesterbro" }, // PDF p. 26
  { street: "Jesper Brochmands Gade", bydel: "Indre Nørrebro" }, // PDF p. 26
  { street: "Johan Svendsens Vej", bydel: "Ydre Østerbro" }, // PDF p. 26
  { street: "Johanne Møllers Passage", bydel: "Vesterbro" }, // PDF p. 26
  { street: "Jorcks Passage", bydel: "Indre By" }, // PDF p. 26
  { street: "Judithsvej", bydel: "Ryvang Øst" }, // PDF p. 26
  { street: "Juliane Maries Vej", bydel: "Indre Østerbro" }, // PDF p. 26
  { street: "Julie Arenholts Vænge", bydel: "Vanløse" }, // PDF p. 26
  { street: "Julius Bloms Gade", bydel: "Ydre Nørrebro" }, // PDF p. 26
  { street: "Kaalundsgade", bydel: "Vesterbro" }, // PDF p. 28
  { street: "Kalkbrænderiløbskaj", bydel: "Indre Østerbro" }, // PDF p. 28
  { street: "Kedelpladsen", bydel: "Vesterbro" }, // PDF p. 29
  { street: "Keldsøvej", bydel: "Ydre Østerbro" }, // PDF p. 29
  { street: "Kertemindegade", bydel: "Indre Østerbro" }, // PDF p. 29
  { street: "Kielgade", bydel: "Indre Østerbro" }, // PDF p. 29
  { street: "Kildepladsen", bydel: "Vesterbro" }, // PDF p. 29
  { street: "Kildevældsgade", bydel: "Ryvang Øst" }, // PDF p. 29
  { street: "Kildevænget", bydel: "Ryvang Øst" }, // PDF p. 29
  { street: "Kilholmvej", bydel: "Vanløse" }, // PDF p. 29
  { street: "Kirkebjerg Allé", bydel: "Vanløse" }, // PDF p. 29
  { street: "Kirsteinsgade", bydel: "Indre Østerbro" }, // PDF p. 29
  { street: "Kjeld Langes Gade", bydel: "Indre By" }, // PDF p. 29
  { street: "Kleinsgade", bydel: "Indre Nørrebro" }, // PDF p. 29
  { street: "Klosterrisvej", bydel: "Ydre Østerbro" }, // PDF p. 29
  { street: "Koldinggade", bydel: "Indre Østerbro" }, // PDF p. 30
  { street: "Kompagnistræde", bydel: "Indre By" }, // PDF p. 30
  { street: "Kong Oscars Gade", bydel: "Ryvang Øst" }, // PDF p. 30
  { street: "Kongebrovej", bydel: "Christianshavn" }, // PDF p. 30
  { street: "Kongshøjgade", bydel: "Vesterbro" }, // PDF p. 30
  { street: "Korsgade", bydel: "Indre Nørrebro" }, // PDF p. 30
  { street: "Korsørgade", bydel: "Indre Østerbro" }, // PDF p. 30
  { street: "Kortløb", bydel: "Vesterbro" }, // PDF p. 30
  { street: "Krakas Plads", bydel: "Ydre Østerbro" }, // PDF p. 30
  { street: "Krausesvej", bydel: "Indre Østerbro" }, // PDF p. 30
  { street: "Kristen Bernikows Gade", bydel: "Indre By" }, // PDF p. 30
  { street: "Kristianiagade", bydel: "Indre Østerbro" }, // PDF p. 30
  { street: "Kristineberg", bydel: "Ryvang Øst" }, // PDF p. 30
  { street: "Krokodillegade", bydel: "Indre By" }, // PDF p. 30
  { street: "Krügersgade", bydel: "Indre Nørrebro" }, // PDF p. 30
  { street: "Kæmnervej", bydel: "Bispebjerg" }, // PDF p. 31
  { street: "Kærholmen", bydel: "Vanløse" }, // PDF p. 31
  { street: "Kærsangervej", bydel: "Bispebjerg" }, // PDF p. 31
  { street: "Kødboderne", bydel: "Vesterbro" }, // PDF p. 31
  { street: "Landemærket", bydel: "Indre By" }, // PDF p. 32
  { street: "Landgreven", bydel: "Indre By" }, // PDF p. 32
  { street: "Landsdommervej", bydel: "Bispebjerg" }, // PDF p. 32
  { street: "Landskronagade", bydel: "Ryvang Øst" }, // PDF p. 32
  { street: "Landvindingsgade", bydel: "Vesterbro" }, // PDF p. 32
  { street: "Lange-Müllers Gade", bydel: "Ryvang Øst" }, // PDF p. 32
  { street: "Langelinie", bydel: "Indre By" }, // PDF p. 32
  { street: "Langelinie Allé", bydel: "Indre Østerbro" }, // PDF p. 32
  { street: "Langeliniebro", bydel: "Indre Østerbro" }, // PDF p. 32
  { street: "Langelinievej", bydel: "Indre Østerbro" }, // PDF p. 32
  { street: "Langesund", bydel: "Ydre Østerbro" }, // PDF p. 32
  { street: "Langkærsti", bydel: "Vanløse" }, // PDF p. 32
  { street: "Langvaddam", bydel: "Vanløse" }, // PDF p. 32
  { street: "Larsbjørnsstræde", bydel: "Indre By" }, // PDF p. 32
  { street: "Lille Strandstræde", bydel: "Indre By" }, // PDF p. 33
  { street: "Lille Søndervoldstræde", bydel: "Christianshavn" }, // PDF p. 33
  { street: "Lille Theklavej", bydel: "Bispebjerg" }, // PDF p. 33
  { street: "Lilly Helveg Petersens Plads", bydel: "Indre Østerbro" }, // PDF p. 33
  { street: "Limgården", bydel: "Sundby Nord" }, // PDF p. 33
  { street: "Linde Allé", bydel: "Vanløse" }, // PDF p. 33
  { street: "Lindehøjen", bydel: "Vanløse" }, // PDF p. 33
  { street: "Lindenborgvej", bydel: "Vanløse" }, // PDF p. 33
  { street: "Lindenovsgade", bydel: "Indre Østerbro" }, // PDF p. 33
  { street: "Linnésgade", bydel: "Indre By" }, // PDF p. 33
  { street: "Litauens Plads", bydel: "Vesterbro" }, // PDF p. 33
  { street: "Liva Weels Plads", bydel: "Vesterbro" }, // PDF p. 33
  { street: "Livøgade", bydel: "Ryvang Øst" }, // PDF p. 33
  { street: "Luftmarinegade", bydel: "Christianshavn" }, // PDF p. 33
  { street: "Læderstræde", bydel: "Indre By" }, // PDF p. 34
  { street: "Lærkevej", bydel: "Bispebjerg" }, // PDF p. 34
  { street: "Læssøesgade", bydel: "Indre Nørrebro" }, // PDF p. 34
  { street: "Løfasvej", bydel: "Indre Østerbro" }, // PDF p. 34
  { street: "Løkkestien", bydel: "Vanløse" }, // PDF p. 29
  { street: "Lønporten", bydel: "Indre By" }, // PDF p. 34
  { street: "Lønstrupvej", bydel: "Vanløse" }, // PDF p. 34
  { street: "Løvehuset", bydel: "Christianshavn" }, // PDF p. 34
  { street: "Løvholmen", bydel: "Vanløse" }, // PDF p. 34
  { street: "Løvstræde", bydel: "Indre By" }, // PDF p. 34
  { street: "Magistervej", bydel: "Bispebjerg" }, // PDF p. 35
  { street: "Magstræde", bydel: "Indre By" }, // PDF p. 35
  { street: "Major Anders Lassens Vej", bydel: "Ryvang Øst" }, // PDF p. 35
  { street: "Malmøgade", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Malttorvet", bydel: "Vesterbro" }, // PDF p. 35
  { street: "Mandalsgade", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Mandelvej", bydel: "Vanløse" }, // PDF p. 35
  { street: "Manøgade", bydel: "Ydre Østerbro" }, // PDF p. 35
  { street: "Margretheholmsvej", bydel: "Christianshavn" }, // PDF p. 35
  { street: "Maria Kirkeplads", bydel: "Vesterbro" }, // PDF p. 35
  { street: "Marie Christensens Plads", bydel: "Vanløse" }, // PDF p. 35
  { street: "Mariehamngade", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Markvej", bydel: "Vanløse" }, // PDF p. 35
  { street: "Marmorvej", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Marskellet", bydel: "Vanløse" }, // PDF p. 35
  { street: "Marskensgade", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Marstalsgade", bydel: "Indre Østerbro" }, // PDF p. 35
  { street: "Marthagade", bydel: "Ryvang Øst" }, // PDF p. 35
  { street: "Masnedøgade", bydel: "Ydre Østerbro" }, // PDF p. 35
  { street: "Mastekursvej", bydel: "Christianshavn" }, // PDF p. 35
  { street: "Minørvej", bydel: "Christianshavn" }, // PDF p. 36
  { street: "Mirabellevej", bydel: "Vanløse" }, // PDF p. 36
  { street: "Mitchellsgade", bydel: "Indre By" }, // PDF p. 36
  { street: "Mjølnerparken", bydel: "Ydre Nørrebro" }, // PDF p. 36
  { street: "Montagnevej", bydel: "Vanløse" }, // PDF p. 36
  { street: "Morbærvej", bydel: "Vanløse" }, // PDF p. 36
  { street: "Morsøvej", bydel: "Vanløse" }, // PDF p. 36
  { street: "Moseskellet", bydel: "Bispebjerg" }, // PDF p. 36
  { street: "Murergade", bydel: "Indre Nørrebro" }, // PDF p. 36
  { street: "Murmanskgade", bydel: "Indre Østerbro" }, // PDF p. 36
  { street: "Musholmgade", bydel: "Ydre Østerbro" }, // PDF p. 36
  { street: "Mysundegade", bydel: "Vesterbro" }, // PDF p. 36
  { street: "Mælkebøtten", bydel: "Christianshavn" }, // PDF p. 36
  { street: "Mælkevejen", bydel: "Christianshavn" }, // PDF p. 36
  { street: "Møgeltøndergade", bydel: "Vesterbro" }, // PDF p. 36
  { street: "Møllegade", bydel: "Indre Nørrebro" }, // PDF p. 36
  { street: "Naboløs", bydel: "Indre By" }, // PDF p. 37
  { street: "Nannasgade", bydel: "Ydre Nørrebro" }, // PDF p. 37
  { street: "Nansensgade", bydel: "Indre By" }, // PDF p. 37
  { street: "Nedertoften", bydel: "Vanløse" }, // PDF p. 37
  { street: "Nicolai Eigtveds Gade", bydel: "Christianshavn" }, // PDF p. 37
  { street: "Niels Brocks Gade", bydel: "Indre By" }, // PDF p. 37
  { street: "Niels Hemmingsens Gade", bydel: "Indre By" }, // PDF p. 37
  { street: "Niels Juels Gade", bydel: "Indre By" }, // PDF p. 37
  { street: "Niels W. Gades Gade", bydel: "Ryvang Øst" }, // PDF p. 37
  { street: "Nikolaj Plads", bydel: "Indre By" }, // PDF p. 37
  { street: "Nina Bangs Plads", bydel: "Indre By" }, // PDF p. 37
  { street: "Nivågade", bydel: "Ydre Nørrebro" }, // PDF p. 37
  { street: "Nordbanegade", bydel: "Ydre Nørrebro" }, // PDF p. 37
  { street: "Nordborggade", bydel: "Indre Østerbro" }, // PDF p. 37
  { street: "Norddyssen", bydel: "Christianshavn" }, // PDF p. 37
  { street: "Nordhavns Plads", bydel: "Indre Østerbro" }, // PDF p. 37
  { street: "Nordhavnsvej", bydel: "Indre Østerbro" }, // PDF p. 37
  { street: "Nybrogade", bydel: "Indre By" }, // PDF p. 38
  { street: "Nygade", bydel: "Indre By" }, // PDF p. 38
  { street: "Nygårdsvej", bydel: "Ryvang Øst" }, // PDF p. 38
  { street: "Nyhavn", bydel: "Indre By" }, // PDF p. 38
  { street: "Nymindevej", bydel: "Vanløse" }, // PDF p. 38
  { street: "Nytorv", bydel: "Indre By" }, // PDF p. 38
  { street: "Nærumgade", bydel: "Ydre Nørrebro" }, // PDF p. 38
  { street: "Næstvedgade", bydel: "Indre Østerbro" }, // PDF p. 38
  { street: "Nøddebogade", bydel: "Indre Nørrebro" }, // PDF p. 38
  { street: "Nøjsomhedsvej", bydel: "Indre Østerbro" }, // PDF p. 38
  { street: "Nøkkerosevej", bydel: "Bispebjerg" }, // PDF p. 38
  { street: "Nørager Plads", bydel: "Vanløse" }, // PDF p. 38
  { street: "Oceankaj", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Oceanvej", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Odensegade", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Odins Tværgade", bydel: "Ydre Nørrebro" }, // PDF p. 39
  { street: "Odinsgade", bydel: "Ydre Nørrebro" }, // PDF p. 39
  { street: "Oehlenschlægersgade", bydel: "Vesterbro" }, // PDF p. 39
  { street: "Ofelia Plads", bydel: "Indre By" }, // PDF p. 39
  { street: "Oldermandsvej", bydel: "Bispebjerg" }, // PDF p. 39
  { street: "Oldfuxvej", bydel: "Bispebjerg" }, // PDF p. 39
  { street: "Ole Jørgensens Gade", bydel: "Ydre Nørrebro" }, // PDF p. 39
  { street: "Ole Maaløes Vej", bydel: "Indre Nørrebro" }, // PDF p. 39
  { street: "Ole Suhrs Gade", bydel: "Indre By" }, // PDF p. 39
  { street: "Olfert Fischers Gade", bydel: "Indre By" }, // PDF p. 39
  { street: "Oliemøllegade", bydel: "Ydre Østerbro" }, // PDF p. 39
  { street: "Olivia Hansens Gade", bydel: "Vesterbro" }, // PDF p. 39
  { street: "Olof Palmes Gade", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Olufsvej", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Omøgade", bydel: "Ryvang Øst" }, // PDF p. 39
  { street: "Onkel Dannys Plads", bydel: "Vesterbro" }, // PDF p. 39
  { street: "Orient Plads", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "Orientkaj", bydel: "Indre Østerbro" }, // PDF p. 39
  { street: "P.D. Løvs Allé", bydel: "Ydre Nørrebro" }, // PDF p. 40
  { street: "Pakhuskaj", bydel: "Indre Østerbro" }, // PDF p. 40
  { street: "Pakhusvej", bydel: "Indre Østerbro" }, // PDF p. 40
  { street: "Palnatokesgade", bydel: "Vesterbro" }, // PDF p. 40
  { street: "Palægade", bydel: "Indre By" }, // PDF p. 40
  { street: "Papirøen", bydel: "Christianshavn" }, // PDF p. 40
  { street: "Pasteursvej", bydel: "Vesterbro" }, // PDF p. 40
  { street: "Paulas Passage", bydel: "Vesterbro" }, // PDF p. 40
  { street: "Peblinge Dossering", bydel: "Indre Nørrebro" }, // PDF p. 40
  { street: "Peder Hvitfeldts Stræde", bydel: "Indre By" }, // PDF p. 40
  { street: "Peder Skrams Gade", bydel: "Indre By" }, // PDF p. 40
  { street: "Per Henrik Lings Allé", bydel: "Indre Østerbro" }, // PDF p. 40
  { street: "Per Knutzons Vej", bydel: "Christianshavn" }, // PDF p. 40
  { street: "Perlestikkervej", bydel: "Bispebjerg" }, // PDF p. 40
  { street: "Pernillevej", bydel: "Bispebjerg" }, // PDF p. 40
  { street: "Prinsessegade", bydel: "Christianshavn" }, // PDF p. 41
  { street: "Proviantpassagen", bydel: "Indre By" }, // PDF p. 41
  { street: "Provstevej", bydel: "Bispebjerg" }, // PDF p. 41
  { street: "Præstelængen", bydel: "Bispebjerg" }, // PDF p. 41
  { street: "Præstøgade", bydel: "Indre Østerbro" }, // PDF p. 41
  { street: "Psyak", bydel: "Christianshavn" }, // PDF p. 41
  { street: "Pustervig", bydel: "Indre By" }, // PDF p. 41
  { street: "På Bjerget", bydel: "Bispebjerg" }, // PDF p. 41
  { street: "Quintus", bydel: "Christianshavn" }, // PDF p. 41
  { street: "Rabarbervej", bydel: "Vanløse" }, // PDF p. 42
  { street: "Ragnagade", bydel: "Ydre Østerbro" }, // PDF p. 42
  { street: "Ramløsevej", bydel: "Ydre Østerbro" }, // PDF p. 42
  { street: "Randbølvej", bydel: "Vanløse" }, // PDF p. 42
  { street: "Rantzausgade", bydel: "Indre Nørrebro" }, // PDF p. 42
  { street: "Raunstrupvej", bydel: "Vanløse" }, // PDF p. 42
  { street: "Ravneholmsvej", bydel: "Bispebjerg" }, // PDF p. 42
  { street: "Ravnsborg Tværgade", bydel: "Indre Nørrebro" }, // PDF p. 42
  { street: "Rebildvej", bydel: "Vanløse" }, // PDF p. 42
  { street: "Reverdilsgade", bydel: "Vesterbro" }, // PDF p. 42
  { street: "Ribegade", bydel: "Indre Østerbro" }, // PDF p. 42
  { street: "Ringduestien", bydel: "Bispebjerg" }, // PDF p. 43
  { street: "Ringertoften", bydel: "Bispebjerg" }, // PDF p. 43
  { street: "Ringkøbinggade", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Risbyholmvej", bydel: "Vanløse" }, // PDF p. 43
  { street: "Rismosevej", bydel: "Bispebjerg" }, // PDF p. 43
  { street: "Romsøgade", bydel: "Ydre Østerbro" }, // PDF p. 43
  { street: "Rosbæksvej", bydel: "Ryvang Øst" }, // PDF p. 43
  { street: "Rosendalsgade", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Rosengade", bydel: "Indre By" }, // PDF p. 43
  { street: "Rosengården", bydel: "Indre By" }, // PDF p. 43
  { street: "Rosenlunds Allé", bydel: "Vanløse" }, // PDF p. 43
  { street: "Rosenstykket", bydel: "Vanløse" }, // PDF p. 43
  { street: "Rosenvængets Allé", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Rosenvængets Hovedvej", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Rosenvængets Sideallé", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Rosenørns Allé", bydel: "Indre Nørrebro" }, // PDF p. 43
  { street: "Rothesgade", bydel: "Indre Østerbro" }, // PDF p. 43
  { street: "Rovsingsgade", bydel: "Ydre Nørrebro" }, // PDF p. 43
  { street: "Rudolph Berghs Gade", bydel: "Ydre Østerbro" }, // PDF p. 43
  { street: "Rundholmen", bydel: "Vanløse" }, // PDF p. 43
  { street: "Ryparken", bydel: "Ryvang Øst" }, // PDF p. 44
  { street: "Rysensteensgade", bydel: "Indre By" }, // PDF p. 44
  { street: "Rytterbakken", bydel: "Bispebjerg" }, // PDF p. 44
  { street: "Rådhusstræde", bydel: "Indre By" }, // PDF p. 44
  { street: "Rådvadsvej", bydel: "Bispebjerg" }, // PDF p. 44
  { street: "Rævegade", bydel: "Indre By" }, // PDF p. 44
  { street: "Rødkildevej", bydel: "Vanløse" }, // PDF p. 44
  { street: "Rødkløvervej", bydel: "Bispebjerg" }, // PDF p. 44
  { street: "Rødkælkebo", bydel: "Bispebjerg" }, // PDF p. 44
  { street: "Rømersgade", bydel: "Indre By" }, // PDF p. 44
  { street: "Rørholmsgade", bydel: "Indre By" }, // PDF p. 44
  { street: "Saabyesvej", bydel: "Indre Østerbro" }, // PDF p. 45
  { street: "Sadelmagervej", bydel: "Bispebjerg" }, // PDF p. 45
  { street: "Saltøvej", bydel: "Vanløse" }, // PDF p. 45
  { street: "Samsøgade", bydel: "Ydre Østerbro" }, // PDF p. 45
  { street: "Sandbjerggade", bydel: "Ydre Nørrebro" }, // PDF p. 45
  { street: "Sandhøjen", bydel: "Vanløse" }, // PDF p. 45
  { street: "Sandkaj", bydel: "Indre Østerbro" }, // PDF p. 45
  { street: "Sankelmarksgade", bydel: "Vesterbro" }, // PDF p. 45
  { street: "Sankt Hans Gade", bydel: "Indre Nørrebro" }, // PDF p. 46
  { street: "Sankt Hans Torv", bydel: "Indre Nørrebro" }, // PDF p. 46
  { street: "Sankt Petersborg Plads", bydel: "Indre Østerbro" }, // PDF p. 45
  { street: "Sankt Petri Passage", bydel: "Indre By" }, // PDF p. 45
  { street: "Sassnitzgade", bydel: "Indre Østerbro" }, // PDF p. 45
  { street: "Saxogade", bydel: "Vesterbro" }, // PDF p. 45
  { street: "Schacksgade", bydel: "Indre By" }, // PDF p. 45
  { street: "Schifters Kvarter", bydel: "Christianshavn" }, // PDF p. 45
  { street: "Schleppegrellsgade", bydel: "Indre Nørrebro" }, // PDF p. 45
  { street: "Sejrøgade", bydel: "Ydre Østerbro" }, // PDF p. 45
  { street: "Sigynsgade", bydel: "Ydre Nørrebro" }, // PDF p. 45
  { street: "Skaffervej", bydel: "Bispebjerg" }, // PDF p. 45
  { street: "Skibbroen", bydel: "Vesterbro" }, // PDF p. 46
  { street: "Skibelundvej", bydel: "Vanløse" }, // PDF p. 46
  { street: "Skindergade", bydel: "Indre By" }, // PDF p. 46
  { street: "Skjalm Hvides Gade", bydel: "Vesterbro" }, // PDF p. 46
  { street: "Skjolds Plads", bydel: "Ydre Nørrebro" }, // PDF p. 46
  { street: "Skodsborggade", bydel: "Ydre Nørrebro" }, // PDF p. 46
  { street: "Skoleholdervej", bydel: "Bispebjerg" }, // PDF p. 46
  { street: "Skotterupgade", bydel: "Ydre Nørrebro" }, // PDF p. 46
  { street: "Skoubogade", bydel: "Indre By" }, // PDF p. 46
  { street: "Skovduestien", bydel: "Bispebjerg" }, // PDF p. 46
  { street: "Skovgaardsgade", bydel: "Indre Østerbro" }, // PDF p. 46
  { street: "Skovløbervej", bydel: "Bispebjerg" }, // PDF p. 46
  { street: "Slangerupgade", bydel: "Ydre Nørrebro" }, // PDF p. 47
  { street: "Sleipnersgade", bydel: "Ydre Nørrebro" }, // PDF p. 47
  { street: "Slien", bydel: "Vesterbro" }, // PDF p. 47
  { street: "Slotsfogedvej", bydel: "Bispebjerg" }, // PDF p. 47
  { street: "Slotsgade", bydel: "Indre Nørrebro" }, // PDF p. 47
  { street: "Slotsholmsgade", bydel: "Indre By" }, // PDF p. 47
  { street: "Slutterigade", bydel: "Indre By" }, // PDF p. 47
  { street: "Slåenvej", bydel: "Vanløse" }, // PDF p. 47
  { street: "Smedegade", bydel: "Indre Nørrebro" }, // PDF p. 47
  { street: "Smedetoften", bydel: "Bispebjerg" }, // PDF p. 47
  { street: "Småkær", bydel: "Vanløse" }, // PDF p. 47
  { street: "Snaregade", bydel: "Indre By" }, // PDF p. 47
  { street: "Sneppevej", bydel: "Bispebjerg" }, // PDF p. 47
  { street: "Sofiegade", bydel: "Christianshavn" }, // PDF p. 47
  { street: "Sokkelundsvej", bydel: "Bispebjerg" }, // PDF p. 47
  { street: "Spøttrupvej", bydel: "Vanløse" }, // PDF p. 48
  { street: "Stadens Vænge", bydel: "Ydre Østerbro" }, // PDF p. 48
  { street: "Stadilvej", bydel: "Vanløse" }, // PDF p. 48
  { street: "Stakkesund", bydel: "Ydre Østerbro" }, // PDF p. 48
  { street: "Staldgade", bydel: "Vesterbro" }, // PDF p. 48
  { street: "Stampesgade", bydel: "Vesterbro" }, // PDF p. 48
  { street: "Statholdervej", bydel: "Bispebjerg" }, // PDF p. 48
  { street: "Staunings Plads", bydel: "Indre By" }, // PDF p. 48
  { street: "Steen Billes Gade", bydel: "Indre Østerbro" }, // PDF p. 48
  { street: "Stefansgade", bydel: "Ydre Nørrebro" }, // PDF p. 48
  { street: "Stenderupgade", bydel: "Vesterbro" }, // PDF p. 48
  { street: "Stengade", bydel: "Indre Nørrebro" }, // PDF p. 48
  { street: "Stenkløvervej", bydel: "Bispebjerg" }, // PDF p. 48
  { street: "Stenosgade", bydel: "Vesterbro" }, // PDF p. 48
  { street: "Stevnsgade", bydel: "Indre Nørrebro" }, // PDF p. 48
  { street: "Strandøre", bydel: "Ryvang Øst" }, // PDF p. 49
  { street: "Struenseegade", bydel: "Indre Nørrebro" }, // PDF p. 49
  { street: "Strødamvej", bydel: "Ydre Østerbro" }, // PDF p. 49
  { street: "Stubbeløbgade", bydel: "Indre Østerbro" }, // PDF p. 49
  { street: "Studiestræde", bydel: "Indre By" }, // PDF p. 49
  { street: "Studsgaardsgade", bydel: "Ydre Østerbro" }, // PDF p. 49
  { street: "Stærevej", bydel: "Bispebjerg" }, // PDF p. 49
  { street: "Støvnæs Allé", bydel: "Bispebjerg" }, // PDF p. 49
  { street: "Suensonsgade", bydel: "Indre By" }, // PDF p. 49
  { street: "Suhmsgade", bydel: "Indre By" }, // PDF p. 49
  { street: "Sundevedsgade", bydel: "Vesterbro" }, // PDF p. 49
  { street: "Svenstrupvej", bydel: "Vanløse" }, // PDF p. 50
  { street: "Svineryggen", bydel: "Indre By" }, // PDF p. 50
  { street: "Sværtegade", bydel: "Indre By" }, // PDF p. 50
  { street: "Syddyssen", bydel: "Christianshavn" }, // PDF p. 50
  { street: "Sydkrogen", bydel: "Vesterbro" }, // PDF p. 50
  { street: "Sydområdet", bydel: "Christianshavn" }, // PDF p. 50
  { street: "Syrenstien", bydel: "Vanløse" }, // PDF p. 50
  { street: "Syvstensvej", bydel: "Vanløse" }, // PDF p. 50
  { street: "Sæbyholmsvej", bydel: "Vanløse" }, // PDF p. 50
  { street: "Søartillerivej", bydel: "Christianshavn" }, // PDF p. 50
  { street: "Søborghus Park", bydel: "Bispebjerg" }, // PDF p. 50
  { street: "Søkrogen", bydel: "Vanløse" }, // PDF p. 50
  { street: "Søllerødgade", bydel: "Ydre Nørrebro" }, // PDF p. 50
  { street: "Sølundsvej", bydel: "Ryvang Øst" }, // PDF p. 50
  { street: "Sønder Boulevard", bydel: "Vesterbro" }, // PDF p. 50
  { street: "Søndervigvej", bydel: "Vanløse" }, // PDF p. 50
  { street: "Takkeladsvej", bydel: "Christianshavn" }, // PDF p. 51
  { street: "Takkeltoftevej", bydel: "Christianshavn" }, // PDF p. 51
  { street: "Tallinngade", bydel: "Indre Østerbro" }, // PDF p. 51
  { street: "Teglgårdsstræde", bydel: "Indre By" }, // PDF p. 51
  { street: "Theklavej", bydel: "Bispebjerg" }, // PDF p. 51
  { street: "Theodor Christensens Plads", bydel: "Christianshavn" }, // PDF p. 51
  { street: "Thielsensvej", bydel: "Indre Østerbro" }, // PDF p. 51
  { street: "Thit Jensens Vej", bydel: "Indre Nørrebro" }, // PDF p. 51
  { street: "Thomas Laubs Gade", bydel: "Ryvang Øst" }, // PDF p. 51
  { street: "Tipsagervej", bydel: "Vanløse" }, // PDF p. 52
  { street: "Tirsbækvej", bydel: "Vanløse" }, // PDF p. 52
  { street: "Titangade", bydel: "Ydre Nørrebro" }, // PDF p. 52
  { street: "Tjæregade", bydel: "Vesterbro" }, // PDF p. 52
  { street: "Todesgade", bydel: "Indre Nørrebro" }, // PDF p. 52
  { street: "Toftøjevej", bydel: "Vanløse" }, // PDF p. 52
  { street: "Toldbodgade", bydel: "Indre By" }, // PDF p. 52
  { street: "Toldskrivervej", bydel: "Bispebjerg" }, // PDF p. 52
  { street: "Tomsgårdsvej", bydel: "Bispebjerg" }, // PDF p. 52
  { street: "Tonemestervej", bydel: "Bispebjerg" }, // PDF p. 52
  { street: "Torbenfeldtvej", bydel: "Vanløse" }, // PDF p. 52
  { street: "Tordenskjoldsgade", bydel: "Indre By" }, // PDF p. 52
  { street: "Tornebuskegade", bydel: "Indre By" }, // PDF p. 52
  { street: "Tornestykket", bydel: "Vanløse" }, // PDF p. 52
  { street: "Tornskadestien", bydel: "Bispebjerg" }, // PDF p. 52
  { street: "Torvegade", bydel: "Christianshavn" }, // PDF p. 52
  { street: "Trekroner", bydel: "Christianshavn" }, // PDF p. 52
  { street: "Tudskærvej", bydel: "Vanløse" }, // PDF p. 53
  { street: "Tulipanvej", bydel: "Vanløse" }, // PDF p. 53
  { street: "Tullinsgade", bydel: "Vesterbro" }, // PDF p. 53
  { street: "Turesensgade", bydel: "Indre By" }, // PDF p. 53
  { street: "Tustrupvej", bydel: "Vanløse" }, // PDF p. 53
  { street: "Tyborøn Allé", bydel: "Vanløse" }, // PDF p. 53
  { street: "Tyttebærvej", bydel: "Vanløse" }, // PDF p. 53
  { street: "Tøjhusgade", bydel: "Indre By" }, // PDF p. 53
  { street: "Tømrergade", bydel: "Indre Nørrebro" }, // PDF p. 53
  { street: "Udbygade", bydel: "Indre Nørrebro" }, // PDF p. 54
  { street: "Uffesgade", bydel: "Ydre Nørrebro" }, // PDF p. 54
  { street: "Ullerupgade", bydel: "Vesterbro" }, // PDF p. 54
  { street: "Ulriksdalvej", bydel: "Vanløse" }, // PDF p. 54
  { street: "Ulvsundvej", bydel: "Indre Østerbro" }, // PDF p. 54
  { street: "Unicef Plads", bydel: "Indre Østerbro" }, // PDF p. 54
  { street: "Universitetsparken", bydel: "Indre Østerbro" }, // PDF p. 54
  { street: "Upsalagade", bydel: "Indre Østerbro" }, // PDF p. 54
  { street: "Urbansgade", bydel: "Indre Østerbro" }, // PDF p. 54
  { street: "Utterslev Torv", bydel: "Bispebjerg" }, // PDF p. 54
  { street: "Utterslevgård", bydel: "Bispebjerg" }, // PDF p. 54
  { street: "Valdemar Holmers Gade", bydel: "Ydre Østerbro" }, // PDF p. 55
  { street: "Valdemarsgade", bydel: "Vesterbro" }, // PDF p. 55
  { street: "Valhalsgade", bydel: "Ydre Nørrebro" }, // PDF p. 55
  { street: "Valkendorfsgade", bydel: "Indre By" }, // PDF p. 55
  { street: "Valkyriegade", bydel: "Ydre Nørrebro" }, // PDF p. 55
  { street: "Valnøddevej", bydel: "Vanløse" }, // PDF p. 55
  { street: "Vandkunsten", bydel: "Indre By" }, // PDF p. 55
  { street: "Vanløse Allé", bydel: "Vanløse" }, // PDF p. 55
  { street: "Vanløse Byvej", bydel: "Vanløse" }, // PDF p. 55
  { street: "Vanløse Torv", bydel: "Vanløse" }, // PDF p. 55
  { street: "Vanløsehøj", bydel: "Vanløse" }, // PDF p. 55
  { street: "Vardegade", bydel: "Indre Østerbro" }, // PDF p. 55
  { street: "Vejlegade", bydel: "Indre Østerbro" }, // PDF p. 56
  { street: "Vendersgade", bydel: "Indre By" }, // PDF p. 56
  { street: "Venøgade", bydel: "Ryvang Øst" }, // PDF p. 56
  { street: "Veras Allé", bydel: "Vanløse" }, // PDF p. 56
  { street: "Vermundsgade", bydel: "Ydre Nørrebro" }, // PDF p. 56
  { street: "Vester Farimagsgade", bydel: "Indre By" }, // PDF p. 56
  { street: "Vester Søgade", bydel: "Indre By" }, // PDF p. 56
  { street: "Vester Voldgade", bydel: "Indre By" }, // PDF p. 56
  { street: "Vestergade", bydel: "Indre By" }, // PDF p. 37
  { street: "Victor Bendix Gade", bydel: "Ryvang Øst" }, // PDF p. 57
  { street: "Victor Borges Plads", bydel: "Indre Østerbro" }, // PDF p. 57
  { street: "Viktoriagade", bydel: "Vesterbro" }, // PDF p. 57
  { street: "Vildandegade", bydel: "Indre By" }, // PDF p. 57
  { street: "Vilhelm Birkedals Vej", bydel: "Bispebjerg" }, // PDF p. 57
  { street: "Vimmelskaftet", bydel: "Indre By" }, // PDF p. 57
  { street: "Vindebrogade", bydel: "Indre By" }, // PDF p. 57
  { street: "Vindruevej", bydel: "Vanløse" }, // PDF p. 57
  { street: "Vingelodden", bydel: "Ydre Nørrebro" }, // PDF p. 57
  { street: "Vingårdsstræde", bydel: "Indre By" }, // PDF p. 57
  { street: "Vinkelager", bydel: "Vanløse" }, // PDF p. 57
  { street: "Vinløvstien", bydel: "Vanløse" }, // PDF p. 57
  { street: "Visbygade", bydel: "Indre Østerbro" }, // PDF p. 57
  { street: "Webersgade", bydel: "Indre Østerbro" }, // PDF p. 58
  { street: "Wesselsgade", bydel: "Indre Nørrebro" }, // PDF p. 58
  { street: "Westend", bydel: "Vesterbro" }, // PDF p. 58
  { street: "Wiedeweltsgade", bydel: "Indre Østerbro" }, // PDF p. 58
  { street: "Wiinbladsgade", bydel: "Kgs. Enghave" }, // PDF p. 58
  { street: "Wilders Plads", bydel: "Christianshavn" }, // PDF p. 58
  { street: "Wildersgade", bydel: "Christianshavn" }, // PDF p. 58
  { street: "Wilhelm Marstrands Gade", bydel: "Indre Østerbro" }, // PDF p. 58
  { street: "Willemoesgade", bydel: "Indre Østerbro" }, // PDF p. 58
  { street: "William Wains Gade", bydel: "Christianshavn" }, // PDF p. 58
  { street: "Ydunsgade", bydel: "Ydre Nørrebro" }, // PDF p. 59
  { street: "Ystadgade", bydel: "Indre Østerbro" }, // PDF p. 59
  { street: "Zinnsgade", bydel: "Indre Østerbro" }, // PDF p. 59
  { street: "Åbakkevej", bydel: "Vanløse" }, // PDF p. 61
  { street: "Åbenrå", bydel: "Indre By" }, // PDF p. 61
  { street: "Ådalsvej", bydel: "Vanløse" }, // PDF p. 61
  { street: "Ålborggade", bydel: "Ydre Østerbro" }, // PDF p. 15
  { street: "Ålekistevej", bydel: "Vanløse" }, // PDF p. 61
  { street: "Ålstrupvej", bydel: "Vanløse" }, // PDF p. 61
  { street: "Åløkkevej", bydel: "Vanløse" }, // PDF p. 61
  { street: "Århus Plads", bydel: "Indre Østerbro" }, // PDF p. 61
  { street: "Århusgade", bydel: "Indre Østerbro" }, // PDF p. 61
  { street: "Æbeløgade", bydel: "Ryvang Øst" }, // PDF p. 59
  { street: "Ægirsgade", bydel: "Ydre Nørrebro" }, // PDF p. 59
  { street: "Ørevadsvej", bydel: "Bispebjerg" }, // PDF p. 60
  { street: "Ørhagevej", bydel: "Vanløse" }, // PDF p. 60
  { street: "Ørholmsgade", bydel: "Ydre Nørrebro" }, // PDF p. 60
  { street: "Øster Allé", bydel: "Indre Østerbro" }, // PDF p. 60
  { street: "Østerbro Vænge", bydel: "Indre Østerbro" }, // PDF p. 60
  { street: "Østerfælled Torv", bydel: "Indre Østerbro" }, // PDF p. 60
  { street: "Østergade", bydel: "Indre By" }, // PDF p. 60
] as const;

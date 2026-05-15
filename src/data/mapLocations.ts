export const locationCoords: Record<string, [number, number]> = {
  // Western
  Colombo: [6.9271, 79.8612],
  Gampaha: [7.084, 80.0098],
  Kalutara: [6.5854, 79.9607],
  // Central
  Kandy: [7.2906, 80.6337],
  Matale: [7.4675, 80.6234],
  "Nuwara Eliya": [6.9497, 80.7891],
  // Southern
  Galle: [6.0531, 80.221],
  Matara: [5.9549, 80.555],
  Hambantota: [6.1246, 81.1185],
  // Northern
  Jaffna: [9.6615, 80.0255],
  Kilinochchi: [9.3803, 80.3992],
  Mannar: [8.981, 79.9044],
  Mullaitivu: [9.2671, 80.8143],
  Vavuniya: [8.7542, 80.4982],
  // Eastern
  Trincomalee: [8.5874, 81.2152],
  Batticaloa: [7.7102, 81.6924],
  Ampara: [7.2843, 81.6747],
  // North Western
  Kurunegala: [7.4818, 80.3609],
  Puttalam: [8.0362, 79.8283],
  // North Central
  Anuradhapura: [8.3114, 80.4037],
  Polonnaruwa: [7.936, 81.001],
  // Uva
  Badulla: [6.9934, 81.055],
  Monaragala: [6.891, 81.35],
  // Sabaragamuwa
  Ratnapura: [6.6828, 80.3992],
  Kegalle: [7.2513, 80.3464],
  // Additional popular spots
  Negombo: [7.2088, 79.8358],
  Mirissa: [5.9495, 80.4572],
  Ella: [6.8667, 81.0462],
};

export const districtProvinceMap: Record<string, string> = {
  Colombo: "Western",
  Gampaha: "Western",
  Kalutara: "Western",
  Kandy: "Central",
  Matale: "Central",
  "Nuwara Eliya": "Central",
  NuwaraEliya: "Central", // Handle both
  Galle: "Southern",
  Matara: "Southern",
  Hambantota: "Southern",
  Jaffna: "Northern",
  Kilinochchi: "Northern",
  Mannar: "Northern",
  Mullaitivu: "Northern",
  Vavuniya: "Northern",
  Trincomalee: "Eastern",
  Batticaloa: "Eastern",
  Ampara: "Eastern",
  Kurunegala: "North Western",
  Puttalam: "North Western",
  Anuradhapura: "North Central",
  Polonnaruwa: "North Central",
  Badulla: "Uva",
  Monaragala: "Uva",
  Ratnapura: "Sabaragamuwa",
  Kegalle: "Sabaragamuwa"
};

export const DISTRICT_CITY_MAP: Record<string, string[]> = {
  Colombo: ["Colombo 1-15", "Dehiwala", "Moratuwa", "Kotte", "Maharagama", "Nugegoda", "Homagama"],
  Gampaha: ["Negombo", "Ja-Ela", "Kadawatha", "Gampaha", "Kelaniya", "Wattala", "Minuwangoda"],
  Kalutara: ["Kalutara", "Panadura", "Horana", "Beruwala", "Matugama"],
  Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya"],
  Matale: ["Matale", "Dambulla", "Galewela", "Sigiriya"],
  "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Nanu Oya", "Talawakele"],
  Galle: ["Galle", "Hikkaduwa", "Unawatuna", "Ambalangoda", "Elpitiya"],
  Matara: ["Matara", "Weligama", "Akuressa", "Hakmana", "Dikwella", "Kamburugamuwa"],
  Hambantota: ["Hambantota", "Tangalle", "Tissamaharama", "Beliatta", "Ambalantota"],
  Jaffna: ["Jaffna", "Nallur", "Chavakachcheri", "Point Pedro", "Kopay"],
  Kilinochchi: ["Kilinochchi", "Pallai", "Poonakary"],
  Mannar: ["Mannar", "Murunkan", "Pesalai"],
  Mullaitivu: ["Mullaitivu", "Puthukkudiyiruppu", "Oddusuddan"],
  Vavuniya: ["Vavuniya", "Cheddikulam"],
  Trincomalee: ["Trincomalee", "Kinniya", "Mutur", "Nilaveli"],
  Batticaloa: ["Batticaloa", "Kalkudah", "Kattankudy", "Valaichchenai"],
  Ampara: ["Ampara", "Kalmunai", "Samanthurai", "Pottuvil", "Arugam Bay"],
  Kurunegala: ["Kurunegala", "Kuliyapitiya", "Narammala", "Wariyapola"],
  Puttalam: ["Puttalam", "Chilaw", "Wennappuwa", "Nattandiya", "Kalpitiya"],
  Anuradhapura: ["Anuradhapura", "Kekirawa", "Medawachchiya", "Tambuttegama"],
  Polonnaruwa: ["Polonnaruwa", "Hingurakgoda", "Medirigiriya", "Kaduruwela"],
  Badulla: ["Badulla", "Bandarawela", "Haputale", "Mahiyanganaya", "Ella"],
  Monaragala: ["Monaragala", "Bibile", "Wellawaya", "Kataragama"],
  Ratnapura: ["Ratnapura", "Pelmadulla", "Balangoda", "Embilipitiya"],
  Kegalle: ["Kegalle", "Mawanella", "Warakapola", "Ruwanwella"]
};

export const getProvinceForDistrict = (district: string): string => {
  // Normalize district name (remove spaces and special chars if needed, or just look up)
  const normalized = district.replace(/\s+/g, "");
  return districtProvinceMap[district] || districtProvinceMap[normalized] || "Western";
};

/** Sri Lanka center for map default view. */
export const SRI_LANKA_CENTER: [number, number] = [7.8, 80.6];
export const SRI_LANKA_DEFAULT_ZOOM = 8;

/**
 * Get [lat, lng] for a location. Adds a small offset per index so multiple vehicles in the same city don't stack.
 */
export function getCoordsForVehicle(location: string, index: number): [number, number] {
  const base = locationCoords[location] ?? SRI_LANKA_CENTER;
  const offset = index * 0.008;
  return [base[0] + offset * 0.5, base[1] + offset * 0.3];
}

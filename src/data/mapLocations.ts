/** Approximate coordinates for Sri Lanka cities (lat, lng). */
export const locationCoords: Record<string, [number, number]> = {
  Colombo: [6.9271, 79.8612],
  Kandy: [7.2906, 80.6337],
  Galle: [6.0531, 80.221],
  Negombo: [7.2088, 79.8358],
  "Nuwara Eliya": [6.9497, 80.7891],
  Mirissa: [5.9495, 80.4572],
  Anuradhapura: [8.3114, 80.4037],
  Jaffna: [9.6615, 80.0255],
  Ella: [6.8667, 81.0462],
  Trincomalee: [8.5874, 81.2152],
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


// Converts degrees to radians
const toRadians = (degree: number): number => {
  return (degree * Math.PI) / 180;
};

// Calculate distance-based travel time in minutes
const getDurationOfTwoPoints = (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number
): number => {
  const earthRadiusKm = 6371;

  const dLat = toRadians(endLatitude - startLatitude);
  const dLon = toRadians(endLongitude - startLongitude);

  const lat1 = toRadians(startLatitude);
  const lat2 = toRadians(endLatitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  const averageSpeedKmh = 20; // You can customize this
  const durationInHours = distance / averageSpeedKmh;
  const durationInMinutes = durationInHours * 60;

  return durationInMinutes;
};

// Add X minutes to current time and return a new Date object
const getApproximateArrivalTime = (durationInMinutes: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + durationInMinutes * 60 * 1000);
};

// Combine both steps: take two locations and return estimated arrival Date
const getEstimatedArrivalTime = (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Date => {
  const duration = getDurationOfTwoPoints(startLat, startLng, endLat, endLng);
  console.log(duration);
  
  return getApproximateArrivalTime(duration);
};

export { getEstimatedArrivalTime };

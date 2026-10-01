/**
 * DealerLocatorService
 * Calculates nearest dealer using the Haversine formula.
 */

const EARTH_RADIUS_KM = 6371.0;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

function findNearestDealer(dealers, customerLat, customerLon) {
  if (customerLat == null || customerLon == null || !dealers.length) return null;

  let nearest = null;
  let minDistance = Infinity;

  for (const dealer of dealers) {
    if (dealer.latitude == null || dealer.longitude == null) continue;
    const distance = calculateDistance(customerLat, customerLon, dealer.latitude, dealer.longitude);
    dealer.distance = distance;
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...dealer };
    }
  }

  return nearest;
}

module.exports = { calculateDistance, findNearestDealer };

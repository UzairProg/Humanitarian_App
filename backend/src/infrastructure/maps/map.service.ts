import { Injectable, Logger } from '@nestjs/common';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export abstract class MapService {
  abstract geocode(address: string): Promise<GeoLocation | null>;
  abstract calculateDistanceKm(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number;
}

@Injectable()
export class MockMapService implements MapService {
  private readonly logger = new Logger(MockMapService.name);

  async geocode(address: string): Promise<GeoLocation | null> {
    this.logger.debug(`Geocoding query: "${address}" (Provider: Mock)`);
    // Safe dev deterministic mock location
    return {
      latitude: 32.6160,
      longitude: 44.0249,
      formattedAddress: address,
    };
  }

  calculateDistanceKm(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number },
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }
}

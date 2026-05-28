import { TOWNS_BY_COUNTY } from '../data/irishTowns';
import { TOWNS_BY_COUNTY_SPAIN } from '../data/spainTowns';
import { TOWNS_BY_COUNTY_ENGLAND } from '../data/englandTowns';
import { TOWNS_BY_COUNTY_FRANCE } from '../data/franceTowns';
import { TOWNS_BY_COUNTY_PORTUGAL } from '../data/portugalTowns';

export const TOWNS_MAP: Record<string, Record<string, string[]>> = {
  ireland: TOWNS_BY_COUNTY,
  spain: TOWNS_BY_COUNTY_SPAIN,
  england: TOWNS_BY_COUNTY_ENGLAND,
  france: TOWNS_BY_COUNTY_FRANCE,
  portugal: TOWNS_BY_COUNTY_PORTUGAL,
};

export function getTownsForTenant(tenant: string): Record<string, string[]> {
  return TOWNS_MAP[tenant] || TOWNS_BY_COUNTY;
}

export function getCountiesForTenant(tenant: string): string[] {
  return Object.keys(getTownsForTenant(tenant)).sort();
}

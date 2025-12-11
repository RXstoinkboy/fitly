import { GarmentType } from '@/lib/garments/types';

export const garmentsKeys = {
  all: () => ['garments'] as const,
  list: (type: GarmentType) => [...garmentsKeys.all(), 'list', type] as const,
  add: (type: GarmentType) => [...garmentsKeys.all(), 'add', type] as const,
};

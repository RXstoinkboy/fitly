import { tableSchema } from '@nozbe/watermelondb';

export const outfitsClothesSchema = tableSchema({
  name: 'outfits_clothes',
  columns: [
    { name: 'outfit_id', type: 'string', isIndexed: true },
    { name: 'cloth_id', type: 'string', isIndexed: true },

    { name: 'created_at', type: 'number' },
  ],
});

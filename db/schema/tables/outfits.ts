import { tableSchema } from '@nozbe/watermelondb';

export const outfitsSchema = tableSchema({
  name: 'outfits',
  columns: [
    { name: 'name', type: 'string', isOptional: true },
    { name: 'description', type: 'string', isOptional: true },
    { name: 'mime_type', type: 'string', isOptional: true },
    { name: 'file_path', type: 'string' },

    { name: 'model_id', type: 'string', isIndexed: true },

    { name: 'updated_at', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'deleted_at', type: 'number', isOptional: true },
  ],
});

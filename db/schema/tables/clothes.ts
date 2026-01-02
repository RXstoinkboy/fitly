import { tableSchema } from '@nozbe/watermelondb';

export const clothesSchema = tableSchema({
  name: 'clothes',
  columns: [
    { name: 'name', type: 'string', isOptional: true },
    { name: 'mime_type', type: 'string', isOptional: true },
    { name: 'source', type: 'string', isOptional: true }, // e.g., 'camera' or 'library' or 'url'
    { name: 'file_path', type: 'string' },
    { name: 'type', type: 'string' }, // e.g., 'top', 'bottom', 'shoe', etc.

    { name: 'updated_at', type: 'number', isOptional: true },
    { name: 'created_at', type: 'number', isOptional: true },
    { name: 'deleted_at', type: 'number', isOptional: true },
  ],
});

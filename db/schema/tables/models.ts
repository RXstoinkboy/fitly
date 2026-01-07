import { tableSchema } from '@nozbe/watermelondb';

export const modelsSchema = tableSchema({
  name: 'models',
  columns: [
    { name: 'name', type: 'string', isOptional: true },
    { name: 'mime_type', type: 'string', isOptional: true },
    { name: 'source', type: 'string', isOptional: true }, // e.g., 'camera' or 'library'
    { name: 'file_path', type: 'string' },
    { name: 'is_current', type: 'boolean' },

    { name: 'updated_at', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'deleted_at', type: 'number', isOptional: true },
  ],
});

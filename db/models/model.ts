import { Model } from '@nozbe/watermelondb';
import { text, date, field, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class ModelPhoto extends Model {
  static table = 'models';
  static associations: Associations = {
    outfits: { type: 'has_many', foreignKey: 'model_id' },
  };

  @text('name') name!: string | null;
  @text('mime_type') mimeType!: string | null;
  @text('source') source!: string | null; // TODO: add enum 'camera' or 'library' etc
  @text('file_path') filePath!: string;
  @field('is_current') isCurrent!: boolean;
  @date('updated_at') updatedAt!: number | null;
  @date('created_at') createdAt!: number | null;
  @date('deleted_at') deletedAt!: number | null;

  @children('outfits') outfits!: any;
}

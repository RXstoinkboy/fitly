import { Collection, Model, Q } from '@nozbe/watermelondb';
import { text, date, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import OutfitCloth from './OutfitCloth';
import Outfit from './outfit';

export default class Cloth extends Model {
  static table = 'clothes';
  static associations: Associations = {
    outfits_clothes: { type: 'has_many', foreignKey: 'cloth_id' },
  };

  @text('name') name!: string | null;
  @text('mime_type') mimeType!: string | null;
  @text('source') source!: string | null; // e.g., 'camera' or 'library' or 'url'
  @text('file_path') filePath!: string;
  @text('type') type!: string; // e.g., 'top', 'bottom', 'shoe', etc.
  @date('updated_at') updatedAt!: number | null;
  @date('created_at') createdAt!: number | null;
  @date('deleted_at') deletedAt!: number | null;

  @children('outfits_clothes') outfitClothes!: Collection<OutfitCloth>;

  async getOutfits(): Promise<Outfit[]> {
    const joinRows = await this.outfitClothes.query().fetch();
    const outfitIds = joinRows.map((j) => j.outfitId);
    if (outfitIds.length === 0) return [];

    return this.collections
      .get<Outfit>('outfits')
      .query(Q.where('id', Q.oneOf(outfitIds)))
      .fetch();
  }
}

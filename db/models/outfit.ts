import { Collection, Model, Q } from '@nozbe/watermelondb';
import { text, date, immutableRelation, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Cloth from './cloth';
import OutfitCloth from './OutfitCloth';

export default class Outfit extends Model {
  static table = 'outfits';
  static associations: Associations = {
    outfits_clothes: { type: 'has_many', foreignKey: 'outfit_id' },
    models: { type: 'belongs_to', key: 'model_id' },
  };

  @text('name') name!: string | null;
  @text('description') description!: string | null;
  @text('mime_type') mimeType!: string | null;
  @text('file_path') filePath!: string;
  @date('updated_at') updatedAt!: number | null;
  @date('created_at') createdAt!: number | null;
  @date('deleted_at') deletedAt!: number | null;

  @immutableRelation('models', 'model_id') model!: Model;
  @children('outfits_clothes') outfitClothes!: Collection<OutfitCloth>;

  async getClothes(): Promise<Cloth[]> {
    const joinRows = await this.outfitClothes.query().fetch();
    const clothIds = joinRows.map((j) => j.clothId);
    if (clothIds.length === 0) return [];

    return this.collections
      .get<Cloth>('clothes')
      .query(Q.where('id', Q.oneOf(clothIds)))
      .fetch();
  }
}

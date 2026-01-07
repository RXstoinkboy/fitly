import { Model } from '@nozbe/watermelondb';
import { field, immutableRelation } from '@nozbe/watermelondb/decorators';
import Outfit from './outfit';
import Cloth from './cloth';

export default class OutfitCloth extends Model {
  static table = 'outfits_clothes';

  @field('outfit_id') outfitId!: string;
  @field('cloth_id') clothId!: string;
  @field('role') role?: string;

  @immutableRelation('outfits', 'outfit_id') outfit!: Outfit;
  @immutableRelation('clothes', 'cloth_id') cloth!: Cloth;
}

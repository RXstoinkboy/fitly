import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import Outfit from './outfit';
import Cloth from './cloth';

export default class OutfitCloth extends Model {
  static table = 'outfits_clothes';

  @field('outfit_id') outfitId!: string;
  @field('cloth_id') clothId!: string;
  @field('role') role?: string;

  @relation('outfits', 'outfit_id') outfit!: Outfit;
  @relation('clothes', 'cloth_id') cloth!: Cloth;
}

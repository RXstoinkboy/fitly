import { appSchema } from '@nozbe/watermelondb';
import * as tables from './tables';

export default appSchema({
  version: 1,
  tables: Object.values(tables),
});

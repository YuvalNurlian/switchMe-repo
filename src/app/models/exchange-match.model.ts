
import { Product } from './product.model';

export interface ExchangeMatch {
  user_id: string;
  offered_product_id: number;
  score: number;
  user_product?: Product;
  offered_product?: Product;
}

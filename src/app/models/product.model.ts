import { Category } from './category.model';
import { Condition } from './condition.model';

export class Product {
    id: number;
  name: string;
  category: Category;
  condition: Condition; //מצב המוצר
  manufacturer: string;
  yearsUsed: number;
  purchasePrice: number; //מחיר רכישה
  description: string;
  price: number;
  approvedByAI: boolean;

  countInterestedUsers : number;
  
  material: string;
  dimensions: string;
  
  userId!: string;

  constructor() {
    this.id = 0;
    this.name = '';
    this.description = '';
    this.price = 0;
    this.approvedByAI = false;
    this.category = {} as Category;
    this.condition = {} as Condition;
    this.yearsUsed = 0;
    this.manufacturer = '';
    this. purchasePrice = 0;
    this.material = '';
    this.dimensions = '';
    this.countInterestedUsers = 0;
  }

}

export interface ExchangeMatch {
  myProduct: Product;
  matchedProduct: Product;
}

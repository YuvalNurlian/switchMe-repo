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
  
  material: string;
  dimensions: string;

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
  }

  // שנת רכישה 
  // מצב המוצר
  // יצרן
  // מחיר רכישה
  //חומר עיקרי - ריהוט ביגוד וציוד ספורט
  //מידות - לריהוט וציוד ספורט
  // תמונה?
  // 
}

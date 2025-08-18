// src/product/product.model.ts
export interface Product {
    id?: number; // Optional, as it might not be present on creation
    name: string;
    category: { id: number };
    condition: { id: number };
    yearsUsed: number;
    manufacturer: string;
    purchasePrice: number;
    material?: string;
    dimensions?: string;
    description?: string;
    price?: number;
    approvedByAI?: boolean;
    userId: string;
  }
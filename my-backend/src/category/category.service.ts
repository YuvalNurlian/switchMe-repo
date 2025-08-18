import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(private dataSource: DataSource) {}

  async getAllCategories(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM categories');
  }
}

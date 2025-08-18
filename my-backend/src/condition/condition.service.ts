import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ConditionService {
  constructor(private dataSource: DataSource) {}

  async getAllConditions(): Promise<any[]> {
    return this.dataSource.query('SELECT * FROM conditions');
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(private dataSource: DataSource) {}

  async getAllProducts(uid: string): Promise<any[]> {
    return this.dataSource.query(
      `SELECT * FROM products WHERE user_id != $1`,
      [uid]
    );
  }


  // async getProductsByUserId(uid: string): Promise<any[]> {
  //   console.log('📌 מחפש מוצרים למשתמש:', uid);
  //   return this.dataSource.query(`SELECT * FROM products WHERE user_id = $1`, [uid]);
  // }

  async getProductsByUserId(uid: string): Promise<any[]> {
    console.log('📌 מחפש מוצרים למשתמש:', uid);
  
    const query = `
      SELECT 
        pr.*, 
        COUNT(up.user_id) AS interested_count
      FROM 
        products AS pr
      LEFT JOIN 
        user_product_interest AS up ON up.product_id = pr.id
      WHERE 
        pr.user_id = $1
      GROUP BY 
        pr.id
    `;
    //last column count how many users want this products
    return this.dataSource.query(query, [uid]);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM products WHERE id = $1`,
      [id]
    );
  }

  async insertNewProduct(product: any): Promise<any> {
    const {
      name,
      category: { id: category_id },
      condition: { id: condition_id },
      manufacturer,
      yearsUsed: yearsused,
      purchasePrice: purchaseprice,
      description = null,
      price = null,
      approvedByAI: approvedbyai = false,
      material = null,
      dimensions = null,
      userId: user_id
    } = product;
  
    const result = await this.dataSource.query(
      `INSERT INTO products
       (name,
        category_id,
        condition_id,
        manufacturer,
        yearsused,
        purchaseprice,
        description,
        price,
        approvedbyai,
        material,
        dimensions,
        user_id)
       VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        category_id,
        condition_id,
        manufacturer,
        yearsused,
        purchaseprice,
        description,
        price,
        approvedbyai,
        material,
        dimensions,
        user_id
      ]
    );
  
    return result[0];
  }

  async markAsInterested(userId: string, productId: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      await queryRunner.query(
        `DELETE FROM user_product_interest WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );
  
      const result = await queryRunner.query(
        `INSERT INTO user_product_interest (user_id, product_id, is_interest)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, productId, 1]
      );
  
      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async markAsNotInterested(userId: string, productId: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
  
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      await queryRunner.query(
        `DELETE FROM user_product_interest WHERE user_id = $1 AND product_id = $2`,
        [userId, productId]
      );
  
      const result = await queryRunner.query(
        `INSERT INTO user_product_interest (user_id, product_id, is_interest)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, productId, 0]
      );
  
      await queryRunner.commitTransaction();
      return result[0];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProductsByInterest(userId: string, isInterest: number): Promise<any[]> {
    const query = `
      SELECT pr.*
      FROM products AS pr
      INNER JOIN user_product_interest AS up ON pr.id = up.product_id
      WHERE up.user_id = $1 AND up.is_interest = $2
    `;
  
    const result = await this.dataSource.query(query, [userId, isInterest]);
    return result;
  }

    // פונקציה שתביא את המוצרים של משתמשים שהתעניינו במוצר מסוים
    async getPotentialExchangeProducts(productId: number): Promise<any[]> {
      const query = `
        SELECT pr.*
        FROM products AS pr
        WHERE pr.user_id IN (
          SELECT up.user_id 
          FROM user_product_interest AS up 
          WHERE up.product_id = $1 AND up.is_interest = 1
        )
        AND pr.id != $1
      `;
    
      const result = await this.dataSource.query(query, [productId]);
      return result;
    }

    async getMutualExchangeMatches(userId: string): Promise<any[]> {
      const query = `SELECT * FROM find_full_product_matches($1)`;
      return this.dataSource.query(query, [userId]);
    }

  // async getProductsInterestedByOthers(userId: string): Promise<any[]> {
  //   const query = `
  //     SELECT up.product_id, pr.name
  //     FROM user_product_interest AS up
  //     JOIN products AS pr ON up.product_id = pr.id
  //     WHERE pr.user_id = $1
  //     AND up.user_id != $1;
  //   `;
  //   const result = await this.dataSource.query(query, [userId]);
  //   return result;
  // }
  
}

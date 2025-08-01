import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ExchangeMatchesGeneratorService } from '../exchange-matches/exchange-matches-generator.service';

@Injectable()
export class ProductService {
  constructor(
    private dataSource: DataSource,
    private exchangeMatchesGeneratorService: ExchangeMatchesGeneratorService,
  ) {}

  async getAllProducts(uid: string): Promise<any[]> {
    return this.dataSource.query(
      `SELECT DISTINCT ON (p.id) p.*, ups.score
       FROM products AS p
       LEFT JOIN user_product_scores AS ups ON p.id = ups.product_id AND ups.user_id = $1
       WHERE p.user_id != $1
       ORDER BY p.id`,
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
        pr.id,
        pr.name,
        pr.category_id,
        pr.condition_id,
        pr.manufacturer,
        pr.yearsused,
        pr.purchaseprice,
        pr.description,
        pr.price,
        pr.approvedbyai,
        pr.material,
        pr.dimensions,
        pr.user_id
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

    const insertedProduct = result[0];
    // Trigger exchange match generation after a new product is inserted
    await this.exchangeMatchesGeneratorService.generateAndSaveExchangeMatches();
    return insertedProduct;
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
      return this.dataSource.query(
        `SELECT * FROM exchange_matches WHERE user_id = $1`,
        [userId]
      );
    }

    async performExchange(myProductUserId: string, matchedProductUserId: string, myProductName: string, matchedProductName: string): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Get product IDs based on names and current user IDs
        const myProduct = await queryRunner.query(
          `SELECT id FROM products WHERE name = $1 AND user_id = $2`,
          [myProductName, myProductUserId]
        );
        const matchedProduct = await queryRunner.query(
          `SELECT id FROM products WHERE name = $1 AND user_id = $2`,
          [matchedProductName, matchedProductUserId]
        );

        if (myProduct.length === 0 || matchedProduct.length === 0) {
          throw new Error('One or both products not found for exchange.');
        }

        const myProductId = myProduct[0].id;
        const matchedProductId = matchedProduct[0].id;

        // Swap user IDs
        await queryRunner.query(
          `UPDATE products SET user_id = $1 WHERE id = $2`,
          [matchedProductUserId, myProductId]
        );
        await queryRunner.query(
          `UPDATE products SET user_id = $1 WHERE id = $2`,
          [myProductUserId, matchedProductId]
        );

        await queryRunner.commitTransaction();
        console.log(`Exchange successful: ${myProductName} (from ${myProductUserId}) swapped with ${matchedProductName} (from ${matchedProductUserId})`);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error performing exchange:', error.message, error.stack);
        throw error;
      } finally {
        await queryRunner.release();
      }
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

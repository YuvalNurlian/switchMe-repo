import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {DataSource} from 'typeorm';
import {firstValueFrom} from 'rxjs';

@Injectable()
export class ExchangeMatchesGeneratorService {
  private readonly pythonModelUrl = 'http://localhost:8000/predict';

  constructor(
    private readonly httpService: HttpService,
    private dataSource: DataSource,
  ) {
  }

  async generateAndSaveExchangeMatches(): Promise<void> {
    console.log('Starting exchange match generation...');
    try {
      const productOffers: any[] = await this.dataSource.query('SELECT * FROM user_product_offer_features_view');

      if (!productOffers || productOffers.length === 0) {
        console.warn('No product offers found in view to generate matches.');
        return;
      }
      const dataForModel: any[] = this.prepareDataForPythonModel(productOffers);

      console.log('Sending data to Python model...');
      const response = await firstValueFrom(
        this.httpService.post(this.pythonModelUrl, {data: dataForModel})
      );
      const matchesFromPython = response.data;
      console.log(`Received ${matchesFromPython.length} matches from Python model.`);

      await this.dataSource.query(
        `DELETE FROM user_product_scores`
      );

      // Clear existing matches and insert into user_product_scores
      for (const match of matchesFromPython) {
        // Fetch product name for the offered product
        const offeredProduct = await this.dataSource.query(
          `SELECT name FROM products WHERE id = $1`,
          [match.offered_product_id]
        );
        const offeredProductName = offeredProduct.length > 0 ? offeredProduct[0].name : 'Unknown Product';

        await this.dataSource.query(
          `INSERT INTO user_product_scores (user_id, product_id, product_name, score)
           VALUES ($1, $2, $3, $4)`,
          [match.user_id, match.offered_product_id, offeredProductName, match.score]
        );

      }
      console.log('User product scores saved to database successfully.');
    } catch (error) {
      console.error('Error generating and saving exchange matches:', error.message, error.stack);
      throw error;
    }
  }


  private prepareDataForPythonModel(productOffers: any[]): any[] {
    const data: any[] = productOffers;
    return data;
  }

  async getExchangeMatchesForUser(userId: string): Promise<any[]> {
    return this.dataSource.query(
      `SELECT * FROM exchange_matches WHERE user_id = $1`,
      [Number(userId)]
    );
  }
}

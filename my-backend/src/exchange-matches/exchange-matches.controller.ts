import { Controller, Get, Param, Post } from '@nestjs/common';
import { ExchangeMatchesGeneratorService } from './exchange-matches-generator.service';

@Controller('api/exchange-matches')
export class ExchangeMatchesController {
  constructor(
    private readonly exchangeMatchesGeneratorService: ExchangeMatchesGeneratorService,
  ) {}

  @Post('/generate')
  async generateMatches() {
    await this.exchangeMatchesGeneratorService.generateAndSaveExchangeMatches();
    return { message: 'Exchange matches generated and saved successfully.' };
  }

  @Get(':userId')
  async getMatches(@Param('userId') userId: string) {
    return this.exchangeMatchesGeneratorService.getExchangeMatchesForUser(userId);
  }
}

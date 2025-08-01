import { TestBed } from '@angular/core/testing';

import { ExchangeMatchesService } from './exchange-matches.service';

describe('ExchangeMatchesService', () => {
  let service: ExchangeMatchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExchangeMatchesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

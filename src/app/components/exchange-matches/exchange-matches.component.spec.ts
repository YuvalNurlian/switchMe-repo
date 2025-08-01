import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeMatchesComponent } from './exchange-matches.component';

describe('ExchangeMatchesComponent', () => {
  let component: ExchangeMatchesComponent;
  let fixture: ComponentFixture<ExchangeMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangeMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchangeMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

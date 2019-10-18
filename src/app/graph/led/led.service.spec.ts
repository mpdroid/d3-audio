import { TestBed } from '@angular/core/testing';

import { LedService } from './led.service';

describe('LedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LedService = TestBed.get(LedService);
    expect(service).toBeTruthy();
  });
});

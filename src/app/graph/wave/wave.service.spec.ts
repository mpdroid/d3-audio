import { TestBed } from '@angular/core/testing';

import { WaveService } from './wave.service';

describe('WaveService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WaveService = TestBed.get(WaveService);
    expect(service).toBeTruthy();
  });
});

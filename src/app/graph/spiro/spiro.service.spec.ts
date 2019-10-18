import { TestBed } from '@angular/core/testing';

import { SpiroService } from './spiro.service';

describe('SpiroService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpiroService = TestBed.get(SpiroService);
    expect(service).toBeTruthy();
  });
});

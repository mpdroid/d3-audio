import { TestBed } from '@angular/core/testing';

import { BubbleService } from './bubble.service';

describe('BubbleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BubbleService = TestBed.get(BubbleService);
    expect(service).toBeTruthy();
  });
});

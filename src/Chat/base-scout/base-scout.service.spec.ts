import { Test, TestingModule } from '@nestjs/testing';
import { BaseScoutService } from './base-scout.service';

describe('BaseScoutService', () => {
  let service: BaseScoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseScoutService],
    }).compile();

    service = module.get<BaseScoutService>(BaseScoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

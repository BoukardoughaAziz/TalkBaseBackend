import { Test, TestingModule } from '@nestjs/testing';
import { BaseBuddyService } from './base-buddy.service';

describe('BaseBuddyService', () => {
  let service: BaseBuddyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaseBuddyService],
    }).compile();

    service = module.get<BaseBuddyService>(BaseBuddyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

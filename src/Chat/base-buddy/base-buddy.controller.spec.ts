import { Test, TestingModule } from '@nestjs/testing';
import { BaseBuddyController } from './base-buddy.controller';
import { BaseBuddyService } from './base-buddy.service';

describe('BaseBuddyController', () => {
  let controller: BaseBuddyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseBuddyController],
      providers: [BaseBuddyService],
    }).compile();

    controller = module.get<BaseBuddyController>(BaseBuddyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

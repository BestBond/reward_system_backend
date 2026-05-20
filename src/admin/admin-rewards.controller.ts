import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { AdminRewardsService } from './admin-rewards.service';
import { CreateAdminRewardDto } from './dto/create-admin-reward.dto';
import { UpdateAdminRewardDto } from './dto/update-admin-reward.dto';

@Controller('admin/rewards')
export class AdminRewardsController {
  constructor(private readonly adminRewards: AdminRewardsService) {}

  @Get()
  @RequirePermissions('rewards.manage')
  list() {
    return this.adminRewards.list();
  }

  @Get(':id')
  @RequirePermissions('rewards.manage')
  get(@Param('id') id: string) {
    return this.adminRewards.getById(id);
  }

  @Post()
  @RequirePermissions('rewards.manage')
  create(@Body() dto: CreateAdminRewardDto) {
    return this.adminRewards.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('rewards.manage')
  update(@Param('id') id: string, @Body() dto: UpdateAdminRewardDto) {
    return this.adminRewards.update(id, dto);
  }

  @Post(':id/toggle-active')
  @RequirePermissions('rewards.manage')
  toggleActive(@Param('id') id: string) {
    return this.adminRewards.toggleActive(id);
  }
}

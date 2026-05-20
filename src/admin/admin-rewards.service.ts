import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../rewards/entities/reward.entity';
import { CreateAdminRewardDto } from './dto/create-admin-reward.dto';
import { UpdateAdminRewardDto } from './dto/update-admin-reward.dto';

@Injectable()
export class AdminRewardsService {
  constructor(
    @InjectRepository(Reward) private readonly rewardsRepo: Repository<Reward>,
  ) {}

  async list() {
    const rows = await this.rewardsRepo.find({
      order: { sortOrder: 'ASC', pointsCost: 'ASC', title: 'ASC' },
      take: 500,
    });
    return rows.map((r) => this.serialize(r));
  }

  async getById(id: string) {
    const reward = await this.rewardsRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    return this.serialize(reward);
  }

  async create(dto: CreateAdminRewardDto) {
    const reward = this.rewardsRepo.create({
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
      pointsCost: dto.pointsCost,
      giftTier: dto.giftTier,
      imageUrl: dto.imageUrl?.trim() ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.rewardsRepo.save(reward);
    return this.serialize(saved);
  }

  async update(id: string, dto: UpdateAdminRewardDto) {
    const reward = await this.rewardsRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');

    if (dto.title !== undefined) reward.title = dto.title.trim();
    if (dto.description !== undefined) {
      reward.description = dto.description?.trim() ?? null;
    }
    if (dto.pointsCost !== undefined) reward.pointsCost = dto.pointsCost;
    if (dto.giftTier !== undefined) reward.giftTier = dto.giftTier;
    if (dto.imageUrl !== undefined) {
      reward.imageUrl = dto.imageUrl?.trim() ?? null;
    }
    if (dto.sortOrder !== undefined) reward.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) reward.isActive = dto.isActive;

    const saved = await this.rewardsRepo.save(reward);
    return this.serialize(saved);
  }

  async toggleActive(id: string) {
    const reward = await this.rewardsRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    reward.isActive = !reward.isActive;
    const saved = await this.rewardsRepo.save(reward);
    return this.serialize(saved);
  }

  private serialize(reward: Reward) {
    return {
      id: reward.id,
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      giftTier: reward.giftTier,
      sortOrder: reward.sortOrder,
      imageUrl: reward.imageUrl,
      isActive: reward.isActive,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }
}

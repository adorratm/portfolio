import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Experience } from '@modules/experience/entities/experience.entity';
import { UpsertExperienceDto } from '@modules/experience/dto/upsert-experience.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class ExperienceService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<Experience[]> {
    return this.em.find(Experience, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Experience[]> {
    return this.em.find(Experience, {
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertExperienceDto): Promise<Experience> {
    let row: Experience | null = null;

    if (dto.id) {
      row = await this.em.findOne(Experience, { where: { id: dto.id } });
    }

    if (!row) {
      row = this.em.create(Experience, {});
    }

    const { id: _id, ...data } = dto;
    Object.assign(row, data);
    return this.em.save(Experience, row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.em.findOne(Experience, { where: { id } });
    if (!row) throw new NotFoundException('Deneyim kaydı bulunamadı.');
    await this.em.remove(Experience, row);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EducationItem } from '@modules/education/entities/education-item.entity';
import { UpsertEducationDto } from '@modules/education/dto/upsert-education.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class EducationService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<EducationItem[]> {
    return this.em.find(EducationItem, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<EducationItem[]> {
    return this.em.find(EducationItem, {
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertEducationDto): Promise<EducationItem> {
    let row: EducationItem | null = null;

    if (dto.id) {
      row = await this.em.findOne(EducationItem, { where: { id: dto.id } });
    }

    if (!row) {
      row = this.em.create(EducationItem, {});
    }

    const { id: _id, ...data } = dto;
    Object.assign(row, data);
    return this.em.save(EducationItem, row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.em.findOne(EducationItem, { where: { id } });
    if (!row) throw new NotFoundException('Eğitim kaydı bulunamadı.');
    await this.em.remove(EducationItem, row);
  }
}

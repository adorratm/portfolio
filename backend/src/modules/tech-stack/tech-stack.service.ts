import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { UpsertTechStackDto } from '@modules/tech-stack/dto/upsert-tech-stack.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class TechStackService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<TechStackItem[]> {
    return this.em.find(TechStackItem, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAll(): Promise<TechStackItem[]> {
    return this.em.find(TechStackItem, { order: { sortOrder: 'ASC' } });
  }

  async upsert(dto: UpsertTechStackDto): Promise<TechStackItem> {
    let item: TechStackItem | null = null;
    if (dto.id) {
      item = await this.em.findOne(TechStackItem, { where: { id: dto.id } });
    }
    if (!item) item = this.em.create(TechStackItem, {});
    const { id: _id, ...data } = dto;
    Object.assign(item, data);
    return this.em.save(TechStackItem, item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.em.findOne(TechStackItem, { where: { id } });
    if (!item) throw new NotFoundException('Teknoloji öğesi bulunamadı.');
    await this.em.remove(TechStackItem, item);
  }
}

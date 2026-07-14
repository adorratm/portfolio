import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { isUuid, slugify } from '@common/utils/slugify';
import type { Locale } from '@common/types/locale';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { UpsertTechStackDto } from '@modules/tech-stack/dto/upsert-tech-stack.dto';

@Injectable()
export class TechStackService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<TechStackItem[]> {
    return this.em.find(TechStackItem, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findPublicByIdOrSlug(
    locale: Locale,
    idOrSlug: string,
  ): Promise<TechStackItem> {
    const where = isUuid(idOrSlug)
      ? { id: idOrSlug, locale, isPublished: true as const }
      : { slug: idOrSlug, locale, isPublished: true as const };

    const item = await this.em.findOne(TechStackItem, { where });
    if (!item) throw new NotFoundException('Teknoloji öğesi bulunamadı.');
    return item;
  }

  /** @deprecated Use findPublicByIdOrSlug */
  async findPublicById(locale: Locale, id: string): Promise<TechStackItem> {
    return this.findPublicByIdOrSlug(locale, id);
  }

  async findAll(): Promise<TechStackItem[]> {
    return this.em.find(TechStackItem, { order: { sortOrder: 'ASC' } });
  }

  private async ensureUniqueSlug(
    locale: Locale,
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = baseSlug || 'tech';
    let n = 2;
    for (;;) {
      const existing = await this.em.findOne(TechStackItem, {
        where: excludeId
          ? { locale, slug: candidate, id: Not(excludeId) }
          : { locale, slug: candidate },
      });
      if (!existing) return candidate;
      candidate = `${baseSlug}-${n}`;
      n += 1;
    }
  }

  async upsert(dto: UpsertTechStackDto): Promise<TechStackItem> {
    let item: TechStackItem | null = null;
    if (dto.id) {
      item = await this.em.findOne(TechStackItem, { where: { id: dto.id } });
    }
    if (!item) item = this.em.create(TechStackItem, {});

    const { id: _id, slug: slugInput, ...data } = dto;
    Object.assign(item, data);

    const baseSlug = slugify(slugInput?.trim() || dto.name);
    item.slug = await this.ensureUniqueSlug(
      dto.locale,
      baseSlug,
      item.id || undefined,
    );

    return this.em.save(TechStackItem, item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.em.findOne(TechStackItem, { where: { id } });
    if (!item) throw new NotFoundException('Teknoloji öğesi bulunamadı.');
    await this.em.remove(TechStackItem, item);
  }
}

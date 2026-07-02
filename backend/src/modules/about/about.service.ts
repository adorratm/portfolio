import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AboutContent } from '@modules/about/entities/about-content.entity';
import { UpsertAboutDto } from '@modules/about/dto/upsert-about.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class AboutService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findByLocale(locale: Locale): Promise<AboutContent | null> {
    return this.em.findOne(AboutContent, {
      where: { locale, isPublished: true },
    });
  }

  async findAll(): Promise<AboutContent[]> {
    return this.em.find(AboutContent, { order: { locale: 'ASC' } });
  }

  async upsert(dto: UpsertAboutDto): Promise<AboutContent> {
    let row = await this.em.findOne(AboutContent, {
      where: { locale: dto.locale },
    });

    if (!row) {
      row = this.em.create(AboutContent, { locale: dto.locale });
    }

    Object.assign(row, dto);
    return this.em.save(AboutContent, row);
  }

  async remove(locale: Locale): Promise<void> {
    const row = await this.em.findOne(AboutContent, { where: { locale } });
    if (!row) throw new NotFoundException('Hakkımda içeriği bulunamadı.');
    await this.em.remove(AboutContent, row);
  }
}

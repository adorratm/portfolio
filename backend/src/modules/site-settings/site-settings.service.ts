import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';
import { UpsertSiteSettingsDto } from '@modules/site-settings/dto/upsert-site-settings.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class SiteSettingsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findByLocale(locale: Locale): Promise<SiteSettings | null> {
    return this.em.findOne(SiteSettings, { where: { locale } });
  }

  async findAll(): Promise<SiteSettings[]> {
    return this.em.find(SiteSettings, { order: { locale: 'ASC' } });
  }

  async upsert(dto: UpsertSiteSettingsDto): Promise<SiteSettings> {
    let row = await this.em.findOne(SiteSettings, {
      where: { locale: dto.locale },
    });
    if (!row) row = this.em.create(SiteSettings, { locale: dto.locale });
    Object.assign(row, dto);
    return this.em.save(SiteSettings, row);
  }
}

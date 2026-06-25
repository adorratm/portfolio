import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UiTranslation } from '@modules/ui-translations/entities/ui-translation.entity';
import { UpsertUiTranslationDto } from '@modules/ui-translations/dto/upsert-ui-translation.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class UiTranslationsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findByLocale(locale: Locale): Promise<UiTranslation | null> {
    return this.em.findOne(UiTranslation, { where: { locale } });
  }

  async findAll(): Promise<UiTranslation[]> {
    return this.em.find(UiTranslation, { order: { locale: 'ASC' } });
  }

  async upsert(dto: UpsertUiTranslationDto): Promise<UiTranslation> {
    let row = await this.em.findOne(UiTranslation, {
      where: { locale: dto.locale },
    });
    if (!row) {
      row = this.em.create(UiTranslation, { locale: dto.locale });
    }
    if (dto.frontendLabels) row.frontendLabels = dto.frontendLabels;
    if (dto.adminLabels) row.adminLabels = dto.adminLabels;
    return this.em.save(UiTranslation, row);
  }
}

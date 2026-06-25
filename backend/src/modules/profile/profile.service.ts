import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ProfileContent } from '@modules/profile/entities/profile-content.entity';
import { UpsertProfileDto } from '@modules/profile/dto/upsert-profile.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class ProfileService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findByLocale(locale: Locale): Promise<ProfileContent | null> {
    return this.em.findOne(ProfileContent, {
      where: { locale, isPublished: true },
    });
  }

  async findAll(): Promise<ProfileContent[]> {
    return this.em.find(ProfileContent, { order: { locale: 'ASC' } });
  }

  async upsert(dto: UpsertProfileDto): Promise<ProfileContent> {
    let row = await this.em.findOne(ProfileContent, {
      where: { locale: dto.locale },
    });

    if (!row) {
      row = this.em.create(ProfileContent, { locale: dto.locale });
    }

    Object.assign(row, dto);
    return this.em.save(ProfileContent, row);
  }

  async remove(locale: Locale): Promise<void> {
    const row = await this.em.findOne(ProfileContent, { where: { locale } });
    if (!row) throw new NotFoundException('Profil bulunamadı.');
    await this.em.remove(ProfileContent, row);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Certification } from '@modules/certification/entities/certification.entity';
import { UpsertCertificationDto } from '@modules/certification/dto/upsert-certification.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class CertificationService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<Certification[]> {
    return this.em.find(Certification, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Certification[]> {
    return this.em.find(Certification, {
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertCertificationDto): Promise<Certification> {
    let row: Certification | null = null;

    if (dto.id) {
      row = await this.em.findOne(Certification, { where: { id: dto.id } });
    }

    if (!row) {
      row = this.em.create(Certification, {});
    }

    const { id: _id, ...data } = dto;
    Object.assign(row, data);
    return this.em.save(Certification, row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.em.findOne(Certification, { where: { id } });
    if (!row) throw new NotFoundException('Sertifika kaydı bulunamadı.');
    await this.em.remove(Certification, row);
  }
}

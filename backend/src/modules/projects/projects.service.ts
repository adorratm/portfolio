import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Project } from '@modules/projects/entities/project.entity';
import { UpsertProjectDto } from '@modules/projects/dto/upsert-project.dto';
import type { Locale } from '@common/types/locale';

@Injectable()
export class ProjectsService {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async findPublished(locale: Locale): Promise<Project[]> {
    return this.em.find(Project, {
      where: { locale, isPublished: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findFeatured(locale: Locale): Promise<Project[]> {
    return this.em.find(Project, {
      where: { locale, isPublished: true, isFeatured: true },
      order: { sortOrder: 'ASC' },
      take: 6,
    });
  }

  async findAll(): Promise<Project[]> {
    return this.em.find(Project, {
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertProjectDto): Promise<Project> {
    let project: Project | null = null;

    if (dto.id) {
      project = await this.em.findOne(Project, { where: { id: dto.id } });
    }

    if (!project) {
      project = this.em.create(Project, {});
    }

    const { id: _id, ...data } = dto;
    Object.assign(project, data);
    return this.em.save(Project, project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.em.findOne(Project, { where: { id } });
    if (!project) throw new NotFoundException('Proje bulunamadı.');
    await this.em.remove(Project, project);
  }
}

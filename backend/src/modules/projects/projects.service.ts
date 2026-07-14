import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Not } from 'typeorm';
import { isUuid, slugify } from '@common/utils/slugify';
import type { Locale } from '@common/types/locale';
import { Project } from '@modules/projects/entities/project.entity';
import { UpsertProjectDto } from '@modules/projects/dto/upsert-project.dto';

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

  async findPublicByIdOrSlug(locale: Locale, idOrSlug: string): Promise<Project> {
    const where = isUuid(idOrSlug)
      ? { id: idOrSlug, locale, isPublished: true as const }
      : { slug: idOrSlug, locale, isPublished: true as const };

    const project = await this.em.findOne(Project, { where });
    if (!project) throw new NotFoundException('Proje bulunamadı.');
    return project;
  }

  /** @deprecated Use findPublicByIdOrSlug */
  async findPublicById(locale: Locale, id: string): Promise<Project> {
    return this.findPublicByIdOrSlug(locale, id);
  }

  async findAll(): Promise<Project[]> {
    return this.em.find(Project, {
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  private async ensureUniqueSlug(
    locale: Locale,
    baseSlug: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = baseSlug || 'project';
    let n = 2;
    for (;;) {
      const existing = await this.em.findOne(Project, {
        where: excludeId
          ? { locale, slug: candidate, id: Not(excludeId) }
          : { locale, slug: candidate },
      });
      if (!existing) return candidate;
      candidate = `${baseSlug}-${n}`;
      n += 1;
    }
  }

  async upsert(dto: UpsertProjectDto): Promise<Project> {
    let project: Project | null = null;

    if (dto.id) {
      project = await this.em.findOne(Project, { where: { id: dto.id } });
    }

    if (!project) {
      project = this.em.create(Project, {});
    }

    const { id: _id, slug: slugInput, ...data } = dto;
    Object.assign(project, data);

    const baseSlug = slugify(slugInput?.trim() || dto.title);
    project.slug = await this.ensureUniqueSlug(
      dto.locale,
      baseSlug,
      project.id || undefined,
    );

    return this.em.save(Project, project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.em.findOne(Project, { where: { id } });
    if (!project) throw new NotFoundException('Proje bulunamadı.');
    await this.em.remove(Project, project);
  }
}

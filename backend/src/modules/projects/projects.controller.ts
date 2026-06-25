import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from '@modules/projects/projects.service';
import { UpsertProjectDto } from '@modules/projects/dto/upsert-project.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { Locale } from '@common/types/locale';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('public/:locale')
  findPublic(@Param('locale') locale: Locale) {
    return this.projectsService.findFeatured(locale);
  }

  @Get('public/:locale/all')
  findAllPublic(@Param('locale') locale: Locale) {
    return this.projectsService.findPublished(locale);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.projectsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  upsert(@Body() dto: UpsertProjectDto) {
    return this.projectsService.upsert(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}

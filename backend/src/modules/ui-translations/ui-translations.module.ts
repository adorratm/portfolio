import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UiTranslation } from '@modules/ui-translations/entities/ui-translation.entity';
import { UiTranslationsService } from '@modules/ui-translations/ui-translations.service';
import { UiTranslationsController } from '@modules/ui-translations/ui-translations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UiTranslation])],
  controllers: [UiTranslationsController],
  providers: [UiTranslationsService],
  exports: [UiTranslationsService],
})
export class UiTranslationsModule {}

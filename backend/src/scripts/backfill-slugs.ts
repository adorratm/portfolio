/**
 * Prod (synchronize=false) için slug kolonu + backfill + TR nav remap.
 * Kullanım: yarn backfill:slugs
 */
import { DataSource } from 'typeorm';
import { slugify } from '@common/utils/slugify';
import { Project } from '@modules/projects/entities/project.entity';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';

function env(key: string, fallback = ''): string {
  const raw = process.env[key] ?? fallback;
  return raw.replace(/^["']|["']$/g, '').trim();
}

async function ensureSlugColumn(
  ds: DataSource,
  table: string,
): Promise<void> {
  await ds.query(`
    ALTER TABLE "${table}"
    ADD COLUMN IF NOT EXISTS "slug" character varying
  `);
}

async function ensureUniqueIndex(
  ds: DataSource,
  table: string,
  indexName: string,
): Promise<void> {
  await ds.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "${indexName}"
    ON "${table}" ("locale", "slug")
  `);
}

async function backfillTable(
  ds: DataSource,
  entity: typeof Project | typeof TechStackItem,
  sourceField: 'title' | 'name',
): Promise<number> {
  const rows = await ds.getRepository(entity).find();
  let updated = 0;
  const used = new Map<string, Set<string>>();

  for (const row of rows) {
    const locale = (row as { locale: string }).locale;
    if (!used.has(locale)) used.set(locale, new Set());
    const set = used.get(locale)!;

    const current = (row as { slug?: string }).slug;
    if (current) {
      set.add(current);
      continue;
    }

    const source = String(
      (row as unknown as Record<string, unknown>)[sourceField] ?? '',
    );
    const base = slugify(source);
    let candidate = base;
    let n = 2;
    while (set.has(candidate)) {
      candidate = `${base}-${n}`;
      n += 1;
    }
    set.add(candidate);
    (row as { slug: string }).slug = candidate;
    await ds.getRepository(entity).save(row);
    updated += 1;
  }
  return updated;
}

async function remapTrNav(ds: DataSource): Promise<void> {
  const remap: Record<string, string> = {
    '/tr/about': '/tr/hakkimda',
    '/tr/experience': '/tr/deneyim',
    '/tr/education': '/tr/egitim',
    '/tr/tech-stack': '/tr/teknoloji-yigini',
    '/tr/projects': '/tr/projeler',
  };

  const settingsList = await ds.getRepository(SiteSettings).find({
    where: { locale: 'tr' },
  });

  for (const settings of settingsList) {
    if (!settings.navItems?.length) continue;
    let changed = false;
    settings.navItems = settings.navItems.map((item) => {
      const href = remap[item.href] ?? item.href;
      if (href !== item.href) changed = true;
      return { ...item, href };
    });
    if (changed) {
      await ds.getRepository(SiteSettings).save(settings);
      console.log('TR navItems güncellendi.');
    }
  }
}

async function main(): Promise<void> {
  const ds = new DataSource({
    type: 'postgres',
    host: env('DATABASE_HOST', 'localhost'),
    port: parseInt(env('DATABASE_PORT', '6432'), 10),
    username: env('DATABASE_USER', 'portfolio'),
    password: env('DATABASE_PASSWORD', 'portfolio_dev'),
    database: env('DATABASE_NAME', 'portfolio'),
    entities: [Project, TechStackItem, SiteSettings],
    synchronize: false,
  });

  await ds.initialize();
  console.log('Slug kolonları ekleniyor...');
  await ensureSlugColumn(ds, 'projects');
  await ensureSlugColumn(ds, 'tech_stack_items');

  console.log('Slug backfill...');
  const p = await backfillTable(ds, Project, 'title');
  const t = await backfillTable(ds, TechStackItem, 'name');
  console.log(`Projects: ${p} güncellendi, Tech stack: ${t} güncellendi`);

  // NOT NULL + unique index (boş slug kalmamalı)
  await ds.query(`UPDATE "projects" SET "slug" = 'project-' || "id" WHERE "slug" IS NULL OR "slug" = ''`);
  await ds.query(
    `UPDATE "tech_stack_items" SET "slug" = 'tech-' || "id" WHERE "slug" IS NULL OR "slug" = ''`,
  );
  await ds.query(`ALTER TABLE "projects" ALTER COLUMN "slug" SET NOT NULL`);
  await ds.query(
    `ALTER TABLE "tech_stack_items" ALTER COLUMN "slug" SET NOT NULL`,
  );
  await ensureUniqueIndex(ds, 'projects', 'IDX_projects_locale_slug');
  await ensureUniqueIndex(
    ds,
    'tech_stack_items',
    'IDX_tech_stack_items_locale_slug',
  );

  await remapTrNav(ds);
  await ds.destroy();
  console.log('Tamam.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

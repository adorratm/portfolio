/**
 * TR locale CMS verisini okuyup EN kayıtlarını oluşturur/günceller.
 * Kullanım: yarn translate:en
 */
import { DataSource, EntityManager } from 'typeorm';
import { ProfileContent } from '@modules/profile/entities/profile-content.entity';
import { AboutContent } from '@modules/about/entities/about-content.entity';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';
import { Project } from '@modules/projects/entities/project.entity';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { Experience } from '@modules/experience/entities/experience.entity';
import { EducationItem } from '@modules/education/entities/education-item.entity';
import { Certification } from '@modules/certification/entities/certification.entity';
import { UiTranslation } from '@modules/ui-translations/entities/ui-translation.entity';

function env(key: string, fallback = ''): string {
  const raw = process.env[key] ?? fallback;
  return raw.replace(/^["']|["']$/g, '').trim();
}

const STATIC_TRANSLATIONS: Record<string, string> = {
  'Ana Sayfa': 'Home',
  Hakkımda: 'About',
  Deneyim: 'Experience',
  Eğitim: 'Education',
  'Teknoloji Yığını': 'Tech Stack',
  Projeler: 'Projects',
  'Teknik Felsefe': 'Technical Philosophy',
  'Önce Ölçeklenebilirlik': 'Scalability First',
  'Gözlemlenebilirlik Odaklı': 'Observability Driven',
  'Yönetilen Dağıtım': 'Managed Deployments',
  'Çalışma Süresi Hedefi': 'Uptime Target',
  'Canlı Sistemler': 'Live Systems',
  'Tüm Depoları Görüntüle': 'View All Repositories',
  'Dracula ekosistemi tutkusuyla tasarlandı.':
    'Designed with love for the Dracula ecosystem.',
  'Sunucuya Ping At (İletişim)': 'Ping Server (Contact)',
  'Tam Zamanlı': 'Full-time',
  'Yarı Zamanlı': 'Part-time',
  Uzaktan: 'Remote',
  'İzmir, Türkiye': 'Izmir, Turkey',
  Kullanıcı: 'User',
  Rol: 'Role',
  Konum: 'Location',
  Kabuk: 'Shell',
  Teknolojiler: 'Technologies',
  'Yıl Deneyim': 'Years of Experience',
  'Yönetilen Servis': 'Managed Services',
  'Çalışma Süresi': 'Uptime',
  'Özgeçmişi İndir (PDF)': 'Download Resume (PDF)',
  'Dağıtık Sistemler': 'Distributed Systems',
  'API & Backend': 'API & Backend',
  'Bulut & DevOps': 'Cloud & DevOps',
  Gözlemlenebilirlik: 'Observability',
  Veritabanı: 'Database',
  Altyapı: 'Infrastructure',
  'AI Mimarisi': 'AI Architecture',
  'Öğrenme aşamasındayım.': 'Currently learning.',
  'Projelerdeki birinci tercihimdir.': 'My first choice in projects.',
  'Projelerde kullanmayı tercih ettiğim 1 numaralı veritabanı.':
    'My go-to database in projects.',
  'Olmazsa olmaz :)': 'Essential :)',
  'Olmazsa olmaz...': 'Essential...',
  'İçerik yükleniyor...': 'Loading content...',
  'İçerik bulunamadı.': 'Content not found.',
  Lisans: "Bachelor's Degree",
  Önlisans: "Associate's Degree",
  Lise: 'High School',
  '"Doğru İş İçin Doğru Araç" ilkesine inanıyorum. Hedef her zaman sağlam ve sürdürülebilir bir mimaridir.':
    'I believe in the right tool for the right job. The goal is always a solid, sustainable architecture.',
};

const MONTH_MAP: Record<string, string> = {
  Ocak: 'January',
  Şubat: 'February',
  Mart: 'March',
  Nisan: 'April',
  Mayıs: 'May',
  Haziran: 'June',
  Temmuz: 'July',
  Ağustos: 'August',
  Eylül: 'September',
  Ekim: 'October',
  Kasım: 'November',
  Aralık: 'December',
  Günümüz: 'Present',
};

const translationCache = new Map<string, string>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function replaceMonths(text: string): string {
  let result = text;
  for (const [tr, en] of Object.entries(MONTH_MAP)) {
    result = result.replaceAll(tr, en);
  }
  result = result.replaceAll('Türkiye', 'Turkey');
  return result;
}

async function callTranslateApi(text: string): Promise<string> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', 'tr|en');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Çeviri API hatası: ${response.status}`);
  }

  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
  };
  const translated = data.responseData?.translatedText?.trim();
  if (!translated) {
    throw new Error('Boş çeviri yanıtı');
  }
  return translated;
}

async function translateText(text: string): Promise<string> {
  if (!text?.trim()) return text;

  const cached = translationCache.get(text);
  if (cached) return cached;

  const staticHit = STATIC_TRANSLATIONS[text];
  if (staticHit) {
    translationCache.set(text, staticHit);
    return staticHit;
  }

  if (text.length <= 450) {
    await sleep(350);
    const translated = replaceMonths(await callTranslateApi(text));
    translationCache.set(text, translated);
    return translated;
  }

  const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const parts: string[] = [];
  let buffer = '';

  for (const chunk of chunks) {
    if ((buffer + chunk).length > 450 && buffer) {
      await sleep(350);
      parts.push(replaceMonths(await callTranslateApi(buffer.trim())));
      buffer = chunk;
    } else {
      buffer += chunk;
    }
  }

  if (buffer.trim()) {
    await sleep(350);
    parts.push(replaceMonths(await callTranslateApi(buffer.trim())));
  }

  const result = parts.join(' ').replace(/\s+/g, ' ').trim();
  translationCache.set(text, result);
  return result;
}

async function translateArray(values: string[]): Promise<string[]> {
  return Promise.all(values.map((value) => translateText(value)));
}

async function translateLabels(
  labels: Record<string, string>,
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    Object.entries(labels).map(async ([key, value]) => [
      key,
      await translateText(value),
    ]),
  );
  return Object.fromEntries(entries);
}

function localizeHref(href: string): string {
  return href.replace(/^\/tr(\/|$)/, '/en$1');
}

function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: env('DATABASE_HOST', 'localhost'),
    port: parseInt(env('DATABASE_PORT', '6432'), 10),
    username: env('DATABASE_USER', 'portfolio'),
    password: env('DATABASE_PASSWORD', 'portfolio_dev'),
    database: env('DATABASE_NAME', 'portfolio'),
    entities: [
      ProfileContent,
      AboutContent,
      SiteSettings,
      Project,
      TechStackItem,
      Experience,
      EducationItem,
      Certification,
      UiTranslation,
    ],
    synchronize: false,
  });
}

async function upsertProfile(
  em: EntityManager,
  tr: ProfileContent,
): Promise<void> {
  let row = await em.findOne(ProfileContent, { where: { locale: 'en' } });
  if (!row) row = em.create(ProfileContent, { locale: 'en' });

  row.badgeText = tr.badgeText;
  row.headlinePrefix = tr.headlinePrefix;
  row.headlineHighlight = tr.headlineHighlight;
  row.bio = await translateText(tr.bio);
  row.terminalLines = await Promise.all(
    tr.terminalLines.map(async (line) => ({
      ...line,
      label: await translateText(line.label),
      value:
        line.label === 'Konum' ? 'Izmir, Turkey' : await translateText(line.value),
    })),
  );
  row.imageKey = tr.imageKey;
  row.imageUrl = tr.imageUrl;
  row.isPublished = tr.isPublished;
  await em.save(ProfileContent, row);
}

async function upsertAbout(em: EntityManager, tr: AboutContent): Promise<void> {
  let row = await em.findOne(AboutContent, { where: { locale: 'en' } });
  if (!row) row = em.create(AboutContent, { locale: 'en' });

  row.headline = await translateText(tr.headline);
  row.subtitle = tr.subtitle ? await translateText(tr.subtitle) : null;
  row.summary = await translateText(tr.summary);
  row.expertiseAreas = await Promise.all(
    tr.expertiseAreas.map(async (area) => ({
      ...area,
      title: await translateText(area.title),
      description: await translateText(area.description),
    })),
  );
  row.skillGroups = await Promise.all(
    tr.skillGroups.map(async (group) => ({
      category: await translateText(group.category),
      skills: group.skills,
    })),
  );
  row.highlights = await Promise.all(
    tr.highlights.map(async (item) => ({
      label: await translateText(item.label),
      value: item.value,
    })),
  );
  row.resumeUrl = tr.resumeUrl;
  row.resumeLabel = tr.resumeLabel ? await translateText(tr.resumeLabel) : null;
  row.imageKey = tr.imageKey;
  row.imageUrl = tr.imageUrl;
  row.isPublished = tr.isPublished;
  await em.save(AboutContent, row);
}

async function upsertSiteSettings(
  em: EntityManager,
  tr: SiteSettings,
): Promise<void> {
  let row = await em.findOne(SiteSettings, { where: { locale: 'en' } });
  if (!row) row = em.create(SiteSettings, { locale: 'en' });

  row.siteTitle = tr.siteTitle.replace('@Portfolyo', '@Portfolio');
  row.brandName = tr.brandName.replace('@Portfolyo', '@Portfolio');
  row.brandSubtitle = tr.brandSubtitle;
  row.navItems = await Promise.all(
    tr.navItems.map(async (item) => ({
      ...item,
      href: localizeHref(item.href),
      label: await translateText(item.label),
    })),
  );
  row.philosophyTitle = tr.philosophyTitle
    ? await translateText(tr.philosophyTitle)
    : null;
  row.philosophyBody = tr.philosophyBody
    ? await translateText(tr.philosophyBody)
    : null;
  row.philosophyPillars = tr.philosophyPillars
    ? await Promise.all(
        tr.philosophyPillars.map(async (pillar) => ({
          ...pillar,
          label: await translateText(pillar.label),
        })),
      )
    : null;
  row.statDeployments = tr.statDeployments;
  row.statUptime = tr.statUptime;
  row.statDeploymentsLabel = tr.statDeploymentsLabel
    ? await translateText(tr.statDeploymentsLabel)
    : null;
  row.statUptimeLabel = tr.statUptimeLabel
    ? await translateText(tr.statUptimeLabel)
    : null;
  row.projectsSectionTitle = tr.projectsSectionTitle
    ? await translateText(tr.projectsSectionTitle)
    : null;
  row.projectsViewAllLabel = tr.projectsViewAllLabel
    ? await translateText(tr.projectsViewAllLabel)
    : null;
  row.footerTagline = tr.footerTagline
    ? await translateText(tr.footerTagline)
    : null;
  row.socialLinks = tr.socialLinks;
  row.contactFabLabel = tr.contactFabLabel
    ? await translateText(tr.contactFabLabel)
    : null;
  row.contactFabUrl = tr.contactFabUrl;
  await em.save(SiteSettings, row);
}

async function upsertUiTranslation(
  em: EntityManager,
  tr: UiTranslation,
): Promise<void> {
  let row = await em.findOne(UiTranslation, { where: { locale: 'en' } });
  if (!row) row = em.create(UiTranslation, { locale: 'en' });

  row.frontendLabels = await translateLabels(tr.frontendLabels);
  row.adminLabels = await translateLabels(tr.adminLabels);
  await em.save(UiTranslation, row);
}

async function main(): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();
  const em = dataSource.manager;

  try {
    console.log('Mevcut EN liste kayıtları temizleniyor...');
    await em.delete(Experience, { locale: 'en' });
    await em.delete(EducationItem, { locale: 'en' });
    await em.delete(Certification, { locale: 'en' });
    await em.delete(TechStackItem, { locale: 'en' });
    await em.delete(Project, { locale: 'en' });

    const trProfile = await em.findOne(ProfileContent, {
      where: { locale: 'tr' },
    });
    if (trProfile) {
      console.log('Profil çevriliyor...');
      await upsertProfile(em, trProfile);
    }

    const trAbout = await em.findOne(AboutContent, { where: { locale: 'tr' } });
    if (trAbout) {
      console.log('Hakkımda çevriliyor...');
      await upsertAbout(em, trAbout);
    }

    const trSiteSettings = await em.findOne(SiteSettings, {
      where: { locale: 'tr' },
    });
    if (trSiteSettings) {
      console.log('Site ayarları çevriliyor...');
      await upsertSiteSettings(em, trSiteSettings);
    }

    const trProjects = await em.find(Project, {
      where: { locale: 'tr' },
      order: { sortOrder: 'ASC' },
    });
    console.log(`${trProjects.length} proje çevriliyor...`);
    for (const project of trProjects) {
      await em.save(Project, {
        locale: 'en',
        title: project.title,
        description: await translateText(project.description),
        category: await translateText(project.category),
        technologies: project.technologies,
        imageKey: project.imageKey,
        imageUrl: project.imageUrl,
        externalUrl: project.externalUrl,
        endpoint: project.endpoint,
        status: project.status,
        sortOrder: project.sortOrder,
        isFeatured: project.isFeatured,
        isPublished: project.isPublished,
      });
    }

    const trTechStack = await em.find(TechStackItem, {
      where: { locale: 'tr' },
      order: { sortOrder: 'ASC' },
    });
    console.log(`${trTechStack.length} tech stack öğesi çevriliyor...`);
    for (const item of trTechStack) {
      await em.save(TechStackItem, {
        locale: 'en',
        name: item.name,
        description: item.description
          ? await translateText(item.description)
          : null,
        category: item.category,
        iconName: item.iconName,
        imageKey: item.imageKey,
        imageUrl: item.imageUrl,
        proficiencyLevel: item.proficiencyLevel,
        yearsExperience: item.yearsExperience,
        sortOrder: item.sortOrder,
        isPublished: item.isPublished,
      });
    }

    const trExperiences = await em.find(Experience, {
      where: { locale: 'tr' },
      order: { sortOrder: 'ASC' },
    });
    console.log(`${trExperiences.length} deneyim kaydı çevriliyor...`);
    for (const experience of trExperiences) {
      await em.save(Experience, {
        locale: 'en',
        company: experience.company,
        role: experience.role,
        employmentType: experience.employmentType
          ? await translateText(experience.employmentType)
          : null,
        location: experience.location
          ? await translateText(experience.location)
          : null,
        period: await translateText(experience.period),
        description: experience.description
          ? await translateText(experience.description)
          : null,
        highlights: experience.highlights?.length
          ? await translateArray(experience.highlights)
          : [],
        technologies: experience.technologies,
        isCurrent: experience.isCurrent,
        sortOrder: experience.sortOrder,
        isPublished: experience.isPublished,
      });
    }

    const trEducation = await em.find(EducationItem, {
      where: { locale: 'tr' },
      order: { sortOrder: 'ASC' },
    });
    console.log(`${trEducation.length} eğitim kaydı çevriliyor...`);
    for (const item of trEducation) {
      await em.save(EducationItem, {
        locale: 'en',
        institution: await translateText(item.institution),
        degree: await translateText(item.degree),
        field: await translateText(item.field),
        period: item.period,
        description: item.description
          ? await translateText(item.description)
          : null,
        sortOrder: item.sortOrder,
        isPublished: item.isPublished,
      });
    }

    const trCertifications = await em.find(Certification, {
      where: { locale: 'tr' },
      order: { sortOrder: 'ASC' },
    });
    console.log(`${trCertifications.length} sertifika kaydı çevriliyor...`);
    for (const cert of trCertifications) {
      await em.save(Certification, {
        locale: 'en',
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        description: cert.description
          ? await translateText(cert.description)
          : null,
        credentialUrl: cert.credentialUrl,
        sortOrder: cert.sortOrder,
        isPublished: cert.isPublished,
      });
    }

    const trUi = await em.findOne(UiTranslation, { where: { locale: 'tr' } });
    if (trUi) {
      console.log('UI çevirileri güncelleniyor...');
      await upsertUiTranslation(em, trUi);
    }

    console.log('Tamamlandı: TR verileri EN locale olarak kaydedildi.');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Çeviri scripti başarısız:', error);
  process.exit(1);
});

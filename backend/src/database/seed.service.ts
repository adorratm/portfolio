import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { slugify } from '@common/utils/slugify';
import { ProfileContent } from '@modules/profile/entities/profile-content.entity';
import { Project } from '@modules/projects/entities/project.entity';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';
import { TechStackItem } from '@modules/tech-stack/entities/tech-stack-item.entity';
import { UiTranslation } from '@modules/ui-translations/entities/ui-translation.entity';
import { AboutContent } from '@modules/about/entities/about-content.entity';
import { Experience } from '@modules/experience/entities/experience.entity';
import { EducationItem } from '@modules/education/entities/education-item.entity';
import { Certification } from '@modules/certification/entities/certification.entity';

/**
 * Geliştirme ortamı için örnek CMS verisi.
 * Stitch tasarımındaki Emre Kılıç içeriğinden türetilmiştir.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async onModuleInit(): Promise<void> {
    try {
      if ((await this.em.count(ProfileContent)) === 0) {
        this.logger.log('Örnek CMS verisi ekleniyor...');
        await this.seedCms();
      }
      if ((await this.em.count(UiTranslation)) === 0) {
        this.logger.log('UI çevirileri ekleniyor...');
        await this.seedUiTranslations();
      }
      if ((await this.em.count(AboutContent)) === 0) {
        this.logger.log('CV / özgeçmiş içeriği ekleniyor...');
        await this.seedCv();
      }
      await this.ensureLocalizedNavHrefs();
      await this.ensureContentSlugs();
    } catch (error) {
      this.logger.error(
        'Seed atlanamadı — veritabanı şeması hazır mı? DATABASE_SYNCHRONIZE=true kontrol edin.',
        error,
      );
    }
  }

  private async seedCms(): Promise<void> {
    await this.em.save(ProfileContent, [
      {
        locale: 'tr',
        badgeText: 'Backend Mühendisi | Sistem Mimarı',
        headlinePrefix: 'Emre Kılıç:',
        headlineHighlight: 'Ölçeklenebilir Backend Mimarileri',
        bio: 'Gözlemlenebilirlik, dayanıklılık ve teknik borç yönetimine odaklanarak yüksek performanslı dağıtık sistemler tasarlıyorum.',
        terminalLines: [
          { label: 'Kullanıcı', value: 'Emre Kılıç' },
          { label: 'Rol', value: 'Backend Mimarı' },
          { label: 'Konum', value: 'İzmir, Türkiye' },
          { label: 'GitHub', value: 'adorratm', link: 'https://github.com/adorratm' },
          { label: 'Kabuk', value: 'zsh 5.8.1' },
          { label: 'Teknolojiler', value: 'Go, Node.js, Rust, Docker, K8s' },
        ],
      },
      {
        locale: 'en',
        badgeText: 'Backend Engineer | System Architect',
        headlinePrefix: 'Emre Kılıç:',
        headlineHighlight: 'Scalable Backend Architectures',
        bio: 'I design high-performance distributed systems focused on observability, resilience, and technical debt management.',
        terminalLines: [
          { label: 'User', value: 'Emre Kılıç' },
          { label: 'Role', value: 'Backend Architect' },
          { label: 'Location', value: 'Izmir, Turkey' },
          { label: 'GitHub', value: 'adorratm', link: 'https://github.com/adorratm' },
        ],
      },
    ]);

    await this.em.save(SiteSettings, [
      {
        locale: 'tr',
        siteTitle: 'Emre Kılıç | Backend Mimarı',
        brandName: 'Root@Portfolyo',
        brandSubtitle: 'Backend Mimarı',
        navItems: [
          { label: 'Ana Sayfa', href: '/tr' },
          { label: 'Hakkımda', href: '/tr/hakkimda' },
          { label: 'Deneyim', href: '/tr/deneyim' },
          { label: 'Eğitim', href: '/tr/egitim' },
          { label: 'Teknoloji Yığını', href: '/tr/teknoloji-yigini' },
          { label: 'Projeler', href: '/tr/projeler' },
        ],
        philosophyTitle: 'Teknik Felsefe',
        philosophyBody:
          '"Doğru İş İçin Doğru Araç" ilkesine inanıyorum. Hedef her zaman sağlam ve sürdürülebilir bir mimaridir.',
        philosophyPillars: [
          { label: 'Önce Ölçeklenebilirlik', color: 'green' },
          { label: 'Gözlemlenebilirlik Odaklı', color: 'cyan' },
        ],
        statDeployments: '50+',
        statUptime: '99.9%',
        statDeploymentsLabel: 'Yönetilen Dağıtım',
        statUptimeLabel: 'Çalışma Süresi Hedefi',
        projectsSectionTitle: 'Canlı Sistemler',
        projectsViewAllLabel: 'Tüm Depoları Görüntüle',
        footerTagline: 'Dracula ekosistemi tutkusuyla tasarlandı.',
        contactFabLabel: 'Sunucuya Ping At (İletişim)',
        socialLinks: [],
      },
      {
        locale: 'en',
        siteTitle: 'Emre Kılıç | Backend Architect',
        brandName: 'Root@Portfolio',
        brandSubtitle: 'Backend Architect',
        navItems: [
          { label: 'Home', href: '/en' },
          { label: 'About', href: '/en/about' },
          { label: 'Experience', href: '/en/experience' },
          { label: 'Education', href: '/en/education' },
          { label: 'Tech Stack', href: '/en/tech-stack' },
          { label: 'Projects', href: '/en/projects' },
        ],
        philosophyTitle: 'Technical Philosophy',
        philosophyBody:
          'I believe in the right tool for the right job. The goal is always a solid, sustainable architecture.',
        statDeployments: '50+',
        statUptime: '99.9%',
        statDeploymentsLabel: 'Managed Deployments',
        statUptimeLabel: 'Uptime Target',
        projectsSectionTitle: 'Live Systems',
        projectsViewAllLabel: 'View All Repositories',
        footerTagline: 'Designed with love for the Dracula ecosystem.',
        contactFabLabel: 'Ping Server (Contact)',
        socialLinks: [],
      },
    ]);

    await this.em.save(Project, [
      {
        locale: 'tr',
        slug: 'cartech-ai',
        title: 'Cartech AI',
        description:
          'Filo yönetimi için akıllı teşhis motoru. Dağıtık mikroservisler ile gerçek zamanlı sensör verisi işleme.',
        category: 'AI Mimarisi',
        technologies: ['Go', 'gRPC', 'PostgreSQL'],
        status: 'active',
        sortOrder: 1,
        isFeatured: true,
      },
      {
        locale: 'tr',
        slug: 'logexpo',
        title: 'LogExpo',
        description:
          'Merkezi loglama ve gözlemlenebilirlik hattı. Terabaytlarca log için saniye altı sorgu gecikmesi.',
        category: 'Altyapı',
        technologies: ['Rust', 'ClickHouse', 'Redis'],
        status: 'active',
        sortOrder: 2,
        isFeatured: true,
      },
      {
        locale: 'en',
        slug: 'cartech-ai',
        title: 'Cartech AI',
        description:
          'Intelligent diagnostics engine for fleet management. Distributed microservices processing real-time sensor data.',
        category: 'AI Architecture',
        technologies: ['Go', 'gRPC', 'PostgreSQL'],
        status: 'active',
        sortOrder: 1,
        isFeatured: true,
      },
      {
        locale: 'en',
        slug: 'logexpo',
        title: 'LogExpo',
        description:
          'Centralized logging and observability pipeline. Sub-second query latency for terabytes of log data.',
        category: 'Infrastructure',
        technologies: ['Rust', 'ClickHouse', 'Redis'],
        status: 'active',
        sortOrder: 2,
        isFeatured: true,
      },
    ]);

    await this.em.save(TechStackItem, [
      { locale: 'tr', slug: 'nestjs', name: 'NestJS', category: 'Backend', proficiencyLevel: 90, sortOrder: 1 },
      { locale: 'tr', slug: 'postgresql', name: 'PostgreSQL', category: 'Database', proficiencyLevel: 85, sortOrder: 2 },
      { locale: 'tr', slug: 'redis', name: 'Redis', category: 'Cache', proficiencyLevel: 80, sortOrder: 3 },
      { locale: 'en', slug: 'nestjs', name: 'NestJS', category: 'Backend', proficiencyLevel: 90, sortOrder: 1 },
      { locale: 'en', slug: 'postgresql', name: 'PostgreSQL', category: 'Database', proficiencyLevel: 85, sortOrder: 2 },
      { locale: 'en', slug: 'redis', name: 'Redis', category: 'Cache', proficiencyLevel: 80, sortOrder: 3 },
    ]);
  }

  /**
   * Hakkımda / deneyim / eğitim / sertifika örnek verisi.
   * Ayrıca mevcut kurulumlarda site ayarlarındaki nav öğelerine
   * CV linklerini idempotent şekilde ekler.
   */
  private async seedCv(): Promise<void> {
    await this.em.save(AboutContent, [
      {
        locale: 'tr',
        headline: 'Merhaba, ben Emre Kılıç',
        subtitle: 'Backend Mühendisi & Sistem Mimarı',
        summary:
          'Sekiz yılı aşkın süredir yüksek trafikli dağıtık sistemler tasarlıyor ve ölçekliyorum. Odağım; gözlemlenebilirlik, dayanıklılık ve teknik borcu kontrol altında tutan sürdürülebilir mimariler kurmak. Karmaşık problemleri sade, test edilebilir ve bakımı kolay çözümlere indirgemekten keyif alıyorum.',
        expertiseAreas: [
          {
            title: 'Dağıtık Sistemler',
            description:
              'Mikroservis mimarileri, olay güdümlü tasarım, mesaj kuyrukları ve yüksek erişilebilirlik desenleri.',
            icon: '◈',
          },
          {
            title: 'API & Backend',
            description:
              'REST/gRPC servisleri, kimlik doğrulama, hız sınırlama ve performans optimizasyonu.',
            icon: '◉',
          },
          {
            title: 'Bulut & DevOps',
            description:
              'Docker, Kubernetes, CI/CD hatları ve altyapının kod olarak yönetimi.',
            icon: '☁',
          },
          {
            title: 'Gözlemlenebilirlik',
            description:
              'Merkezi loglama, metrik toplama, dağıtık izleme ve uyarı sistemleri.',
            icon: '◎',
          },
        ],
        skillGroups: [
          { category: 'Diller', skills: ['Go', 'TypeScript', 'Rust', 'Python', 'SQL'] },
          { category: 'Backend', skills: ['NestJS', 'Node.js', 'gRPC', 'GraphQL'] },
          { category: 'Veri', skills: ['PostgreSQL', 'Redis', 'ClickHouse', 'Kafka'] },
          { category: 'Altyapı', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'] },
        ],
        highlights: [
          { label: 'Yıl Deneyim', value: '8+' },
          { label: 'Yönetilen Servis', value: '30+' },
          { label: 'Çalışma Süresi', value: '99.9%' },
        ],
        resumeLabel: 'Özgeçmişi İndir (PDF)',
        resumeUrl: null,
      },
      {
        locale: 'en',
        headline: "Hi, I'm Emre Kılıç",
        subtitle: 'Backend Engineer & System Architect',
        summary:
          'For over eight years I have designed and scaled high-traffic distributed systems. My focus is building sustainable architectures with strong observability and resilience while keeping technical debt in check. I enjoy reducing complex problems into simple, testable and maintainable solutions.',
        expertiseAreas: [
          {
            title: 'Distributed Systems',
            description:
              'Microservice architectures, event-driven design, message queues and high-availability patterns.',
            icon: '◈',
          },
          {
            title: 'API & Backend',
            description:
              'REST/gRPC services, authentication, rate limiting and performance optimization.',
            icon: '◉',
          },
          {
            title: 'Cloud & DevOps',
            description:
              'Docker, Kubernetes, CI/CD pipelines and infrastructure as code.',
            icon: '☁',
          },
          {
            title: 'Observability',
            description:
              'Centralized logging, metrics collection, distributed tracing and alerting.',
            icon: '◎',
          },
        ],
        skillGroups: [
          { category: 'Languages', skills: ['Go', 'TypeScript', 'Rust', 'Python', 'SQL'] },
          { category: 'Backend', skills: ['NestJS', 'Node.js', 'gRPC', 'GraphQL'] },
          { category: 'Data', skills: ['PostgreSQL', 'Redis', 'ClickHouse', 'Kafka'] },
          { category: 'Infrastructure', skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS'] },
        ],
        highlights: [
          { label: 'Years of Experience', value: '8+' },
          { label: 'Managed Services', value: '30+' },
          { label: 'Uptime', value: '99.9%' },
        ],
        resumeLabel: 'Download Resume (PDF)',
        resumeUrl: null,
      },
    ]);

    await this.em.save(Experience, [
      {
        locale: 'tr',
        company: 'Cartech',
        role: 'Kıdemli Backend Mühendisi',
        employmentType: 'Tam Zamanlı',
        location: 'İzmir, Türkiye',
        period: '2021 — Günümüz',
        description:
          'Filo yönetimi platformunun backend mimarisinden sorumluyum; gerçek zamanlı telemetri ve teşhis servislerini ölçekliyorum.',
        highlights: [
          'Gerçek zamanlı sensör verisi işleyen olay güdümlü mimariyi tasarladım (günde 2M+ olay).',
          'API yanıt sürelerini %40 azalttım; önbellekleme ve sorgu optimizasyonu.',
          'Gözlemlenebilirlik altyapısını kurdum; ortalama arıza tespit süresini yarıya indirdim.',
        ],
        technologies: ['Go', 'gRPC', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        isCurrent: true,
        sortOrder: 1,
      },
      {
        locale: 'tr',
        company: 'LogExpo',
        role: 'Backend Mühendisi',
        employmentType: 'Tam Zamanlı',
        location: 'Uzaktan',
        period: '2018 — 2021',
        description:
          'Merkezi loglama ve gözlemlenebilirlik platformunun çekirdek servislerini geliştirdim.',
        highlights: [
          'Terabaytlarca log için saniye altı sorgu gecikmesi sağlayan hattı geliştirdim.',
          'Çok kiracılı (multi-tenant) veri izolasyon katmanını tasarladım.',
        ],
        technologies: ['Rust', 'ClickHouse', 'Redis', 'Docker'],
        isCurrent: false,
        sortOrder: 2,
      },
      {
        locale: 'en',
        company: 'Cartech',
        role: 'Senior Backend Engineer',
        employmentType: 'Full-time',
        location: 'Izmir, Turkey',
        period: '2021 — Present',
        description:
          'Responsible for the backend architecture of a fleet management platform, scaling real-time telemetry and diagnostics services.',
        highlights: [
          'Designed the event-driven architecture processing real-time sensor data (2M+ events/day).',
          'Reduced API response times by 40% through caching and query optimization.',
          'Built the observability stack, cutting mean time to detection in half.',
        ],
        technologies: ['Go', 'gRPC', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        isCurrent: true,
        sortOrder: 1,
      },
      {
        locale: 'en',
        company: 'LogExpo',
        role: 'Backend Engineer',
        employmentType: 'Full-time',
        location: 'Remote',
        period: '2018 — 2021',
        description:
          'Developed the core services of a centralized logging and observability platform.',
        highlights: [
          'Built the pipeline delivering sub-second query latency for terabytes of logs.',
          'Designed the multi-tenant data isolation layer.',
        ],
        technologies: ['Rust', 'ClickHouse', 'Redis', 'Docker'],
        isCurrent: false,
        sortOrder: 2,
      },
    ]);

    await this.em.save(EducationItem, [
      {
        locale: 'tr',
        institution: 'Ege Üniversitesi',
        degree: 'Bilgisayar Mühendisliği, Lisans',
        field: 'Bilgisayar Mühendisliği',
        period: '2014 — 2018',
        description:
          'Dağıtık sistemler ve veritabanı mimarisi üzerine yoğunlaştım. Mezuniyet projesi: dağıtık iş kuyruğu motoru.',
        sortOrder: 1,
      },
      {
        locale: 'en',
        institution: 'Ege University',
        degree: 'B.Sc. in Computer Engineering',
        field: 'Computer Engineering',
        period: '2014 — 2018',
        description:
          'Focused on distributed systems and database architecture. Graduation project: a distributed job queue engine.',
        sortOrder: 1,
      },
    ]);

    await this.em.save(Certification, [
      {
        locale: 'tr',
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        issueDate: '2023',
        description: 'Kubernetes küme yönetimi ve operasyon yetkinliği.',
        sortOrder: 1,
      },
      {
        locale: 'tr',
        name: 'AWS Certified Solutions Architect — Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2022',
        description: 'Bulut mimarisi tasarımı ve en iyi uygulamalar.',
        sortOrder: 2,
      },
      {
        locale: 'en',
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        issueDate: '2023',
        description: 'Kubernetes cluster administration and operations.',
        sortOrder: 1,
      },
      {
        locale: 'en',
        name: 'AWS Certified Solutions Architect — Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2022',
        description: 'Cloud architecture design and best practices.',
        sortOrder: 2,
      },
    ]);

    await this.ensureCvNavItems();
  }

  /** Mevcut site ayarlarına CV nav linklerini ekler (yoksa). */
  private async ensureCvNavItems(): Promise<void> {
    const cvNav: Record<'tr' | 'en', Array<{ label: string; href: string }>> = {
      tr: [
        { label: 'Hakkımda', href: '/tr/hakkimda' },
        { label: 'Deneyim', href: '/tr/deneyim' },
        { label: 'Eğitim', href: '/tr/egitim' },
      ],
      en: [
        { label: 'About', href: '/en/about' },
        { label: 'Experience', href: '/en/experience' },
        { label: 'Education', href: '/en/education' },
      ],
    };

    const allSettings = await this.em.find(SiteSettings);
    for (const settings of allSettings) {
      const locale = settings.locale as 'tr' | 'en';
      const links = cvNav[locale];
      if (!links) continue;

      const existing = settings.navItems ?? [];
      const existingHrefs = new Set(existing.map((i) => i.href));
      const missing = links.filter((l) => !existingHrefs.has(l.href));
      if (missing.length === 0) continue;

      // "Ana Sayfa" linkinden hemen sonra ekle, yoksa başa koy.
      const homeHref = `/${locale}`;
      const homeIndex = existing.findIndex((i) => i.href === homeHref);
      const insertAt = homeIndex >= 0 ? homeIndex + 1 : 0;
      const next = [...existing];
      next.splice(insertAt, 0, ...missing);
      settings.navItems = next;
      await this.em.save(SiteSettings, settings);
    }
  }

  /** Eski İngilizce TR nav href'lerini yerelleştirilmiş path'lere taşır. */
  private async ensureLocalizedNavHrefs(): Promise<void> {
    const remap: Record<string, string> = {
      '/tr/about': '/tr/hakkimda',
      '/tr/experience': '/tr/deneyim',
      '/tr/education': '/tr/egitim',
      '/tr/tech-stack': '/tr/teknoloji-yigini',
      '/tr/projects': '/tr/projeler',
    };

    const allSettings = await this.em.find(SiteSettings);
    for (const settings of allSettings) {
      if (settings.locale !== 'tr' || !settings.navItems?.length) continue;
      let changed = false;
      const next = settings.navItems.map((item) => {
        const href = remap[item.href] ?? item.href;
        if (href !== item.href) changed = true;
        return { ...item, href };
      });
      if (!changed) continue;
      settings.navItems = next;
      await this.em.save(SiteSettings, settings);
      this.logger.log('TR navItems yerelleştirilmiş path\'lere güncellendi.');
    }
  }

  /** Eksik slug alanlarını title/name üzerinden doldurur (nullable kolon sonrası boot). */
  private async ensureContentSlugs(): Promise<void> {
    try {
      let projectCount = 0;
      const projects = await this.em.find(Project);
      for (const project of projects) {
        if (project.slug?.trim()) continue;
        const base = slugify(project.title) || `project-${project.id}`;
        let candidate = base;
        let n = 2;
        for (;;) {
          const clash = await this.em.findOne(Project, {
            where: { locale: project.locale, slug: candidate },
          });
          if (!clash || clash.id === project.id) break;
          candidate = `${base}-${n}`;
          n += 1;
        }
        project.slug = candidate;
        await this.em.save(Project, project);
        projectCount += 1;
      }

      let techCount = 0;
      const items = await this.em.find(TechStackItem);
      for (const item of items) {
        if (item.slug?.trim()) continue;
        const base = slugify(item.name) || `tech-${item.id}`;
        let candidate = base;
        let n = 2;
        for (;;) {
          const clash = await this.em.findOne(TechStackItem, {
            where: { locale: item.locale, slug: candidate },
          });
          if (!clash || clash.id === item.id) break;
          candidate = `${base}-${n}`;
          n += 1;
        }
        item.slug = candidate;
        await this.em.save(TechStackItem, item);
        techCount += 1;
      }

      if (projectCount || techCount) {
        this.logger.log(
          `Slug backfill: ${projectCount} proje, ${techCount} tech-stack.`,
        );
      }
    } catch (error) {
      this.logger.warn(
        'Slug backfill atlandı (slug kolonu henüz yok olabilir). yarn backfill:slugs çalıştırın.',
      );
      this.logger.debug(String(error));
    }
  }

  private async seedUiTranslations(): Promise<void> {
    await this.em.save(UiTranslation, [
      {
        locale: 'tr',
        frontendLabels: {
          'hero.loading': 'İçerik yükleniyor...',
          'common.notFound': 'İçerik bulunamadı.',
        },
        adminLabels: {
          'login.title': 'Root@Portfolyo Admin',
          'login.subtitle':
            'Google hesabınızla giriş yapın. Sadece yetkili e-posta erişebilir.',
          'login.googleButton': 'Google ile Giriş Yap',
          'auth.callback': 'Oturum açılıyor...',
          'dashboard.title': 'Yönetici Paneli',
          'dashboard.subtitle':
            'Gerçek zamanlı sistem sağlığı ve içerik yönetimi.',
          'dashboard.cmsTitle': 'CMS Modülleri',
          'metrics.cpu': 'CPU KULLANIMI',
          'metrics.ram': 'RAM KULLANIMI',
          'metrics.uptime': 'ÇALIŞMA SÜRESİ',
          'metrics.normalRange': 'Normal Aralık',
          'metrics.sla': 'SLA: 99.9%',
          'metrics.total': 'Toplam',
          'locale.switch': 'Dil',
          'nav.dashboard': 'Panel',
          'nav.profile': 'Profil / Hero',
          'nav.siteSettings': 'Site Ayarları',
          'nav.projects': 'Projeler',
          'nav.techStack': 'Tech Stack',
          'nav.about': 'Hakkımda',
          'nav.experience': 'Deneyim',
          'nav.education': 'Eğitim',
          'nav.certifications': 'Sertifikalar',
          'nav.login': 'Giriş',
          'nav.logout': 'Çıkış',
        },
      },
      {
        locale: 'en',
        frontendLabels: {
          'hero.loading': 'Loading content...',
          'common.notFound': 'Content not found.',
        },
        adminLabels: {
          'login.title': 'Root@Portfolio Admin',
          'login.subtitle':
            'Sign in with Google. Only authorized email can access.',
          'login.googleButton': 'Sign in with Google',
          'auth.callback': 'Signing in...',
          'dashboard.title': 'Admin Dashboard',
          'dashboard.subtitle':
            'Real-time system health and content management.',
          'dashboard.cmsTitle': 'CMS Modules',
          'metrics.cpu': 'CPU UTILIZATION',
          'metrics.ram': 'RAM USAGE',
          'metrics.uptime': 'UPTIME',
          'metrics.normalRange': 'Normal Range',
          'metrics.sla': 'SLA: 99.9%',
          'metrics.total': 'Total',
          'locale.switch': 'Language',
          'nav.dashboard': 'Dashboard',
          'nav.profile': 'Profile / Hero',
          'nav.siteSettings': 'Site Settings',
          'nav.projects': 'Projects',
          'nav.techStack': 'Tech Stack',
          'nav.about': 'About',
          'nav.experience': 'Experience',
          'nav.education': 'Education',
          'nav.certifications': 'Certifications',
          'nav.login': 'Login',
          'nav.logout': 'Logout',
        },
      },
    ]);
  }
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ProfileContent } from '@modules/profile/entities/profile-content.entity';
import { Project } from '@modules/projects/entities/project.entity';
import { SiteSettings } from '@modules/site-settings/entities/site-settings.entity';
import { UiTranslation } from '@modules/ui-translations/entities/ui-translation.entity';

/**
 * Geliştirme ortamı için örnek CMS verisi.
 * Stitch tasarımındaki Emre Kılıç içeriğinden türetilmiştir.
 */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectEntityManager() private readonly em: EntityManager) {}

  async onModuleInit(): Promise<void> {
    if ((await this.em.count(ProfileContent)) === 0) {
      this.logger.log('Örnek CMS verisi ekleniyor...');
      await this.seedCms();
    }
    if ((await this.em.count(UiTranslation)) === 0) {
      this.logger.log('UI çevirileri ekleniyor...');
      await this.seedUiTranslations();
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
          { label: 'Teknoloji Yığını', href: '/tr/tech-stack' },
          { label: 'Projeler', href: '/tr/projects' },
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
        },
      },
    ]);
  }
}

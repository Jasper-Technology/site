import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Jasper',
  tagline: 'Open-source chemical process simulation',
  favicon: 'img/favicon.ico',
  url: 'https://jaspertech.org',
  baseUrl: '/docs/',
  organizationName: 'Jasper-Technology',
  projectName: 'opensource',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/',
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Jasper-Technology/opensource/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Jasper',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Jasper-Technology/opensource',
          position: 'left',
          className: 'navbar-github-link',
          'aria-label': 'GitHub',
        },
        {
          type: 'search',
          position: 'left',
        },
        {
          href: 'https://jaspertech.org',
          label: 'Launch App',
          position: 'right',
          className: 'navbar-launch-button',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/' },
            { label: 'Thermodynamics', to: '/thermodynamics/overview' },
            { label: 'Unit Operations', to: '/unit-operations/feed' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/Jasper-Technology/opensource' },
            { label: 'Main Site', href: 'https://jaspertech.org' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jasper Technology. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

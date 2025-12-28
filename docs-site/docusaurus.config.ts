import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Hydration Codex',
  tagline: 'Living documentation for the Hydration Protocol ecosystem',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://codex.hydration.net',
  baseUrl: '/',

  organizationName: 'galacticcouncil',
  projectName: 'hydration-codex',

  onBrokenLinks: 'warn', // Use 'warn' during development, 'throw' for production

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Enable Mermaid diagrams
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Docs at root instead of /docs/
          editUrl: 'https://github.com/galacticcouncil/hydration-codex/tree/main/docs-site/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 10,
        searchBarShortcutHint: false,
      },
    ],
  ],

  themeConfig: {
    image: 'img/hydration-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    navbar: {
      title: 'Hydration Codex',
      logo: {
        alt: 'Hydration Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'referenceSidebar',
          position: 'left',
          label: 'Reference',
        },
        {
          type: 'docSidebar',
          sidebarId: 'aiSidebar',
          position: 'left',
          label: 'AI & Agents',
        },
        {
          href: 'https://github.com/galacticcouncil/hydration-codex',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Reference', to: '/reference'},
            {label: 'AI & Agents', to: '/ai'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {label: 'Hydration App', href: 'https://app.hydration.net'},
            {label: 'Hydration Protocol', href: 'https://hydration.net'},
            {label: 'GitHub', href: 'https://github.com/galacticcouncil'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'Discord', href: 'https://discord.gg/hydration'},
            {label: 'Twitter', href: 'https://twitter.com/hydaboracle'},
          ],
        },
      ],
      copyright: `Auto-generated from source code. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'toml', 'bash', 'graphql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['getting-started/quickstart'],
    },
    {
      type: 'category',
      label: 'Thermodynamics',
      collapsed: false,
      items: [
        'thermodynamics/overview',
        'thermodynamics/heat-capacity',
        'thermodynamics/vle',
      ],
    },
    {
      type: 'category',
      label: 'Unit Operations',
      collapsed: false,
      items: [
        'unit-operations/feed',
        'unit-operations/mixer-splitter',
        'unit-operations/heater-cooler',
        'unit-operations/flash',
        'unit-operations/pump-compressor',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      collapsed: true,
      items: ['components/database'],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: true,
      items: ['api/schema'],
    },
    {
      type: 'category',
      label: 'Contributing',
      collapsed: true,
      items: ['contributing/development'],
    },
  ],
};

export default sidebars;

import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  brandTitle: 'ヘルパーシステム UI',
  brandUrl: '/',
  brandTarget: '_self',

  // UI
  colorPrimary: '#3182CE',
  colorSecondary: '#4299E1',

  // Typography
  fontBase: '"Noto Sans JP", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: '#1A202C',
  textInverseColor: 'rgba(255, 255, 255, 0.9)',

  // Toolbar default and active colors
  barTextColor: '#1A202C',
  barSelectedColor: '#3182CE',
  barBg: '#F7FAFC',

  // Form colors
  inputBg: 'white',
  inputBorder: '#E2E8F0',
  inputTextColor: '#1A202C',
  inputBorderRadius: 4,
});

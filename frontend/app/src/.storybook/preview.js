import { AllProviders } from '../src/test-utils/providers';
import theme from './theme';
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/700.css';
import '../src/styles/reset.css';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#F7FAFC',
        },
        {
          name: 'dark',
          value: '#1A202C',
        },
      ],
    },
    options: {
      storySort: {
        order: ['イントロダクション', 'コンポーネント', ['原子', '分子', '有機体'], 'フィーチャー'],
      },
    },
    docs: {
      theme: theme,
    },
  },
  decorators: [
    (Story) => (
      <AllProviders>
        <Story />
      </AllProviders>
    ),
  ],
};

export default preview;

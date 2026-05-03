import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  globalStyles: path.join(__dirname, './src/styles/index.css'),
  title: 'Richmond Study',
  icon: '/study-icon.svg',
  base: '/rspress-blog/',
  logo: {
    light: '/study-light-logo.svg',
    dark: '/study-dark-logo.svg',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/web-infra-dev/rspress',
      },
    ],
  },
  // builderConfig: {
  //   output: {
  //     assetPrefix: 'https://cdn.com/',
  //   },
  // },
});

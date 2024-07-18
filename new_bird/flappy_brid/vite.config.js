import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: [
      // Add this regex if you have files with .js extension but contain JSX
      /\.js$/,
      /\.jsx$/,
    ],
    // Add this if you need to target specific folders
    // exclude: [],
  },
});

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  // Icons used via dynamic :class bindings — static scanner can't detect these
  safelist: [
    'i-ph-sun-duotone',
    'i-ph-moon-duotone',
    'i-ph-device-mobile-duotone',
    'i-ph-shooting-star-duotone',
  ],
  shortcuts: [
    [
      'btn',
      'px-5 py-2 rounded-full inline-block text-white cursor-pointer disabled:cursor-default disabled:opacity-50',
    ],
    [
      'icon-btn',
      'text-[0.9em] inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 !outline-none',
    ],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    presetWebFonts({
      fonts: {
        sans: 'Manrope:400,500,600,700',
        serif: 'Newsreader:300,400,500,600',
        display: 'Newsreader:400,500,600',
        mono: 'DM Mono',
      },
    }),
  ],
})

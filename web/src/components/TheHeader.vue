<template>
  <nav
    class="flex items-center justify-between px-6 py-3"
    :style="{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
    }"
  >
    <a href="/" class="flex items-center gap-2 text-lg no-underline" style="color: var(--color-text);">
      <div i-ph-bird-duotone text-xl />
      <span font-serif font-light>FeatherBase</span>
    </a>
    <button icon-btn @click="toggleDark()" style="color: var(--color-text-muted);">
      <div i-ph-sun-duotone dark:i-ph-moon-duotone />
    </button>
  </nav>
</template>

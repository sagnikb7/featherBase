<template>
  <nav class="flex justify-between gap-2 py-2 text-xl">
    <button icon-btn>
      <div i-ph-bird-duotone />
    </button>
    <span>
      FeatherBase
    </span>

    <button icon-btn @click="toggleDark()">
      <div i-ph-sun-duotone dark:i-ph-moon-duotone />
    </button>
  </nav>
</template>

<script setup>
defineProps({
  bird: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <a :href="`/bird/${bird.id}`" class="bird-card">
    <div class="bird-image">
      <img
        :src="bird.image?.url ?? '/no_image.png'"
        :alt="bird.name"
        loading="lazy"
        @error="$event.target.src = '/no_image.png'"
      />
    </div>
    <div class="bird-card-content overflow-hidden">
      <h3 class="mr-5 truncate text-2xl font-stretch-semi-expanded">
        {{ bird.name }}
      </h3>
      <p class="scientific-name">{{ bird.scientificName }}</p>
      <div class="card-arrow">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </a>
</template>

<style scoped>
.bird-card {
  display: block;
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 0;
  width: 320px;
  height: 335px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  background-color: var(--bg-color);
  color: var(--text-color);
  overflow: hidden;
  position: relative;
}

.bird-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 32px rgba(0, 122, 204, 0.3);
  border-color: var(--accent-color);
}

.bird-card:active {
  transform: translateY(-2px);
}

.bird-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background-color: #f5f5f5;
  position: relative;
}

.bird-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bird-card:hover .bird-image img {
  transform: scale(1.05);
}

.bird-card-content {
  padding: 20px;
  position: relative;
  height: calc(100% - 240px);
  display: flex;
  flex-direction: column;
  text-align: left;
}

.scientific-name {
  margin: 0;
  font-style: italic;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  flex-grow: 1;
  text-align: left;
}

.card-arrow {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  color: #999;
  transition:
    color 0.3s ease,
    background-color 0.3s ease,
    transform 0.3s ease;
}

.card-arrow svg {
  width: 20px;
  height: 20px;
}

.bird-card:hover .card-arrow {
  color: var(--accent-color);
  background-color: var(--accent-light);
  transform: translateX(2px);
}

.dark .bird-card {
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.dark .bird-card:hover {
  border-color: var(--accent-color);
  box-shadow: 0 8px 32px rgba(175, 224, 219, 0.2);
}

.dark .scientific-name {
  color: #aaa;
}

.dark .card-arrow {
  color: #666;
}

.dark .bird-card:hover .card-arrow {
  color: var(--accent-color);
  background-color: var(--accent-light);
}

.dark .bird-image {
  background-color: #2d2d2d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .bird-card {
    width: 100%;
    max-width: 300px;
    height: 335px;
  }

  .card-arrow {
    width: 36px;
    height: 36px;
    top: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .bird-card {
    max-width: 380px;
  }

  .bird-image {
    height: 220px;
  }

  .bird-card-content {
    padding: 16px;
    height: calc(100% - 220px);
  }

  .scientific-name {
    font-size: 13px;
  }

  .card-arrow {
    width: 32px;
    height: 32px;
    right: 12px;
  }
}
</style>

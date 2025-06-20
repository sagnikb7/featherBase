<script setup lang="ts" generic="T extends any, O extends any">
const TOTAL_BIRDS = 250;
const randomIndex = Math.round(Math.random() * TOTAL_BIRDS);

const router = useRouter();
router.push(`/bird/${randomIndex}`);
</script>

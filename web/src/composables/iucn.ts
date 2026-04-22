import type { Bird, IUCNStatus } from '~/types/common'

const STATUS_META: Record<IUCNStatus, { label: string, explanation: string }> = {
  EX: {
    label: 'Extinct',
    explanation: 'Extinct (EX): No known living individuals remain. The species has been lost permanently.',
  },
  EW: {
    label: 'Extinct in Wild',
    explanation: 'Extinct in the Wild (EW): Survives only in captivity or cultivation. No wild populations remain.',
  },
  CR: {
    label: 'Critically Endangered',
    explanation: 'Critically Endangered (CR): Faces an extremely high risk of extinction in the wild. May become extinct without immediate intervention.',
  },
  EN: {
    label: 'Endangered',
    explanation: 'Endangered (EN): Faces a very high risk of extinction in the wild. Immediate conservation action is needed.',
  },
  VU: {
    label: 'Vulnerable',
    explanation: 'Vulnerable (VU): Faces a high risk of extinction in the wild due to declining populations or habitat loss.',
  },
  NT: {
    label: 'Near Threatened',
    explanation: 'Near Threatened (NT): Close to qualifying for a threatened category in the near future.',
  },
  LC: {
    label: 'Least Concern',
    explanation: 'Least Concern (LC): Species is widespread and abundant. Not at risk of extinction in the near future.',
  },
}

export function useIucnStatus(bird: Ref<Bird | undefined>) {
  const iucnStatus = computed(() => {
    return (bird.value?.iucnStatus as IUCNStatus) || null
  })

  const iucnStatusLabel = computed(() => {
    if (!iucnStatus.value)
      return ''

    return STATUS_META[iucnStatus.value]?.label || ''
  })

  const iucnStatusExplanation = computed(() => {
    if (!iucnStatus.value) {
      return 'IUCN Status: It is an inventory of the global conservation status and extinction risk of biological species.'
    }
    return STATUS_META[iucnStatus.value]?.explanation || ''
  })

  const iucnChipClass = computed(() => {
    if (!iucnStatus.value)
      return 'iucn-chip--unknown'

    return `iucn-chip--${iucnStatus.value.toLowerCase()}`
  })

  return {
    iucnStatus,
    iucnStatusLabel,
    iucnStatusExplanation,
    iucnChipClass,
  }
}

import type { Bird } from '~/types/common'

type IucnStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR'

export function useIucnStatus(bird: Ref<Bird | undefined>) {
  const iucnStatusClasses = computed(() => {
    if (!bird.value?.iucnStatus) {
      return 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
    }

    const status = bird.value.iucnStatus as IucnStatus
    const classMap: Record<IucnStatus, string> = {
      LC: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      NT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      VU: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      EN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      CR: 'bg-red-700 text-white dark:bg-red-900 dark:text-red-100',
    }

    return (
      classMap[status]
      || 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
    )
  })

  const iucnStatusExplanation = computed(() => {
    if (!bird.value?.iucnStatus) {
      return 'IUCN Status: It is an inventory of the global conservation status and extinction risk of biological species.'
    }

    const status = bird.value.iucnStatus as IucnStatus
    const explanations: Record<IucnStatus, string> = {
      LC: 'Least Concern (LC): Species is widespread and abundant. Not at risk of extinction in the near future.',
      NT: 'Near Threatened (NT): Species is close to qualifying for or is likely to qualify for a threatened category in the near future.',
      VU: 'Vulnerable (VU): Species faces a high risk of extinction in the wild due to declining populations or habitat loss.',
      EN: 'Endangered (EN): Species faces a very high risk of extinction in the wild. Immediate conservation action is needed.',
      CR: 'Critically Endangered (CR): Species faces an extremely high risk of extinction in the wild. May become extinct without immediate intervention.',
    }

    return (
      explanations[status]
      || 'IUCN Status: Conservation status information is not available for this species.'
    )
  })

  return {
    iucnStatusClasses,
    iucnStatusExplanation,
  }
}

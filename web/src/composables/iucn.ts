import type { Bird } from '~/types/common'

type IucnStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR'

export function useIucnStatus(bird: Ref<Bird | undefined>) {
  const iucnStatusClasses = computed(() => {
    if (!bird.value?.iucnStatus) {
      return 'bg-gray-300 text-gray-800 dark:bg-slate-700 dark:text-gray-200'
    }

    const status = bird.value.iucnStatus as IucnStatus
    const classMap: Record<IucnStatus, string> = {
      LC: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
      NT: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
      VU: 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
      EN: 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200',
      CR: 'bg-red-600 text-white dark:bg-red-900 dark:text-red-100',
    }

    return (
      classMap[status]
      || 'bg-gray-300 text-gray-800 dark:bg-slate-700 dark:text-gray-200'
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
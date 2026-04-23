export type IUCNStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX'

export interface Bird {
  _id: string
  name: string
  scientificName: string
  serialNumber: number
  hash: string
  iucnStatus: string
  habitat: string[]
  distributionRangeSize: string
  bestSeenAt: string | string[]
  migrationStatus: string
  seasonalityInIndia?: string
  order: string
  family: string
  commonGroup: string
  rarity: number
  identification: string
  colors: string
  size: string
  sizeRange?: string
  lengthCm?: number
  weightG?: { min: number, max: number }
  wingspanCm?: { min: number, max: number }
  callDescription?: string
  juvenileDescription?: string
  similarSpecies?: string[]
  diet: string[]
  speciesCode?: string
  version?: string
  verification?: Record<string, unknown>
  created_at: string
  updated_at: string
  __v: number
  meta: Meta
};

export interface SingleBirdResponse {
  success: boolean
  data: Bird
}

export interface Meta {
  images: Image[]
}

export interface Image {
  file: string | null
  cdn: string | null
  tags: string[]
}

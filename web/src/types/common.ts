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
  bestSeenAt: string
  migrationStatus: string
  order: string
  family: string
  commonGroup: string
  rarity: number
  identification: string
  colors: string
  size: string
  sizeRange: string
  diet: string[]
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
  file: string
  url: string
  tags: string[]
}

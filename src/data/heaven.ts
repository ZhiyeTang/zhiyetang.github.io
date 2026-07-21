import footprintRecords from './footprints.json'

export type HeavenLanguage = 'en' | 'zh'

export type LocalizedText = Record<HeavenLanguage, string>

export type CredoEntry = {
  id: string
  label: LocalizedText
  text: LocalizedText
}

export type FootprintEntry = {
  id: string
  city: LocalizedText
  country: LocalizedText
  year: string
  role: LocalizedText
  description: LocalizedText
  image?: string
  imageAlt?: LocalizedText
  artifact?: LocalizedText
  coordinates: {
    latitude: number
    longitude: number
  }
  mapPosition: {
    x: number
    y: number
  }
}

type FootprintRecord = Omit<FootprintEntry, 'image'> & {
  imagePath: string
}

export const credo: CredoEntry[] = [
  {
    id: 'feeling',
    label: { en: 'CREDO', zh: 'CREDO' },
    text: {
      en: 'Technology should make people feel more, not less.',
      zh: '技术应当让人感受更多，而不是更少。',
    },
  },
  {
    id: 'curiosity',
    label: { en: 'CREDO', zh: 'CREDO' },
    text: {
      en: 'Curiosity is a form of devotion.',
      zh: '好奇心是一种虔诚。',
    },
  },
  {
    id: 'human',
    label: { en: 'CREDO', zh: 'CREDO' },
    text: {
      en: 'Make complicated things feel human.',
      zh: '让复杂的事物保有人性。',
    },
  },
  {
    id: 'uncertainty',
    label: { en: 'CREDO', zh: 'CREDO' },
    text: {
      en: 'Leave room for uncertainty.',
      zh: '为不确定性留出空间。',
    },
  },
]

// The JSON file is the editable source of truth for map entries. Keep an empty
// imagePath until a real photograph is available; the UI will render its
// undeveloped archival placeholder in that case.
const footprintData: FootprintRecord[] = footprintRecords

export const footprints: FootprintEntry[] = footprintData.map(({ imagePath, ...entry }) => ({
  ...entry,
  image: imagePath || undefined,
}))

export const heavenLabels = {
  pilgrimage: { en: 'Pilgrimage', zh: '行迹' },
  atlas: { en: 'Pilgrimage atlas', zh: '行迹地图册' },
  openPilgrimage: { en: 'Open the archive', zh: '打开行迹档案' },
  closePilgrimage: { en: 'Return to the church', zh: '返回教堂' },
  archiveInstructions: {
    en: 'Drag the photographs across the map',
    zh: '拖动照片，在地图上重新排列',
  },
} satisfies Record<string, LocalizedText>

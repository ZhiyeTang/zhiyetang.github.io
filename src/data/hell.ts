import records from './records.json'

import cocktailData from './hell-cocktails.json'

export type HellLanguage = 'en' | 'zh'

export type RecordSelection = {
  id: string
  artist: string
  title: string
  year: string
  image: string
  note: Record<HellLanguage, string>
}

export type CocktailSelection = {
  name: string
  base: Record<HellLanguage, string>
  ingredients: Record<HellLanguage, string>
  note: Record<HellLanguage, string>
}

// The JSON file is the editable source of truth for the record wall.
export const recordSelections: RecordSelection[] = records

export const cocktailSelections: CocktailSelection[] = cocktailData

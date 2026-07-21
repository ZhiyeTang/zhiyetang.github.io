export type RealmEffectsSnapshot = {
  progress: number
  pointerX: number
  pointerY: number
  pointerActive: number
  heavenActive: number
  heavenHovered: number
  heavenVisible: number
  heavenBeams: HeavenBeamGeometry[]
}

export type HeavenBeamGeometry = {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourceWidth: number
  targetWidth: number
}

const snapshot: RealmEffectsSnapshot = {
  progress: 0.5,
  pointerX: 0,
  pointerY: 0,
  pointerActive: 0,
  heavenActive: -1,
  heavenHovered: -1,
  heavenVisible: 0,
  heavenBeams: [],
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const getRealmEffectsSnapshot = () => snapshot

export const setRealmJourneyProgress = (progress: number) => {
  snapshot.progress = clamp01(progress)
}

export const setRealmPointer = (x: number, y: number, active: boolean) => {
  snapshot.pointerX = Math.max(-1, Math.min(1, x))
  snapshot.pointerY = Math.max(-1, Math.min(1, y))
  snapshot.pointerActive = active ? 1 : 0
}

export const setHeavenLightIntent = ({
  active,
  hovered,
  visible,
}: {
  active: number | null
  hovered: number | null
  visible: boolean
}) => {
  snapshot.heavenActive = active ?? -1
  snapshot.heavenHovered = hovered ?? -1
  snapshot.heavenVisible = visible ? 1 : 0
}

export const setHeavenBeamGeometry = (beams: HeavenBeamGeometry[]) => {
  snapshot.heavenBeams = beams
}

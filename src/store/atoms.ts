import { atom } from 'recoil'

export const crossfaderValueAtom = atom<number>({
  key: 'crossfaderValue',
  default: 50,
})

export const track1URLAtom = atom<string>({
  key: 'track1URL',
  default: '',
})

export const track2URLAtom = atom<string>({
  key: 'track2URL',
  default: '',
})

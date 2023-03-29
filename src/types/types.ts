export interface GestureEventType {
  nativeEvent: { translationX: number; translationY: number };
}

export interface Coordinate {
  x: number;
  y: number;
  emoji?: string;
}

export enum Direction {
  Right,
  Up,
  Left,
  Down,
}

export enum ChartColor {
  GREY = '#EDEEF1',
  GREEN = '#11C182',
  YELLOW = '#D7DB0E',
  RED = '#FF68DE',
}

export interface ChartPoint {
  x: number;
  y: number;
  comparator: string;
  isPlaceholder: boolean;
}

export interface CellDate {
  data: {
    type: 'prev-month' | 'current-month' | 'next-month',
    isSelected: boolean,
    day: string,
    date: Date,
  },
  class: string,
  label: string,
}

export interface CellMonth {
  label: string,
  dateList: Array<CellDate | null>,
}
import type { Dayjs } from 'dayjs';
import type { CalendarActionKind, CalendarViews } from './enums';
import type { TextStyle, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

export type DateType = string | number | Dayjs | Date | null | undefined;

export type ModeType = 'single' | 'range' | 'multiple' | 'wheel';

export type HeaderButtonPositions = 'around' | 'right' | 'left';

export type LocalState = {
  date: DateType;
  startDate: DateType;
  endDate: DateType;
  dates?: DateType[];
  calendarView: CalendarViews;
  currentDate: DateType; // used for latest state of calendar based on Month and Year
  currentYear: number;
};

export type CalendarAction = {
  type: CalendarActionKind;
  payload: any;
};

export type CalendarThemeProps = {
  format?: string;
  containerStyle?: ViewStyle;
  headerButtonsPosition?: HeaderButtonPositions;
  headerContainerStyle?: ViewStyle;
  headerTextContainerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  headerButtonStyle?: ViewStyle;
  headerButtonColor?: string;
  headerButtonSize?: number;
  daysPanelStyle?: ViewStyle;
  dayContainerStyle?: ViewStyle;
  todayContainerStyle?: ViewStyle;
  todayTextStyle?: TextStyle;
  monthContainerStyle?: ViewStyle;
  yearContainerStyle?: ViewStyle;
  weekDaysContainerStyle?: ViewStyle;
  weekDaysTextStyle?: TextStyle;
  calendarTextStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  selectedItemColor?: string;
  wheelPickerContainerStyle?: ViewStyle;
  wheelPickerItemStyle?: ViewStyle;
  wheelPickerTextStyle?: TextStyle;
  wheelPickerSelectedIndicatorStyle?: ViewStyle;
  selectedRangeBackgroundColor?: string;
};

export type HeaderProps = {
  buttonPrevIcon?: ReactNode;
  buttonNextIcon?: ReactNode;
};

export interface IDayObject {
  text: string;
  day: number;
  date: string;
  disabled: boolean;
  isCurrentMonth: boolean;
  dayOfMonth?: number;
  inRange: boolean;
  leftCrop: boolean;
  rightCrop: boolean;
}

export type OrderedDateParts =
  'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

export type SingleChangeParams = {
  mode: 'single' | 'wheel';
  date: DateType;
};

export type RangeChangeParams = {
  mode: 'range';
  startDate: DateType;
  endDate: DateType;
};

export type MultiChangeParams = {
  mode: 'multiple';
  dates: DateType[];
  datePressed: DateType;
  change: 'added' | 'removed';
};

export type DatePickerChangeParams =
  SingleChangeParams | RangeChangeParams | MultiChangeParams;

// 各模式专用回调
export type SingleChange = (params: SingleChangeParams) => void;

export type RangeChange = (params: RangeChangeParams) => void;

export type MultiChange = (params: MultiChangeParams) => void;

// 一个函数统一处理所有模式
export type DatePickerChange = (params: DatePickerChangeParams) => void;

export interface DatePickerBaseProps {
  mode?: ModeType;
  locale?: string | ILocale;
  columns?: OrderedDateParts[];
  startYear?: number;
  endYear?: number;
  minDate?: DateType;
  maxDate?: DateType;
  firstDayOfWeek?: number;
  displayFullDays?: boolean;
  timePicker?: boolean;
  date?: DateType;
  dates?: DateType[];
  startDate?: DateType;
  endDate?: DateType;
  onChange?: DatePickerChange;
  initialView?: CalendarViews;
  height?: number;
}

export type PickerOption = {
  value: number | string;
  text: string;
};

/*
 * @Author: limit
 * @Date: 2024-07-17 05:09:59
 * @LastEditTime: 2025-08-07 16:31:49
 * @LastEditors: limit
 * @FilePath: /react-native-date-picker/src/enums.ts
 * @Description: 由limit创建！
 */
export type CalendarViews = 'day' | 'month' | 'year' | 'time';

export enum CalendarActionKind {
  SET_CALENDAR_VIEW = 'SET_CALENDAR_VIEW',
  CHANGE_CURRENT_DATE = 'CHANGE_CURRENT_DATE',
  CHANGE_CURRENT_YEAR = 'CHANGE_CURRENT_YEAR',
  CHANGE_SELECTED_DATE = 'CHANGE_SELECTED_DATE',
  CHANGE_SELECTED_RANGE = 'CHANGE_SELECTED_RANGE',
  CHANGE_SELECTED_MULTIPLE = 'CHANGE_SELECTED_MULTIPLE',
}

export const CONTAINER_HEIGHT = 300;
export const WEEKDAYS_HEIGHT = 25;

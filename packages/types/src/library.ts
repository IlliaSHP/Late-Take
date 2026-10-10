import type { LibraryEntryResponseStatus } from '@app/api'

export type TLibraryStatus = LibraryEntryResponseStatus

// Exclude — прибирає вказані варіанти з union
// Extract — залишає тільки вказані варіанти

// Exclude - виключаємо COMPLETED з union типів в TLibraryStatus
export type TActiveLibraryStatus = Exclude<TLibraryStatus, 'COMPLETED'>

// Залишаємо з union типу A тільки ті які є в B
// Extract замість union руками: тип виводиться з типу бекенду,
// тому статус, якого на бекенді немає (або його перейменували), сюди не потрапить
// і TS покаже помилку там, де він використовується
export type TNextLibraryStatus = Extract<
  TLibraryStatus,
  'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
>

export type TLibraryStatusAction = {
  label: string // текст кнопки
  nextStatus: TNextLibraryStatus //статус, який встановиться після натискання
}
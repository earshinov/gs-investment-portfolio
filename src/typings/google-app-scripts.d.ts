// https://developers.google.com/apps-script/guides/triggers/events

declare type TriggerEvent = TriggerOpenEvent | TriggerChangeEvent | TriggerEditEvent | TriggerFormSubmitEvent;

declare interface TriggerOpenEvent {
  // ...
}

declare interface TriggerChangeEvent {
  // ...
}

declare interface TriggerEditEvent {
  range: GoogleAppsScript.Spreadsheet.Range;
  value: unknown;
  oldValue: unknown;
  // ...
}

declare interface TriggerFormSubmitEvent {
  // ...
}

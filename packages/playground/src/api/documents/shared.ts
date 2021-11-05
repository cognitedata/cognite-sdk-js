import { CogniteInternalId } from '@cognite/sdk-core';

export interface ValueMissing {
  missing: boolean;
  equals?: never;
  in?: never;
}

export interface In<T> {
  in: T[];
  missing?: never;
  equals?: never;
}

export interface Equals<T> {
  equals: T;
  in?: never;
  missing?: never;
}

export interface EpochTimestampRange {
  max: number;
  min: number;
}

export interface ContainsAll<T> {
  containsAll: T[];
  containsAny?: never;
}

export interface ContainsAny<T> {
  containsAny: T[];
  containsAll?: never;
}

export interface Adder<T> {
  add: T;
  set?: never;
  remove?: never;
  modify?: never;
  setNull?: never;
}

export interface Remover<T> {
  remove: T;
  set?: never;
  add?: never;
  modify?: never;
  setNull?: never;
}

export interface Modifier<T> {
  modifier: T;
  remove?: never;
  add?: never;
  set?: never;
  setNull?: never;
}

export interface Setter<T> {
  set: T;
  remove?: never;
  add?: never;
  setNull?: never;
  modify?: never;
}

export interface NullSetter {
  setNull: boolean;
  set?: never;
  remove?: never;
  add?: never;
  modify?: never;
}

export type StringToStringArrayMap = {
  [key: string]: string[];
};

export type StringToStringMap = {
  [key: string]: string;
};

export type StringToAnyMap = {
  [key: string]: string;
};

export type DocumentId = CogniteInternalId;

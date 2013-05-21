interface DatabaseDefinition {
  name: string;
  version: number;
  autoIncrement: Boolean;
  collections?: any[];
  objectStores: any[];
}

interface ObjectStoreDefinition {
  database: any;
  keyPath?: string;
  name: string;
  indexes?: any[];
}

interface Window {
  IDBCursor: any;
  IDBTransaction: any;
  IDBKeyRange: any;
  IDBDatabase: any;
  IDBIndex: any;
  mozIndexedDB?: any;
  webkitIndexedDB?: any;
  webkitIDBTransaction?: any;
  webkitIDBKeyRange?: any;
  msIDBTransaction?: any;
  msIDBKeyRange?: any;
}

interface IDBOpenDBRequest {
  webkitErrorMessage?: any;
  onfailure?: any;
}

interface IDBFactory {
  webkitGetDatabaseNames?: any;
}

interface EventTarget {
  result?: any;
}

interface window {
  IDBKeyRange: any;
  msIDBTransaction: any;
}

interface Console {
  debug: Function;
  group: Function;
  groupEnd: Function;
}
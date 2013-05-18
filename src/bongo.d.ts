interface DatabaseDefinition {
  name: string;
  version: number;
  objectStores: any[];
}

interface ObjectStoreDefinition {
  database: any;
  keyPath?: string;
  name: string;
  indexes?: any[];
}

interface Window {
  IDBTransaction?: any;
  IDBKeyRange?: any;
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

interface EventTarget {
  result?: any;
}
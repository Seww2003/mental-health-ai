import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Activity_Key {
  id: UUIDString;
  __typename?: 'Activity_Key';
}

export interface CreateJournalEntryData {
  journalEntry_insert: JournalEntry_Key;
}

export interface CreateJournalEntryVariables {
  content: string;
  sentimentScore: number;
  moodLabel?: string | null;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  email: string;
  displayName?: string | null;
}

export interface EntryActivity_Key {
  id: UUIDString;
  __typename?: 'EntryActivity_Key';
}

export interface GetMyJournalEntriesData {
  journalEntries: ({
    content: string;
    sentimentScore: number;
    moodLabel?: string | null;
    createdAt: TimestampString;
  })[];
}

export interface JournalEntry_Key {
  id: UUIDString;
  __typename?: 'JournalEntry_Key';
}

export interface LogActivityData {
  entryActivity_insert: EntryActivity_Key;
}

export interface LogActivityVariables {
  journalEntryId: UUIDString;
  activityId: UUIDString;
}

export interface Suggestion_Key {
  id: UUIDString;
  __typename?: 'Suggestion_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface CreateJournalEntryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateJournalEntryVariables): MutationRef<CreateJournalEntryData, CreateJournalEntryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateJournalEntryVariables): MutationRef<CreateJournalEntryData, CreateJournalEntryVariables>;
  operationName: string;
}
export const createJournalEntryRef: CreateJournalEntryRef;

export function createJournalEntry(vars: CreateJournalEntryVariables): MutationPromise<CreateJournalEntryData, CreateJournalEntryVariables>;
export function createJournalEntry(dc: DataConnect, vars: CreateJournalEntryVariables): MutationPromise<CreateJournalEntryData, CreateJournalEntryVariables>;

interface GetMyJournalEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyJournalEntriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyJournalEntriesData, undefined>;
  operationName: string;
}
export const getMyJournalEntriesRef: GetMyJournalEntriesRef;

export function getMyJournalEntries(options?: ExecuteQueryOptions): QueryPromise<GetMyJournalEntriesData, undefined>;
export function getMyJournalEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyJournalEntriesData, undefined>;

interface LogActivityRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LogActivityVariables): MutationRef<LogActivityData, LogActivityVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LogActivityVariables): MutationRef<LogActivityData, LogActivityVariables>;
  operationName: string;
}
export const logActivityRef: LogActivityRef;

export function logActivity(vars: LogActivityVariables): MutationPromise<LogActivityData, LogActivityVariables>;
export function logActivity(dc: DataConnect, vars: LogActivityVariables): MutationPromise<LogActivityData, LogActivityVariables>;


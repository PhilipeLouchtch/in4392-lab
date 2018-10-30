import { CreateJobQuery } from './queries/CreateJobQuery';
import { JobStatusQuery } from './queries/JobStatusQuery';
import { JobDataQuery } from './queries/JobDataQuery';

export type QueryParams =
    CreateJobQuery
    | JobStatusQuery
    | JobDataQuery

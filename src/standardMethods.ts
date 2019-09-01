// Copyright 2019 Cognite AS

import { CogniteAsyncIterator } from './autoPagination';
import { ListResponse } from './types/types';

export type CursorAndAsyncIterator<T, Wrapper = T[]> = Promise<
  ListResponse<Wrapper>
> &
  CogniteAsyncIterator<T>;

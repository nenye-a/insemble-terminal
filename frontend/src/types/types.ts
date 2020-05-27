import { ReviewTag } from '../generated/globalTypes';

export type ResultQuery = {
  reviewTag: ReviewTag | null;
  type: string; // TODO: change to BE enum
};

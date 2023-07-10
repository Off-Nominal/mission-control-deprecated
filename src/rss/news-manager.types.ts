export interface NewsFeedDocument extends SanityDocument {
  url: string;
  name: string;
  filter?: string;
  thumbnail: string;
  diagnostic: string;
  category: string;
}

export type CmsNewsFeed = {
  data: NewsFeedDocument;
  watcher: any;
};

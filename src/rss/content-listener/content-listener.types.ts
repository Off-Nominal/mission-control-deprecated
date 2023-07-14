import { ContentFeedItem } from "../rss.types";
import Fuse from "fuse.js";

export type ContentListenerOptions = {
  processor?: (item: any, showTitle: string) => ContentFeedItem;
  searchOptions?: Fuse.IFuseOptions<ContentFeedItem>;
  token: string;
};

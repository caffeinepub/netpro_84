import { format, formatDistanceToNow, fromUnixTime } from "date-fns";
import { ConnStatus, PostType, ProfileVisibility } from "../backend";

export function fromNanoseconds(timestamp: bigint): Date {
  return fromUnixTime(Number(timestamp) / 1_000_000_000);
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(date: Date): string {
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatConnectionStatus(status: ConnStatus): string {
  switch (status) {
    case ConnStatus.Pending:
      return "Pending";
    case ConnStatus.Accepted:
      return "Accepted";
    case ConnStatus.Declined:
      return "Declined";
  }
}

export function formatPostType(postType: PostType): string {
  switch (postType) {
    case PostType.Article:
      return "Article";
    case PostType.Question:
      return "Question";
    case PostType.Insight:
      return "Insight";
  }
}

export function formatVisibility(v: ProfileVisibility): string {
  switch (v) {
    case ProfileVisibility.Public:
      return "Public";
    case ProfileVisibility.ConnectionsOnly:
      return "Connections Only";
  }
}

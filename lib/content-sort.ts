export type SortableBlogLike = {
  pinned: boolean;
  publishedAt: string;
};

export type SortableProjectLike = {
  pinned: boolean;
  title: string;
};

export function sortBlogLikeItems<T extends SortableBlogLike>(posts: T[]) {
  return [...posts].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return Number(right.pinned) - Number(left.pinned);
    }

    return right.publishedAt.localeCompare(left.publishedAt);
  });
}

export function sortProjectLikeItems<T extends SortableProjectLike>(projects: T[]) {
  return [...projects].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return Number(right.pinned) - Number(left.pinned);
    }

    return left.title.localeCompare(right.title);
  });
}

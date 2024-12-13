const paths = {
  home() {
    return "/";
  },
  topicShow(topicSlug: string) {
    return `/topics/${topicSlug}`;
  },
  postCreate(topicSlug: string) {
    return `/topics/${topicSlug}/posts/new`;
  },
  postShow(topicSlug: string, postId: number) {
    return `/topics/${topicSlug}/posts/${postId}`;
  },
  search(term: string) {
    return `/search?term=${term}`;
  },
};

export default paths;

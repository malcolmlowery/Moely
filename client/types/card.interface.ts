export interface CardI {
    post_id: string,
    is_post_owner: boolean,
    owner: PostOwnerI,
    username: string,
    profileImage: string | null,
    occupation: string | null,
    timestamp: string | null,
    text: string,
    post_liked: boolean,
    total_likes: number,
    total_comments: number,
    navigate_to_post?: () => void,
    navigate_to_profile?: () => void,
    query_update_post: (text: any) => Promise<any>,
    query_like_post: (post_liked: boolean) => void,
    query_delete_post: () => void,
    query_report_post: () => void,
    query_hide_post: () => void,
};

interface PostOwnerI {
    uid: string,
    username: string,
    profileImage: string | null,
    occupation: string | null,
}
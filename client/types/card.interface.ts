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
    number_of_post_likes: number,
    number_of_post_comments: number,
    navigate_to_post?: () => void,
    navigate_to_profile?: () => void,
    query_update_post: () => void,
    query_like_post: () => void,
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
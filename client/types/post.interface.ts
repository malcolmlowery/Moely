export interface PostI {
    post_id: string,
    created_at: number,
    text: string,
    total_likes: number,
    total_comments: number,
    owner: {
        uid: string,
        username: string,
        profile_image: string | null,
        occupation: string | null,
    },
};
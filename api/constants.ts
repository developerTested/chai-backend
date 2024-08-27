export const DB_NAME = "videoTube"
// Auth
export const USER_EXISTS = "Username or email already exists"
export const AUTH_FAILED = 'These credentials do not match our records.'
export const AUTH_PASS_FAIL = 'The provided password is incorrect.'
export const AUTH_REQUIRED = "Authentication required. Please log in to access this resource.";
export const AUTH_RATE_LIMIT = 'Too many login attempts. Please try again in :seconds seconds.'
// Uploads
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

// Tweets
export const TWEET_EXISTS = "Tweet already exists!"
export const TWEET_NOT_FOUND = "Tweet not found!"
export const TWEET_ID_MISSING = "Tweet id is missing!"

// Pagination
export const paginateLabels = {
    totalDocs: 'totalCount',
    docs: 'data',
    limit: 'perPage',
    page: 'currentPage',
    nextPage: 'next',
    prevPage: 'prev',
    totalPages: 'pageCount',
    hasPrevPage: 'hasPrev',
    hasNextPage: 'hasNext',
    pagingCounter: 'pageCounter',
};

export const paginateOptions = {
    page: 1,
    limit: 15,
    customLabels: paginateLabels
};

export const rtmpStreamUrl = "rtmp://localhost/live"
export const rtmpOutDir = "./public/video/";
export const rtmpMediaOutDir = "./public/media";

export const rtmpConfig = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        mediaroot: rtmpMediaOutDir,
        allow_origin: '*'
    },
};

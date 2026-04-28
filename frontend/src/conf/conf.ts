const IS_PRODUCTION = process.env.NODE_ENV === "production";

const ENV = {
    IS_PRODUCTION,
    API_BASE_URL: IS_PRODUCTION
        ? process.env.NEXT_PUBLIC_API_BASE_URL_PRODUCTION
        : process.env.NEXT_PUBLIC_API_BASE_URL_DEVELOPMENT,
};

export default ENV;
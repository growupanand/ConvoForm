/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/auth/register',
                permanent: false,
            },
        ]
    },
}

module.exports = nextConfig

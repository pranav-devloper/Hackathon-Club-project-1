// In-Memory store simulating MongoDB collection for sessions
let sessionStore = [];

export const sessionModel = {
    async create(data) {
        const doc = {
            _id: `ses-${Date.now()}`,
            user: data.user,
            refreshTokenHash: data.refreshTokenHash,
            ip: data.ip,
            userAgent: data.userAgent,
            revoked: false,
            createdAt: new Date(),
        };
        sessionStore.push(doc);
        return doc;
    },
    async updateMany(query, update) {
        sessionStore.forEach(s => {
            if (query.user && s.user === query.user) {
                if (update.revoked !== undefined) s.revoked = update.revoked;
            }
        });
        return { modifiedCount: 1 };
    }
};

export default sessionModel;

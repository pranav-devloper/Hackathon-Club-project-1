// In-Memory store simulating MongoDB collection for OTPs
let otpStore = [];

export const otpModel = {
    async create(data) {
        const doc = {
            _id: `otp-${Date.now()}`,
            email: data.email.toLowerCase(),
            user: data.user,
            otpHash: data.otpHash,
            createdAt: new Date(),
        };
        otpStore.push(doc);
        return doc;
    },
    async findOne(query) {
        return otpStore.find(o => {
            if (query.email && query.otpHash) {
                return o.email.toLowerCase() === query.email.toLowerCase() && o.otpHash === query.otpHash;
            }
            if (query.email) return o.email.toLowerCase() === query.email.toLowerCase();
            return false;
        }) || null;
    },
    async deleteMany(query) {
        if (query.user) {
            otpStore = otpStore.filter(o => o.user !== query.user);
        } else if (query.email) {
            otpStore = otpStore.filter(o => o.email.toLowerCase() !== query.email.toLowerCase());
        } else {
            otpStore = [];
        }
        return { deletedCount: 1 };
    }
};

export default otpModel;

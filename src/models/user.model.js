import { initialUsers } from '../data/mockData.js';
import bcrypt from 'bcryptjs';

// In-Memory store simulating MongoDB collection for users
let usersStore = [];

class Document {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = `usr-${Date.now()}`;
    }
    async save() {
        const existingIdx = usersStore.findIndex(u => u._id === this._id || u.email === this.email);
        if (existingIdx !== -1) {
            usersStore[existingIdx] = { ...usersStore[existingIdx], ...this };
        } else {
            usersStore.push(this);
        }
        return this;
    }
}

export const userModel = {
    async findOne(query) {
        return usersStore.find(u => {
            if (query.email) return u.email.toLowerCase() === query.email.toLowerCase();
            if (query.username) return u.username.toLowerCase() === query.username.toLowerCase();
            if (query._id) return u._id === query._id;
            return false;
        }) || null;
    },
    async findById(id) {
        return usersStore.find(u => u._id === id) || null;
    },
    async findByIdAndUpdate(id, update) {
        const user = usersStore.find(u => u._id === id);
        if (!user) return null;
        Object.assign(user, update);
        return { ...user };
    },
    async create(data) {
        const newUser = {
            _id: `usr-${Date.now()}`,
            username: data.username || data.email.split('@')[0],
            email: data.email.toLowerCase(),
            password: data.password,
            verified: data.verified ?? false,
        };
        usersStore.push(newUser);
        return { ...newUser };
    },
    find(query = {}) {
        let results = [...usersStore];
        if (query.email) {
            results = results.filter(u => u.email.toLowerCase() === query.email.toLowerCase());
        }
        return {
            async lean() { return results; },
            then(resolve) { resolve(results); }
        };
    }
};

export default userModel;

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Storage Utility (File-based DB for MVP)
 * Handles safe read/write operations
 */
class Storage {

    /**
     * Ensure data directory exists
     */
    static ensureDataDir() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
    }

    /**
     * Get full path for a file
     */
    static getFilePath(fileName) {
        this.ensureDataDir();
        return path.join(DATA_DIR, fileName);
    }

    /**
     * Read JSON file safely
     */
    static read(fileName) {
        const filePath = this.getFilePath(fileName);

        if (!fs.existsSync(filePath)) return [];

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data || '[]');
        } catch (error) {
            console.error(`Error reading ${fileName}:`, error);
            return [];
        }
    }

    /**
     * Write JSON file safely (atomic write)
     */
    static write(fileName, data) {
        const filePath = this.getFilePath(fileName);
        const tempPath = filePath + '.tmp';

        try {
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
            fs.renameSync(tempPath, filePath);
        } catch (error) {
            console.error(`Error writing ${fileName}:`, error);
            throw error;
        }
    }

    /**
     * Append item to file (array-based)
     */
    static append(fileName, item) {
        const data = this.read(fileName);
        data.push(item);
        this.write(fileName, data);
        return item;
    }

    /**
     * Find one item by key/value
     */
    static findOne(fileName, key, value) {
        const data = this.read(fileName);
        return data.find(item => item[key] === value);
    }

    /**
     * Find all items matching condition
     */
    static find(fileName, callback) {
        const data = this.read(fileName);
        return data.filter(callback);
    }

    /**
     * Update item(s)
     */
    static update(fileName, callback) {
        let data = this.read(fileName);

        const updatedData = data.map(item => {
            const updated = callback(item);
            return updated || item;
        });

        this.write(fileName, updatedData);
        return updatedData;
    }

    /**
     * Delete item(s)
     */
    static delete(fileName, callback) {
        const data = this.read(fileName);
        const filtered = data.filter(item => !callback(item));
        this.write(fileName, filtered);
        return filtered;
    }
}

module.exports = Storage;
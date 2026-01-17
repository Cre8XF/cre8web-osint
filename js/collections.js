/**
 * Collections System - Organiser favoritter i samlinger
 * Bedre enn start.me's tags med drag & drop og mobile touch support
 */

import { ls } from './helpers.js';
import { getFavorites, saveFavorites } from './favorites.js';

const COLLECTIONS_KEY = 'collections';
const DEFAULT_COLLECTION = 'default';

/**
 * Get all collections from localStorage
 * @returns {Object} Collections object with collection IDs as keys
 */
export function getCollections() {
    return ls.get(COLLECTIONS_KEY, {
        [DEFAULT_COLLECTION]: {
            id: DEFAULT_COLLECTION,
            name: 'Mine favoritter',
            icon: '⭐',
            favorites: [],
            createdAt: new Date().toISOString()
        }
    });
}

/**
 * Save collections to localStorage
 * @param {Object} collections - Collections object to save
 * @returns {boolean} Success status
 */
export function saveCollections(collections) {
    return ls.set(COLLECTIONS_KEY, collections);
}

/**
 * Create a new collection
 * @param {string} name - Collection name
 * @param {string} icon - Emoji icon for collection
 * @returns {string} New collection ID
 */
export function createCollection(name, icon = '📁') {
    const collections = getCollections();
    const id = `col_${Date.now()}`;
    collections[id] = {
        id,
        name,
        icon,
        favorites: [],
        createdAt: new Date().toISOString()
    };
    saveCollections(collections);
    console.log(`[Collections] Created collection "${name}" with ID ${id}`);
    return id;
}

/**
 * Rename a collection
 * @param {string} id - Collection ID
 * @param {string} newName - New collection name
 * @returns {boolean} Success status
 */
export function renameCollection(id, newName) {
    if (id === DEFAULT_COLLECTION) return false;
    const collections = getCollections();
    if (!collections[id]) return false;

    collections[id].name = newName;
    saveCollections(collections);
    console.log(`[Collections] Renamed collection ${id} to "${newName}"`);
    return true;
}

/**
 * Delete a collection (cannot delete default collection)
 * @param {string} id - Collection ID
 * @returns {boolean} Success status
 */
export function deleteCollection(id) {
    if (id === DEFAULT_COLLECTION) {
        console.warn('[Collections] Cannot delete default collection');
        return false;
    }

    const collections = getCollections();
    if (!collections[id]) return false;

    // Move favorites back to default collection
    const defaultCol = collections[DEFAULT_COLLECTION];
    const deletedCol = collections[id];

    if (deletedCol.favorites && deletedCol.favorites.length > 0) {
        defaultCol.favorites = [...defaultCol.favorites, ...deletedCol.favorites];
    }

    delete collections[id];
    saveCollections(collections);
    console.log(`[Collections] Deleted collection ${id}, moved ${deletedCol.favorites?.length || 0} favorites to default`);
    return true;
}

/**
 * Add a favorite to a collection
 * @param {string} collectionId - Target collection ID
 * @param {Object} favorite - Favorite object {url, title, desc, category}
 * @returns {boolean} Success status
 */
export function addToCollection(collectionId, favorite) {
    const collections = getCollections();
    if (!collections[collectionId]) {
        console.error(`[Collections] Collection ${collectionId} not found`);
        return false;
    }

    // Remove from other collections (each favorite can only be in one collection)
    Object.values(collections).forEach(col => {
        col.favorites = col.favorites.filter(f => f.url !== favorite.url);
    });

    // Add to target collection
    collections[collectionId].favorites.push({
        ...favorite,
        addedAt: new Date().toISOString()
    });

    saveCollections(collections);
    console.log(`[Collections] Added "${favorite.title}" to collection ${collectionId}`);
    return true;
}

/**
 * Remove a favorite from a collection
 * @param {string} collectionId - Collection ID
 * @param {string} url - Favorite URL to remove
 * @returns {boolean} Success status
 */
export function removeFromCollection(collectionId, url) {
    const collections = getCollections();
    if (!collections[collectionId]) return false;

    const beforeCount = collections[collectionId].favorites.length;
    collections[collectionId].favorites = collections[collectionId].favorites.filter(
        f => f.url !== url
    );
    const afterCount = collections[collectionId].favorites.length;

    saveCollections(collections);
    console.log(`[Collections] Removed favorite from collection ${collectionId}`);
    return beforeCount > afterCount;
}

/**
 * Move a favorite from one collection to another
 * @param {string} fromCollectionId - Source collection ID
 * @param {string} toCollectionId - Target collection ID
 * @param {string} url - Favorite URL to move
 * @returns {boolean} Success status
 */
export function moveFavorite(fromCollectionId, toCollectionId, url) {
    const collections = getCollections();
    if (!collections[fromCollectionId] || !collections[toCollectionId]) return false;

    const favorite = collections[fromCollectionId].favorites.find(f => f.url === url);
    if (!favorite) return false;

    removeFromCollection(fromCollectionId, url);
    addToCollection(toCollectionId, favorite);

    console.log(`[Collections] Moved favorite from ${fromCollectionId} to ${toCollectionId}`);
    return true;
}

/**
 * Get all favorites in a specific collection
 * @param {string} collectionId - Collection ID
 * @returns {Array} Array of favorites
 */
export function getCollectionFavorites(collectionId) {
    const collections = getCollections();
    if (!collections[collectionId]) return [];
    return collections[collectionId].favorites || [];
}

/**
 * Get collection count (excluding default)
 * @returns {number} Number of custom collections
 */
export function getCollectionCount() {
    const collections = getCollections();
    return Object.keys(collections).filter(id => id !== DEFAULT_COLLECTION).length;
}

/**
 * Migrate existing favorites to collections system
 * This should be run once to migrate from old favorites.js system
 */
export function migrateToCollections() {
    const collections = getCollections();
    const favorites = getFavorites();

    // If default collection is empty and we have favorites, migrate them
    if (collections[DEFAULT_COLLECTION].favorites.length === 0 && favorites.length > 0) {
        console.log(`[Collections] Migrating ${favorites.length} favorites to default collection`);
        collections[DEFAULT_COLLECTION].favorites = favorites.map(fav => ({
            ...fav,
            addedAt: new Date().toISOString()
        }));
        saveCollections(collections);
        console.log('[Collections] Migration completed');
        return true;
    }

    return false;
}

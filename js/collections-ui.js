/**
 * Collections UI - Sidebar og mobile interface for Collections
 */

import {
    getCollections,
    createCollection,
    deleteCollection,
    renameCollection,
    addToCollection,
    removeFromCollection,
    moveFavorite,
    getCollectionFavorites,
    migrateToCollections
} from './collections.js';

let activeCollectionId = 'default';
let selectedFavorites = new Set(); // For mobile tap-to-select mode
let isMobileSelectMode = false;

/**
 * Render Collections sidebar
 * @returns {string} HTML for collections sidebar
 */
export function renderCollectionsSidebar() {
    const collections = getCollections();
    const collectionsList = Object.values(collections).map(col => {
        const favCount = col.favorites?.length || 0;
        const isActive = col.id === activeCollectionId;

        return `
            <li class="collection-item ${isActive ? 'active' : ''}" data-collection-id="${col.id}">
                <div class="collection-content" data-collection-id="${col.id}">
                    <span class="collection-icon">${col.icon}</span>
                    <span class="collection-name">${col.name}</span>
                    <span class="collection-count">${favCount}</span>
                </div>
                ${col.id !== 'default' ? `
                    <div class="collection-actions">
                        <button class="collection-edit-btn" data-collection-id="${col.id}" title="Rediger">✏️</button>
                        <button class="collection-delete-btn" data-collection-id="${col.id}" title="Slett">🗑️</button>
                    </div>
                ` : ''}
            </li>
        `;
    }).join('');

    return `
        <aside class="collections-sidebar" id="collectionsSidebar">
            <div class="collections-header">
                <h3>📚 Samlinger</h3>
                <button id="toggleCollectionsBtn" class="toggle-sidebar-btn" title="Skjul samlinger">◀</button>
            </div>

            <button id="newCollectionBtn" class="new-collection-btn">
                <span>➕</span> Ny samling
            </button>

            <ul class="collections-list" id="collectionsList">
                ${collectionsList}
            </ul>

            <!-- Mobile floating action -->
            <button id="mobileCollectionsBtn" class="mobile-collections-btn">
                📚
            </button>
        </aside>
    `;
}

/**
 * Initialize Collections UI
 */
export function initCollectionsUI() {
    // Migrate existing favorites if needed
    migrateToCollections();

    // Insert sidebar into DOM
    const main = document.querySelector('main');
    if (main && !document.getElementById('collectionsSidebar')) {
        main.insertAdjacentHTML('afterbegin', renderCollectionsSidebar());
        console.log('[Collections UI] Sidebar rendered');
    }

    setupCollectionsEvents();
    updateCollectionsUI();
}

/**
 * Setup event listeners for Collections UI
 */
function setupCollectionsEvents() {
    // New collection button
    const newCollectionBtn = document.getElementById('newCollectionBtn');
    if (newCollectionBtn) {
        newCollectionBtn.addEventListener('click', showNewCollectionModal);
    }

    // Toggle sidebar (desktop)
    const toggleBtn = document.getElementById('toggleCollectionsBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleCollectionsSidebar);
    }

    // Mobile collections button
    const mobileBtn = document.getElementById('mobileCollectionsBtn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', showMobileCollectionsSheet);
    }

    // Collection item clicks (event delegation)
    const collectionsList = document.getElementById('collectionsList');
    if (collectionsList) {
        collectionsList.addEventListener('click', handleCollectionClick);
    }

    // Setup drag and drop for desktop
    if (window.innerWidth > 768) {
        setupDesktopDragAndDrop();
    } else {
        setupMobileTapToSelect();
    }
}

/**
 * Handle collection item clicks (switch collection, edit, delete)
 */
function handleCollectionClick(e) {
    const target = e.target;

    // Delete button
    if (target.classList.contains('collection-delete-btn')) {
        const collectionId = target.dataset.collectionId;
        handleDeleteCollection(collectionId);
        return;
    }

    // Edit button
    if (target.classList.contains('collection-edit-btn')) {
        const collectionId = target.dataset.collectionId;
        handleEditCollection(collectionId);
        return;
    }

    // Collection content (switch active collection)
    if (target.classList.contains('collection-content') || target.closest('.collection-content')) {
        const collectionContent = target.classList.contains('collection-content')
            ? target
            : target.closest('.collection-content');
        const collectionId = collectionContent.dataset.collectionId;
        switchCollection(collectionId);
    }
}

/**
 * Switch to a different collection
 */
function switchCollection(collectionId) {
    activeCollectionId = collectionId;
    updateCollectionsUI();
    renderFavoritesForCollection(collectionId);
    console.log(`[Collections UI] Switched to collection: ${collectionId}`);
}

/**
 * Render favorites for the active collection
 */
function renderFavoritesForCollection(collectionId) {
    const favorites = getCollectionFavorites(collectionId);
    const favoritesContainer = document.getElementById('favorites');

    if (!favoritesContainer) return;

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="empty-collection">
                <p>📭 Denne samlingen er tom</p>
                <p class="empty-hint">Dra favoritter hit eller bruk Quick Add for å legge til</p>
            </div>
        `;
        return;
    }

    // Render favorites (reuse existing favorites rendering logic)
    const favoritesHTML = favorites.map(fav => `
        <div class="fav-card" data-url="${fav.url}" data-draggable="true">
            <button class="remove" data-url="${fav.url}">✕</button>
            <a href="${fav.url}" target="_blank" rel="noopener noreferrer">
                <div class="fav-icon">${fav.category === 'AI' ? '🤖' : fav.category === 'OSINT' ? '🕵️' : '🔗'}</div>
                <h3>${fav.title}</h3>
                ${fav.desc ? `<p>${fav.desc}</p>` : ''}
            </a>
        </div>
    `).join('');

    favoritesContainer.innerHTML = `<div class="favorites-grid">${favoritesHTML}</div>`;

    // Re-setup drag and drop for new favorites
    if (window.innerWidth > 768) {
        setupFavoritesDragAndDrop();
    }
}

/**
 * Update Collections UI (active states, counts, etc.)
 */
function updateCollectionsUI() {
    const collections = getCollections();
    const collectionItems = document.querySelectorAll('.collection-item');

    collectionItems.forEach(item => {
        const collectionId = item.dataset.collectionId;
        const collection = collections[collectionId];

        if (!collection) return;

        // Update active state
        if (collectionId === activeCollectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }

        // Update count
        const countEl = item.querySelector('.collection-count');
        if (countEl) {
            countEl.textContent = collection.favorites?.length || 0;
        }
    });
}

/**
 * Show new collection modal
 */
function showNewCollectionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content collection-modal">
            <h2>➕ Ny samling</h2>
            <form id="newCollectionForm">
                <div class="form-group">
                    <label for="collectionName">Navn</label>
                    <input type="text" id="collectionName" placeholder="F.eks. Arbeid, Hobby, Research..." required autofocus maxlength="30">
                </div>
                <div class="form-group">
                    <label for="collectionIcon">Ikon</label>
                    <input type="text" id="collectionIcon" placeholder="📁" maxlength="2">
                    <div class="icon-suggestions">
                        ${['📁', '💼', '🎨', '🔬', '🎓', '🏠', '⚡', '🌟', '🔥', '💡'].map(icon =>
                            `<button type="button" class="icon-btn" data-icon="${icon}">${icon}</button>`
                        ).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="cancelCollectionBtn">Avbryt</button>
                    <button type="submit" class="btn-primary">Opprett</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Icon suggestions
    modal.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('collectionIcon').value = btn.dataset.icon;
        });
    });

    // Form submit
    modal.querySelector('#newCollectionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('collectionName').value.trim();
        const icon = document.getElementById('collectionIcon').value.trim() || '📁';

        if (name) {
            const newId = createCollection(name, icon);
            closeModal(modal);

            // Re-render sidebar
            const sidebar = document.getElementById('collectionsSidebar');
            if (sidebar) {
                const main = document.querySelector('main');
                sidebar.remove();
                main.insertAdjacentHTML('afterbegin', renderCollectionsSidebar());
                setupCollectionsEvents();
                switchCollection(newId);
            }
        }
    });

    // Cancel button
    modal.querySelector('#cancelCollectionBtn').addEventListener('click', () => {
        closeModal(modal);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

/**
 * Handle edit collection
 */
function handleEditCollection(collectionId) {
    const collections = getCollections();
    const collection = collections[collectionId];
    if (!collection) return;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content collection-modal">
            <h2>✏️ Rediger samling</h2>
            <form id="editCollectionForm">
                <div class="form-group">
                    <label for="editCollectionName">Navn</label>
                    <input type="text" id="editCollectionName" value="${collection.name}" required autofocus maxlength="30">
                </div>
                <div class="form-group">
                    <label for="editCollectionIcon">Ikon</label>
                    <input type="text" id="editCollectionIcon" value="${collection.icon}" maxlength="2">
                    <div class="icon-suggestions">
                        ${['📁', '💼', '🎨', '🔬', '🎓', '🏠', '⚡', '🌟', '🔥', '💡'].map(icon =>
                            `<button type="button" class="icon-btn" data-icon="${icon}">${icon}</button>`
                        ).join('')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" id="cancelEditBtn">Avbryt</button>
                    <button type="submit" class="btn-primary">Lagre</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // Icon suggestions
    modal.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('editCollectionIcon').value = btn.dataset.icon;
        });
    });

    // Form submit
    modal.querySelector('#editCollectionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = document.getElementById('editCollectionName').value.trim();
        const newIcon = document.getElementById('editCollectionIcon').value.trim();

        if (newName) {
            renameCollection(collectionId, newName);

            // Update icon
            const collections = getCollections();
            collections[collectionId].icon = newIcon || '📁';
            import('./collections.js').then(module => {
                module.saveCollections(collections);
            });

            closeModal(modal);

            // Re-render sidebar
            const sidebar = document.getElementById('collectionsSidebar');
            if (sidebar) {
                const main = document.querySelector('main');
                sidebar.remove();
                main.insertAdjacentHTML('afterbegin', renderCollectionsSidebar());
                setupCollectionsEvents();
                updateCollectionsUI();
            }
        }
    });

    // Cancel button
    modal.querySelector('#cancelEditBtn').addEventListener('click', () => {
        closeModal(modal);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });
}

/**
 * Handle delete collection
 */
function handleDeleteCollection(collectionId) {
    const collections = getCollections();
    const collection = collections[collectionId];
    if (!collection) return;

    const favCount = collection.favorites?.length || 0;
    const confirmMsg = favCount > 0
        ? `Er du sikker på at du vil slette "${collection.name}"? ${favCount} favoritter vil bli flyttet til "Mine favoritter".`
        : `Er du sikker på at du vil slette "${collection.name}"?`;

    if (confirm(confirmMsg)) {
        deleteCollection(collectionId);

        // Re-render sidebar
        const sidebar = document.getElementById('collectionsSidebar');
        if (sidebar) {
            const main = document.querySelector('main');
            sidebar.remove();
            main.insertAdjacentHTML('afterbegin', renderCollectionsSidebar());
            setupCollectionsEvents();

            // Switch to default collection if we deleted the active one
            if (activeCollectionId === collectionId) {
                switchCollection('default');
            }
        }
    }
}

/**
 * Toggle collections sidebar visibility (desktop)
 */
function toggleCollectionsSidebar() {
    const sidebar = document.getElementById('collectionsSidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        const toggleBtn = document.getElementById('toggleCollectionsBtn');
        if (toggleBtn) {
            toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
        }
    }
}

/**
 * Show mobile collections sheet
 */
function showMobileCollectionsSheet() {
    const collections = getCollections();
    const sheet = document.createElement('div');
    sheet.className = 'action-sheet';

    const collectionsHTML = Object.values(collections).map(col => {
        const favCount = col.favorites?.length || 0;
        const isActive = col.id === activeCollectionId;

        return `
            <button class="sheet-item collection-sheet-item ${isActive ? 'active' : ''}" data-collection-id="${col.id}">
                <span class="collection-icon">${col.icon}</span>
                <span class="collection-name">${col.name}</span>
                <span class="collection-count">${favCount}</span>
            </button>
        `;
    }).join('');

    sheet.innerHTML = `
        <div class="action-sheet-content">
            <h3>📚 Samlinger</h3>
            ${collectionsHTML}
            <button class="sheet-item sheet-new-collection" id="sheetNewCollection">
                ➕ Ny samling
            </button>
            <button class="sheet-item sheet-cancel">Avbryt</button>
        </div>
    `;

    document.body.appendChild(sheet);
    setTimeout(() => sheet.classList.add('active'), 10);

    // Collection item clicks
    sheet.querySelectorAll('.collection-sheet-item').forEach(item => {
        item.addEventListener('click', () => {
            const collectionId = item.dataset.collectionId;
            switchCollection(collectionId);
            closeSheet(sheet);
        });
    });

    // New collection button
    sheet.querySelector('#sheetNewCollection')?.addEventListener('click', () => {
        closeSheet(sheet);
        showNewCollectionModal();
    });

    // Cancel button
    sheet.querySelector('.sheet-cancel').addEventListener('click', () => {
        closeSheet(sheet);
    });

    // Close on overlay click
    sheet.addEventListener('click', (e) => {
        if (e.target === sheet) closeSheet(sheet);
    });
}

/**
 * Setup desktop drag and drop for collections
 */
function setupDesktopDragAndDrop() {
    setupFavoritesDragAndDrop();
    setupCollectionDropZones();
}

/**
 * Make favorites draggable
 */
function setupFavoritesDragAndDrop() {
    document.querySelectorAll('.fav-card[data-draggable="true"]').forEach(card => {
        card.draggable = true;

        card.addEventListener('dragstart', (e) => {
            const url = card.dataset.url;
            const title = card.querySelector('h3')?.textContent || '';
            const desc = card.querySelector('p')?.textContent || '';
            const category = card.querySelector('.fav-icon')?.textContent.includes('🤖') ? 'AI' : 'OSINT';

            const favoriteData = JSON.stringify({ url, title, desc, category });
            e.dataTransfer.setData('favorite', favoriteData);
            e.dataTransfer.effectAllowed = 'move';

            card.classList.add('dragging');
            console.log(`[Collections] Started dragging: ${title}`);
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });
}

/**
 * Make collection items drop zones
 */
function setupCollectionDropZones() {
    document.querySelectorAll('.collection-item').forEach(item => {
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');

            const favoriteData = e.dataTransfer.getData('favorite');
            if (!favoriteData) return;

            const favorite = JSON.parse(favoriteData);
            const targetCollectionId = item.dataset.collectionId;

            addToCollection(targetCollectionId, favorite);

            // Remove from current collection view
            const draggedCard = document.querySelector(`.fav-card[data-url="${favorite.url}"]`);
            if (draggedCard) {
                draggedCard.remove();
            }

            updateCollectionsUI();
            console.log(`[Collections] Dropped into collection: ${targetCollectionId}`);
        });
    });
}

/**
 * Setup mobile tap-to-select mode
 */
function setupMobileTapToSelect() {
    // Long press on favorite card to enter select mode
    document.querySelectorAll('.fav-card').forEach(card => {
        let pressTimer;

        card.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                enterSelectMode(card);
            }, 500); // 500ms long press
        }, { passive: true });

        card.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });

        card.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    });
}

/**
 * Enter mobile select mode
 */
function enterSelectMode(initialCard) {
    if (isMobileSelectMode) return;

    isMobileSelectMode = true;
    selectedFavorites.clear();

    // Show select mode UI
    const toolbar = document.createElement('div');
    toolbar.className = 'mobile-select-toolbar';
    toolbar.innerHTML = `
        <div class="select-toolbar-content">
            <button id="cancelSelectBtn" class="toolbar-btn">✕ Avbryt</button>
            <span id="selectedCount">0 valgt</span>
            <button id="moveToCollectionBtn" class="toolbar-btn">📚 Flytt til...</button>
        </div>
    `;

    document.body.appendChild(toolbar);
    setTimeout(() => toolbar.classList.add('active'), 10);

    // Add checkboxes to all favorites
    document.querySelectorAll('.fav-card').forEach(card => {
        card.classList.add('selectable');
        const checkbox = document.createElement('div');
        checkbox.className = 'select-checkbox';
        card.insertBefore(checkbox, card.firstChild);

        card.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFavoriteSelection(card);
        });
    });

    // Select initial card
    if (initialCard) {
        toggleFavoriteSelection(initialCard);
    }

    // Cancel button
    document.getElementById('cancelSelectBtn')?.addEventListener('click', exitSelectMode);

    // Move to collection button
    document.getElementById('moveToCollectionBtn')?.addEventListener('click', showMoveToCollectionSheet);
}

/**
 * Toggle favorite selection
 */
function toggleFavoriteSelection(card) {
    const url = card.dataset.url;

    if (selectedFavorites.has(url)) {
        selectedFavorites.delete(url);
        card.classList.remove('selected');
    } else {
        selectedFavorites.add(url);
        card.classList.add('selected');
    }

    // Update count
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = `${selectedFavorites.size} valgt`;
    }
}

/**
 * Show move to collection sheet
 */
function showMoveToCollectionSheet() {
    if (selectedFavorites.size === 0) {
        alert('Velg minst én favoritt først');
        return;
    }

    const collections = getCollections();
    const sheet = document.createElement('div');
    sheet.className = 'action-sheet';

    const collectionsHTML = Object.values(collections).map(col => `
        <button class="sheet-item" data-collection-id="${col.id}">
            ${col.icon} ${col.name}
        </button>
    `).join('');

    sheet.innerHTML = `
        <div class="action-sheet-content">
            <h3>Flytt til samling</h3>
            ${collectionsHTML}
            <button class="sheet-item sheet-cancel">Avbryt</button>
        </div>
    `;

    document.body.appendChild(sheet);
    setTimeout(() => sheet.classList.add('active'), 10);

    // Collection buttons
    sheet.querySelectorAll('[data-collection-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetCollectionId = btn.dataset.collectionId;

            // Move all selected favorites
            selectedFavorites.forEach(url => {
                const card = document.querySelector(`.fav-card[data-url="${url}"]`);
                if (card) {
                    const title = card.querySelector('h3')?.textContent || '';
                    const desc = card.querySelector('p')?.textContent || '';
                    const category = card.querySelector('.fav-icon')?.textContent.includes('🤖') ? 'AI' : 'OSINT';

                    addToCollection(targetCollectionId, { url, title, desc, category });
                    card.remove();
                }
            });

            updateCollectionsUI();
            closeSheet(sheet);
            exitSelectMode();
        });
    });

    // Cancel button
    sheet.querySelector('.sheet-cancel').addEventListener('click', () => {
        closeSheet(sheet);
    });
}

/**
 * Exit mobile select mode
 */
function exitSelectMode() {
    isMobileSelectMode = false;
    selectedFavorites.clear();

    // Remove toolbar
    const toolbar = document.querySelector('.mobile-select-toolbar');
    if (toolbar) {
        toolbar.classList.remove('active');
        setTimeout(() => toolbar.remove(), 300);
    }

    // Remove checkboxes
    document.querySelectorAll('.fav-card').forEach(card => {
        card.classList.remove('selectable', 'selected');
        const checkbox = card.querySelector('.select-checkbox');
        if (checkbox) checkbox.remove();
    });
}

/**
 * Close modal with animation
 */
function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
}

/**
 * Close sheet with animation
 */
function closeSheet(sheet) {
    sheet.classList.remove('active');
    setTimeout(() => sheet.remove(), 300);
}

/**
 * Get active collection ID
 */
export function getActiveCollectionId() {
    return activeCollectionId;
}

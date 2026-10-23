// ============================================================
//  ACCESS CONFIGURATION (Obfuscated)
//  A senha não é armazenada aqui: comparamos apenas os hashes.
//  Mesmo hash do projeto "reading" — altere se quiser.
// ============================================================
const PASSWORD_HASH = '797b59d2942a9118ea3d4cb78eae60a64271b609207f99594ee76b9f57b9944a';

// Algoritmo SHA-256 puro em JavaScript para funcionar em qualquer contexto (HTTP, HTTPS, iframes)
function sha256Fallback(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j;
    var result = "";

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    var hash = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];

    var k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    ascii += "\x80";
    while (ascii[lengthProperty] % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);

    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16);
        var oldHash = hash;
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var w15 = w[i - 15], w2 = w[i - 2];
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0
                );
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            var b = (hash[i] >> (8 * j)) & 255;
            result += ((b < 16) ? "0" : "") + b.toString(16);
        }
    }
    return result;
}

async function sha256(message) {
    if (window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function') {
        try {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.warn('Crypto.subtle falhou, usando fallback em JS:', e);
        }
    }

    // Fallback garantido para contextos HTTP ou sem suporte a Web Crypto API
    const utf8Str = unescape(encodeURIComponent(message));
    return sha256Fallback(utf8Str);
}

async function checkPassword() {
    const inputElement = document.getElementById('password-input');
    const input = inputElement.value;
    const error = document.getElementById('login-error');

    const inputHash = await sha256(input);

    if (inputHash === PASSWORD_HASH) {
        sessionStorage.setItem('authenticated', 'true');
        showContent();
    } else {
        error.style.display = 'block';
        inputElement.value = '';
        inputElement.focus();
    }
}

let appInitialized = false;

function showContent() {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');

    if (loginScreen) loginScreen.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    if (!appInitialized) {
        appInitialized = true;
        init();
    }
}

function lockLibrary() {
    sessionStorage.removeItem('authenticated');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    setupPlayer();

    if (sessionStorage.getItem('authenticated') === 'true') {
        showContent();
    }

    // Permite Enter no campo de senha
    document.getElementById('password-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
});

// ============================================================
//  CATÁLOGO
// ============================================================

let albums = [];
let currentAlbum = null; // null = tela inicial; chave do álbum = dentro de um álbum

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

window.addEventListener('hashchange', handleHashRoute);

function handleHashRoute() {
    const hash = window.location.hash;
    if (hash.startsWith('#album=')) {
        currentAlbum = decodeURIComponent(hash.replace('#album=', ''));
    } else {
        currentAlbum = null;
    }
    renderView(getSearchTerm());
}

function getSearchTerm() {
    const input = document.getElementById('search-input');
    return input ? input.value : '';
}

function navigateToAlbum(key) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    if (key) {
        window.location.hash = `#album=${encodeURIComponent(key)}`;
    } else if (window.location.hash) {
        window.location.hash = '';
    } else {
        currentAlbum = null;
        renderView();
    }
}

async function init() {
    const container = document.getElementById('library-container');
    const loading = document.getElementById('loading');

    try {
        const response = await fetch('lista_musicas.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error('Catálogo de músicas não encontrado.');
        }

        const data = await response.json();

        if (loading) loading.style.display = 'none';

        albums = normalizeData(data);
        restoreState();

        if (!albums.length) {
            if (container) container.innerHTML = '';
            renderView();
            return;
        }

        handleHashRoute();

    } catch (error) {
        console.error('Error:', error);
        if (loading) {
            loading.innerHTML = `<div class="error">
                <strong>Aguarde:</strong> o catálogo de músicas está sendo sincronizado.<br><br>
                <small>Se você acabou de subir um arquivo, aguarde alguns instantes e recarregue a página.</small>
            </div>`;
        }
    }
}

// Normaliza os dados suportando o formato novo (tracks) e o antigo (files)
function normalizeData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    const groups = (data[0] && (Array.isArray(data[0].tracks) || Array.isArray(data[0].files)))
        ? data
        : [{ album: 'Geral', folder: '', tracks: data }];

    return groups.map(group => {
        const rawTracks = group.tracks || group.files || [];
        const albumName = group.album || group.category || 'Geral';
        const folder = group.folder || '';

        const tracks = rawTracks
            .filter(t => t && t.path)
            .map(t => {
                const name = t.name || t.path.split('/').pop();
                return {
                    name,
                    path: t.path,
                    title: String(t.title || '').trim() || stripExtension(name),
                    artist: String(t.artist || '').trim(),
                    albumTag: String(t.album || '').trim(),
                    duration: Number(t.duration) || 0,
                    group: albumName,
                    folder
                };
            })
            .sort((a, b) => collator.compare(a.name, b.name));

        return {
            key: folder || '__root__',
            album: albumName,
            folder,
            tracks
        };
    }).filter(album => album.tracks.length > 0);
}

function stripExtension(name) {
    return name.replace(/\.[^.]+$/, '');
}

function allTracks() {
    const result = [];
    albums.forEach(album => result.push(...album.tracks));
    return result;
}

function findAlbum(key) {
    return albums.find(album => album.key === key);
}

function findTrack(path) {
    return allTracks().find(track => track.path === path) || null;
}

function albumOfTrack(track) {
    return albums.find(album => album.tracks.some(t => t.path === track.path)) || null;
}

// ============================================================
//  RENDERIZAÇÃO
// ============================================================

const PLAY_ICON_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.4-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2Z"/></svg>';
const DOWNLOAD_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>';

function renderView(searchTerm = '') {
    const container = document.getElementById('library-container');
    if (!container) return;

    container.innerHTML = '';
    const term = normalizeText(searchTerm.trim());

    // MODO 1: BUSCA GLOBAL
    if (term) {
        renderSearch(searchTerm, term);
        return;
    }

    // MODO 2: TELA INICIAL
    if (currentAlbum === null) {
        if (albums.length === 1 && !albums[0].folder) {
            renderAlbumView(albums[0], true);
        } else {
            renderHome();
        }
        return;
    }

    // MODO 3: DENTRO DE UM ÁLBUM
    const album = findAlbum(currentAlbum);
    if (!album) {
        navigateToAlbum(null);
        return;
    }

    renderAlbumView(album, false);
}

function renderHome() {
    const container = document.getElementById('library-container');
    const navBar = document.getElementById('navigation-bar');
    if (navBar) navBar.style.display = 'none';
    if (!container) return;

    if (!albums.length) {
        container.appendChild(createEmptyState());
        return;
    }

    const tracks = allTracks();
    state.viewQueue = tracks;

    const heading = document.createElement('div');
    heading.className = 'section-heading';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Sua coleção';
    const sub = document.createElement('span');
    sub.className = 'heading-sub';
    sub.textContent = `${tracks.length} ${tracks.length === 1 ? 'música' : 'músicas'} · ${albums.length} ${albums.length === 1 ? 'álbum' : 'álbuns'}`;
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    heading.appendChild(titleWrap);
    heading.appendChild(createPlayAllButton(tracks));
    container.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'folders-grid';

    albums.forEach(album => {
        grid.appendChild(createAlbumCard(album));
    });

    container.appendChild(grid);
}

function renderAlbumView(album, singleView) {
    const container = document.getElementById('library-container');
    const navBar = document.getElementById('navigation-bar');
    if (!container) return;

    const tracks = album.tracks;
    state.viewQueue = tracks;

    if (navBar) {
        if (singleView) {
            navBar.style.display = 'none';
        } else {
            navBar.style.display = 'flex';
            navBar.innerHTML = '';

            const backBtn = document.createElement('button');
            backBtn.className = 'btn-back';
            backBtn.innerHTML = '<span>←</span> Voltar';
            backBtn.onclick = () => navigateToAlbum(null);
            navBar.appendChild(backBtn);

            const crumb = document.createElement('div');
            crumb.className = 'breadcrumb';
            crumb.innerHTML = '<span class="crumb-link">🏠 Início</span><span class="crumb-separator">›</span>';
            crumb.querySelector('.crumb-link').onclick = () => navigateToAlbum(null);
            const currentCrumb = document.createElement('span');
            currentCrumb.className = 'crumb-current';
            currentCrumb.textContent = `💿 ${album.album}`;
            crumb.appendChild(currentCrumb);
            navBar.appendChild(crumb);

            const badge = document.createElement('span');
            badge.className = 'category-badge';
            badge.textContent = `${tracks.length} ${tracks.length === 1 ? 'música' : 'músicas'}`;
            navBar.appendChild(badge);
        }
    }

    const heading = document.createElement('div');
    heading.className = 'section-heading';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = singleView ? 'Sua coleção' : album.album;
    const sub = document.createElement('span');
    sub.className = 'heading-sub';
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    sub.textContent = `${tracks.length} ${tracks.length === 1 ? 'música' : 'músicas'}${totalDuration ? ' · ' + formatTotalDuration(totalDuration) : ''}`;
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    heading.appendChild(titleWrap);
    heading.appendChild(createPlayAllButton(tracks));
    container.appendChild(heading);

    container.appendChild(createTrackList(tracks, tracks, false));
}

function renderSearch(searchTerm, term) {
    const container = document.getElementById('library-container');
    const navBar = document.getElementById('navigation-bar');
    if (!container) return;

    const results = [];

    albums.forEach(album => {
        album.tracks.forEach(track => {
            const haystack = normalizeText([
                track.title,
                track.name,
                track.artist,
                track.albumTag,
                track.group
            ].join(' '));

            if (haystack.includes(term)) {
                results.push(track);
            }
        });
    });

    if (navBar) {
        navBar.style.display = 'flex';
        navBar.innerHTML = '';

        const backBtn = document.createElement('button');
        backBtn.className = 'btn-back';
        backBtn.innerHTML = '<span>←</span> Limpar';
        backBtn.onclick = () => clearSearch();
        navBar.appendChild(backBtn);

        const crumb = document.createElement('div');
        crumb.className = 'breadcrumb';
        crumb.innerHTML = '<span class="crumb-link">🏠 Início</span><span class="crumb-separator">›</span>';
        crumb.querySelector('.crumb-link').onclick = () => navigateToAlbum(null);
        const currentCrumb = document.createElement('span');
        currentCrumb.className = 'crumb-current';
        currentCrumb.textContent = `🔍 Resultados para "${searchTerm}"`;
        crumb.appendChild(currentCrumb);
        navBar.appendChild(crumb);

        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = `${results.length} ${results.length === 1 ? 'resultado' : 'resultados'}`;
        navBar.appendChild(badge);
    }

    if (!results.length) {
        container.innerHTML = '<p class="empty-msg">Nenhuma música encontrada para esta busca.</p>';
        state.viewQueue = [];
        return;
    }

    state.viewQueue = results;

    const heading = document.createElement('div');
    heading.className = 'section-heading';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Resultados da busca';
    const sub = document.createElement('span');
    sub.className = 'heading-sub';
    sub.textContent = `${results.length} ${results.length === 1 ? 'música encontrada' : 'músicas encontradas'}`;
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    heading.appendChild(titleWrap);
    heading.appendChild(createPlayAllButton(results));
    container.appendChild(heading);

    container.appendChild(createTrackList(results, results, true));
}

function createPlayAllButton(queue, label = 'Tocar tudo') {
    const btn = document.createElement('button');
    btn.className = 'btn-play-all';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.4-6.8a.6.6 0 0 0 0-1L8.92 4.7A.6.6 0 0 0 8 5.2Z"/></svg>' + label;
    btn.onclick = () => playAll(queue);
    return btn;
}

function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.onclick = () => navigateToAlbum(album.key);
    card.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigateToAlbum(album.key);
        }
    };

    const cover = document.createElement('div');
    cover.className = 'album-cover';
    cover.style.setProperty('--cover-hue', String(hueFor(album.key)));
    cover.textContent = album.folder ? '💿' : '🎵';

    const details = document.createElement('div');
    details.className = 'folder-details';

    const title = document.createElement('h3');
    title.className = 'folder-title';
    title.textContent = album.album;

    const subtitle = document.createElement('span');
    subtitle.className = 'folder-subtitle';
    subtitle.textContent = `${album.tracks.length} ${album.tracks.length === 1 ? 'música' : 'músicas'}`;

    details.appendChild(title);
    details.appendChild(subtitle);

    const arrow = document.createElement('span');
    arrow.className = 'folder-arrow';
    arrow.textContent = '➔';

    card.appendChild(cover);
    card.appendChild(details);
    card.appendChild(arrow);

    return card;
}

function createTrackList(tracks, queue, showAlbum) {
    const list = document.createElement('div');
    list.className = 'track-list';

    tracks.forEach(track => {
        list.appendChild(createTrackRow(track, queue, showAlbum));
    });

    return list;
}

function createTrackRow(track, queue, showAlbum) {
    const row = document.createElement('div');
    row.className = 'track-row';
    row.dataset.path = track.path;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Tocar ${track.title}`);

    if (state.current && state.current.path === track.path) {
        row.classList.add('current');
    }

    const play = document.createElement('button');
    play.className = 'track-play';
    play.innerHTML = PLAY_ICON_SVG + '<span class="track-eq"><span></span><span></span><span></span></span>';
    play.title = 'Tocar';
    play.onclick = (e) => {
        e.stopPropagation();
        playTrackFromCard(track, queue);
    };

    const info = document.createElement('div');
    info.className = 'track-info';

    const title = document.createElement('div');
    title.className = 'track-title';
    title.textContent = track.title;

    const sub = document.createElement('div');
    sub.className = 'track-sub';
    const subParts = [];
    if (track.artist) subParts.push(track.artist);
    if (showAlbum) {
        subParts.push(track.group);
    } else if (track.albumTag && track.albumTag !== track.group) {
        subParts.push(track.albumTag);
    }
    sub.textContent = subParts.length ? subParts.join(' · ') : track.group;

    info.appendChild(title);
    info.appendChild(sub);

    const duration = document.createElement('span');
    duration.className = 'track-duration';
    duration.textContent = track.duration ? formatTime(track.duration) : '—';

    const download = document.createElement('a');
    download.className = 'track-download';
    download.href = encodePath(track.path);
    download.download = track.name;
    download.title = 'Baixar';
    download.setAttribute('aria-label', `Baixar ${track.title}`);
    download.innerHTML = DOWNLOAD_ICON_SVG;
    download.onclick = (e) => e.stopPropagation();

    row.appendChild(play);
    row.appendChild(info);
    row.appendChild(duration);
    row.appendChild(download);

    row.onclick = () => playTrackFromCard(track, queue);
    row.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playTrackFromCard(track, queue);
        }
    };

    return row;
}

function playTrackFromCard(track, queue) {
    if (state.current && state.current.path === track.path && audio.src) {
        togglePlay();
        return;
    }
    loadTrack(track, queue, true);
}

function createEmptyState() {
    const wrap = document.createElement('div');
    wrap.className = 'empty-state';
    wrap.innerHTML = `
        <div class="empty-icon">🎧</div>
        <h2>Nenhuma música na coleção</h2>
        <p>
            Coloque seus arquivos de áudio na raiz do projeto (ou em pastas de álbuns)
            e rode <code>python3 generate_list.py</code>.<br><br>
            Se preferir, envie as músicas pelo GitHub: o catálogo é atualizado
            automaticamente pelo GitHub Actions.
        </p>
    `;
    return wrap;
}

function handleSearch(term) {
    renderView(term);
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    renderView();
}

// ============================================================
//  PLAYER
// ============================================================

const audio = document.getElementById('audio');

const state = {
    queue: [],
    viewQueue: [],
    index: -1,
    current: null,
    playing: false,
    shuffle: false,
    repeat: 'off' // off | all | one
};

let pendingResumeTime = 0;
let lastSaveAt = 0;

function setupPlayer() {
    if (!audio) return;

    const seekBar = document.getElementById('seek-bar');
    const volumeBar = document.getElementById('volume-bar');

    audio.addEventListener('play', () => {
        state.playing = true;
        updatePlayButton();
        updateMediaSession();
        saveState(true);
    });

    audio.addEventListener('pause', () => {
        state.playing = false;
        updatePlayButton();
        saveState(true);
    });

    audio.addEventListener('timeupdate', () => {
        updateProgress();
        const now = Date.now();
        if (now - lastSaveAt > 4000) {
            lastSaveAt = now;
            saveState();
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        updateProgress();
        const durationEl = document.getElementById('duration');
        if (durationEl) durationEl.textContent = formatTime(audio.duration);

        if (pendingResumeTime > 0 && isFinite(audio.duration)) {
            audio.currentTime = Math.min(pendingResumeTime, Math.max(0, audio.duration - 1));
            pendingResumeTime = 0;
            updateProgress();
        }
    });

    audio.addEventListener('ended', () => {
        playNext(true);
    });

    audio.addEventListener('error', () => {
        if (!state.current) return;
        const artistEl = document.getElementById('player-artist');
        if (artistEl) artistEl.textContent = 'Não foi possível reproduzir este arquivo';
    });

    if (seekBar) {
        seekBar.addEventListener('input', () => {
            if (!isFinite(audio.duration) || audio.duration <= 0) return;
            audio.currentTime = (Number(seekBar.value) / 100) * audio.duration;
            updateProgress();
        });
    }

    if (volumeBar) {
        volumeBar.addEventListener('input', () => {
            const value = Number(volumeBar.value);
            audio.volume = value;
            audio.muted = value === 0;
            updateVolumeUI();
            saveState(true);
        });
    }

    const saved = readSavedState();
    const initialVolume = typeof saved.volume === 'number' ? saved.volume : 0.9;
    audio.volume = Math.max(0, Math.min(1, initialVolume));
    audio.muted = Boolean(saved.muted);

    state.shuffle = Boolean(saved.shuffle);
    state.repeat = ['off', 'all', 'one'].includes(saved.repeat) ? saved.repeat : 'off';
    updateShuffleUI();
    updateRepeatUI();
    updateVolumeUI();
    updatePlayButton();
    updateProgress();

    if ('mediaSession' in navigator) {
        try {
            navigator.mediaSession.setActionHandler('play', () => togglePlay());
            navigator.mediaSession.setActionHandler('pause', () => togglePlay());
            navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
            navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime != null && isFinite(details.seekTime)) {
                    audio.currentTime = details.seekTime;
                    updateProgress();
                }
            });
        } catch (e) {
            // Alguns navegadores não suportam todos os handlers
        }
    }

    document.addEventListener('keydown', handleKeyboard);

    window.addEventListener('beforeunload', () => saveState(true));
}

function handleKeyboard(e) {
    const tag = (e.target && e.target.tagName ? e.target.tagName : '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
        return;
    }
    if (e.target && e.target.closest && e.target.closest('button, a')) {
        return;
    }

    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekBy(5);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-5);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(0.05);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(-0.05);
    } else if (e.key === 'n' || e.key === 'N') {
        playNext();
    } else if (e.key === 'p' || e.key === 'P') {
        playPrevious();
    }
}

function loadTrack(track, queue, autoplay) {
    if (!track) return;

    const playableQueue = (queue && queue.length ? queue : [track]).filter(t => t && t.path);
    let index = playableQueue.findIndex(t => t.path === track.path);
    if (index === -1) {
        playableQueue.unshift(track);
        index = 0;
    }

    state.queue = playableQueue;
    state.index = index;
    state.current = track;
    pendingResumeTime = 0;

    audio.src = encodePath(track.path);
    audio.load();
    updatePlayerMeta(track);
    updateRowHighlights();
    saveState(true);

    if (autoplay) {
        audio.play().catch(error => {
            console.warn('Não foi possível iniciar a reprodução automaticamente:', error);
            const artistEl = document.getElementById('player-artist');
            if (artistEl && state.current) {
                artistEl.textContent = 'Clique no play para iniciar';
            }
        });
    }
}

function playTrack(track, queue) {
    loadTrack(track, queue, true);
}

function playAll(queue) {
    const playable = (queue && queue.length ? queue : state.viewQueue).filter(t => t && t.path);
    if (!playable.length) return;

    const start = state.shuffle ? Math.floor(Math.random() * playable.length) : 0;
    loadTrack(playable[start], playable, true);
}

function togglePlay() {
    if (!state.current) {
        playAll(state.viewQueue);
        return;
    }

    if (audio.paused) {
        audio.play().catch(error => console.warn('Erro ao reproduzir:', error));
    } else {
        audio.pause();
    }
}

function playNext(auto = false) {
    if (!state.queue.length) return;

    if (auto && state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
    }

    let nextIndex;

    if (state.shuffle && state.queue.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * state.queue.length);
        } while (nextIndex === state.index);
    } else {
        nextIndex = state.index + 1;

        if (nextIndex >= state.queue.length) {
            if (state.repeat === 'all') {
                nextIndex = 0;
            } else {
                audio.pause();
                if (auto) {
                    audio.currentTime = 0;
                    updateProgress();
                }
                return;
            }
        }
    }

    loadTrack(state.queue[nextIndex], state.queue, true);
}

function playPrevious() {
    if (!state.queue.length) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        updateProgress();
        return;
    }

    let prevIndex = state.index - 1;

    if (prevIndex < 0) {
        if (state.repeat === 'all' || state.shuffle) {
            prevIndex = state.queue.length - 1;
        } else {
            prevIndex = 0;
            audio.currentTime = 0;
            updateProgress();
            return;
        }
    }

    loadTrack(state.queue[prevIndex], state.queue, true);
}

function seekBy(seconds) {
    if (!state.current || !isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
    updateProgress();
}

function changeVolume(delta) {
    const value = Math.max(0, Math.min(1, audio.volume + delta));
    audio.volume = value;
    audio.muted = value === 0;
    updateVolumeUI();
    saveState(true);
}

function toggleMute() {
    if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        if (audio.volume === 0) {
            audio.volume = 0.5;
        }
    } else {
        audio.muted = true;
    }
    updateVolumeUI();
    saveState(true);
}

function toggleShuffle() {
    state.shuffle = !state.shuffle;
    updateShuffleUI();
    saveState(true);
}

function cycleRepeat() {
    state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
    updateRepeatUI();
    saveState(true);
}

function updateShuffleUI() {
    const btn = document.getElementById('shuffle-btn');
    if (!btn) return;
    btn.classList.toggle('active', state.shuffle);
    btn.title = state.shuffle ? 'Aleatório: ligado' : 'Aleatório: desligado';
}

function updateRepeatUI() {
    const btn = document.getElementById('repeat-btn');
    if (!btn) return;
    btn.classList.toggle('active', state.repeat !== 'off');
    btn.classList.toggle('repeat-one', state.repeat === 'one');
    btn.title = state.repeat === 'off'
        ? 'Repetir: desligado'
        : state.repeat === 'all'
            ? 'Repetir: álbum/fila'
            : 'Repetir: uma música';
}

function updateVolumeUI() {
    const volumeBar = document.getElementById('volume-bar');
    const volumeIcon = document.getElementById('volume-icon');
    const mutedIcon = document.getElementById('muted-icon');
    const muteBtn = document.getElementById('mute-btn');

    const effectiveVolume = audio.muted ? 0 : audio.volume;

    if (volumeBar) {
        volumeBar.value = String(effectiveVolume);
        volumeBar.style.setProperty('--volume-progress', `${effectiveVolume * 100}%`);
    }

    if (volumeIcon) volumeIcon.style.display = audio.muted || audio.volume === 0 ? 'none' : 'block';
    if (mutedIcon) mutedIcon.style.display = audio.muted || audio.volume === 0 ? 'block' : 'none';
    if (muteBtn) muteBtn.title = audio.muted ? 'Ativar som' : 'Silenciar';
}

function updatePlayButton() {
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const btn = document.getElementById('play-btn');

    if (playIcon) playIcon.style.display = state.playing ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = state.playing ? 'block' : 'none';
    if (btn) {
        btn.title = state.playing ? 'Pausar' : 'Tocar';
        btn.setAttribute('aria-label', state.playing ? 'Pausar' : 'Tocar');
    }

    document.title = state.playing && state.current
        ? `▶ ${state.current.title} — Music 101`
        : 'Music 101';
}

function updateProgress() {
    const currentEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const seekBar = document.getElementById('seek-bar');

    const duration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const current = isFinite(audio.currentTime) ? audio.currentTime : 0;

    if (currentEl) currentEl.textContent = formatTime(current);
    if (durationEl) durationEl.textContent = formatTime(duration);

    if (seekBar && duration > 0) {
        const pct = Math.max(0, Math.min(100, (current / duration) * 100));
        seekBar.value = String(pct);
        seekBar.style.setProperty('--progress', `${pct}%`);
    } else if (seekBar) {
        seekBar.value = '0';
        seekBar.style.setProperty('--progress', '0%');
    }
}

function updatePlayerMeta(track) {
    const titleEl = document.getElementById('player-title');
    const artistEl = document.getElementById('player-artist');
    const coverEl = document.getElementById('player-cover');
    const downloadBtn = document.getElementById('download-btn');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) {
        const parts = [];
        if (track.artist) parts.push(track.artist);
        if (track.albumTag) parts.push(track.albumTag);
        artistEl.textContent = parts.length ? parts.join(' · ') : track.group;
    }
    if (coverEl) {
        coverEl.style.setProperty('--cover-hue', String(hueFor(track.folder || track.path)));
        coverEl.textContent = '🎵';
    }
    if (downloadBtn) {
        downloadBtn.href = encodePath(track.path);
        downloadBtn.setAttribute('download', track.name);
    }

    updateMediaSession();
}

function updateMediaSession() {
    if (!('mediaSession' in navigator) || !state.current) return;
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: state.current.title,
            artist: state.current.artist || 'Music 101',
            album: state.current.albumTag || state.current.group
        });
        navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused';
    } catch (e) {
        // Metadata API indisponível
    }
}

function updateRowHighlights() {
    const path = state.current ? state.current.path : null;
    document.querySelectorAll('.track-row').forEach(row => {
        row.classList.toggle('current', row.dataset.path === path);
    });
}

// ============================================================
//  ESTADO PERSISTIDO
// ============================================================

const STORAGE_KEY = 'music101_state';

function readSavedState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (e) {
        return {};
    }
}

function saveState(force = false) {
    if (!force && !state.current) return;

    const payload = {
        volume: audio.volume,
        muted: audio.muted,
        shuffle: state.shuffle,
        repeat: state.repeat,
        lastPath: state.current ? state.current.path : null,
        lastTime: state.current ? audio.currentTime : 0
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        // localStorage indisponível
    }
}

function restoreState() {
    const saved = readSavedState();
    if (!saved.lastPath) {
        updateRowHighlights();
        return;
    }

    const track = findTrack(saved.lastPath);
    if (!track) return;

    const album = albumOfTrack(track);
    state.queue = album ? album.tracks : allTracks();
    state.index = state.queue.findIndex(t => t.path === track.path);
    state.current = track;
    pendingResumeTime = Number(saved.lastTime) || 0;

    audio.src = encodePath(track.path);
    audio.load();

    updatePlayerMeta(track);
    updateRowHighlights();

    const titleEl = document.getElementById('player-title');
    if (titleEl) titleEl.title = 'Última música ouvida (clique no play para continuar)';
}

// ============================================================
//  UTILITÁRIOS
// ============================================================

function encodePath(path) {
    return String(path).split('/').map(encodeURIComponent).join('/');
}

function normalizeText(value) {
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function hueFor(value) {
    let hash = 0;
    const text = String(value || '');
    for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return 200 + (hash % 140); // tons de azul, roxo, rosa e verde
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatTotalDuration(seconds) {
    const totalMinutes = Math.round(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

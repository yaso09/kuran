const state = {
    juzList: [],
    surahs: [],
    currentSurah: null,
    currentSurahData: [],
    risaleIndex: [],
    quranIndex: {},
    quranWords: {},
    quranVerses: [],
    surahCache: {},
    tafsirler: {},
    reciter: 'gamadi',
    translation: 'diyanet',
    isPlayingFull: false,
    currentAudioVerse: -1,
    audioPlayer: new Audio(),
    quranPages: [],
    currentReadingPage: 0,
    readingFontSize: 1.6,     // rem
    readingAudioPlaying: false
};


const surahNames = [
    "Fâtiha", "Bakara", "Âl-i İmrân", "Nisâ", "Mâide", "En'âm", "A'râf", "Enfâl", "Tevbe", "Yûnus",
    "Hûd", "Yûsuf", "Ra'd", "İbrâhîm", "Hicr", "Nahl", "İsrâ", "Kehf", "Meryem", "Tâhâ",
    "Enbiyâ", "Hac", "Mü'minûn", "Nûr", "Furkan", "Şuarâ", "Neml", "Kasas", "Ankebût", "Rûm",
    "Lokmân", "Secde", "Ahzâb", "Sebe'", "Fâtır", "Yâsîn", "Sâffât", "Sâd", "Zümer", "Mü'min",
    "Fussilet", "Şûrâ", "Zuhruf", "Duhân", "Câsiye", "Ahkâf", "Muhammed", "Fetih", "Hucurât", "Kâf",
    "Zâriyât", "Tûr", "Necm", "Kamer", "Rahmân", "Vâkıa", "Hadîd", "Mücâdele", "Haşr", "Mümtehine",
    "Saf", "Cuma", "Münâfikûn", "Teğâbün", "Talâk", "Tahrîm", "Mülk", "Kalem", "Hâkka", "Me'âric",
    "Nûh", "Cin", "Müzzemmil", "Müddessir", "Kıyâme", "İnsân", "Mürselât", "Nebe'", "Nâzi'ât", "Abese",
    "Tekvîr", "İnfitâr", "Mutaffifîn", "İnşikâk", "Bürûc", "Târık", "A'lâ", "Gâşiye", "Fecr", "Beled",
    "Şems", "Leyl", "Duhâ", "İnşirâh", "Tîn", "Alak", "Kadr", "Beyyine", "Zilzâl", "Âdiyât",
    "Kâri'a", "Tekâsür", "Asr", "Hümeze", "Fîl", "Kureyş", "Mâ'ûn", "Kevser", "Kâfirûn", "Nasr",
    "Tebbet", "İhlâs", "Felâk", "Nâs"
];

const arabicSurahNames = [
    "ٱلْفَاتِحَة", "ٱلْبَقَرَة", "آلِ عِمْرَان", "ٱلنِّسَاء", "ٱلْمَائِدَة",
    "ٱلْأَنْعَام", "ٱلْأَعْرَاف", "ٱلْأَنفَال", "ٱلتَّوْبَة", "يُونُس",
    "هُود", "يُوسُف", "ٱلرَّعْد", "إِبْرَاهِيم", "ٱلْحِجْر",
    "ٱلنَّحْل", "ٱلْإِسْرَاء", "ٱلْكَهْف", "مَرْيَم", "طه",
    "ٱلْأَنبِيَاء", "ٱلْحَجّ", "ٱلْمُؤْمِنُون", "ٱلنُّور", "ٱلْفُرْقَان",
    "ٱلشُّعَرَاء", "ٱلنَّمْل", "ٱلْقَصَص", "ٱلْعَنكَبُوت", "ٱلرُّوم",
    "لُقْمَان", "ٱلسَّجْدَة", "ٱلْأَحْزَاب", "سَبَأ", "فَاطِر",
    "يس", "ٱلصَّافَّات", "ص", "ٱلزُّمَر", "غَافِر",
    "فُصِّلَت", "ٱلشُّورَىٰ", "ٱلزُّخْرُف", "ٱلدُّخَان", "ٱلْجَاثِيَة",
    "ٱلْأَحْقَاف", "مُحَمَّد", "ٱلْفَتْح", "ٱلْحُجُرَات", "ق",
    "ٱلذَّارِيَات", "ٱلطُّور", "ٱلنَّجْم", "ٱلْقَمَر", "ٱلرَّحْمَٰن",
    "ٱلْوَاقِعَة", "ٱلْحَدِيد", "ٱلْمُجَادِلَة", "ٱلْحَشْر", "ٱلْمُمْتَحَنَة",
    "ٱلصَّفّ", "ٱلْجُمُعَة", "ٱلْمُنَافِقُون", "ٱلتَّغَابُن", "ٱلطَّلَاق",
    "ٱلتَّحْرِيم", "ٱلْمُلْك", "ٱلْقَلَم", "ٱلْحَاقَّة", "ٱلْمَعَارِج",
    "نُوح", "ٱلْجِنّ", "ٱلْمُزَّمِّل", "ٱلْمُدَّثِّر", "ٱلْقِيَامَة",
    "ٱلْإِنسَان", "ٱلْمُرْسَلَات", "ٱلنَّبَأ", "ٱلنَّازِعَات", "عَبَسَ",
    "ٱلتَّكْوِير", "ٱلْإِنفِطَار", "ٱلْمُطَفِّفِين", "ٱلْإِنشِقَاق", "ٱلْبُرُوج",
    "ٱلطَّارِق", "ٱلْأَعْلَىٰ", "ٱلْغَاشِيَة", "ٱلْفَجْر", "ٱلْبَلَد",
    "ٱلشَّمْس", "ٱللَّيْل", "ٱلضُّحَىٰ", "ٱلشَّرْح", "ٱلتِّين",
    "ٱلْعَلَق", "ٱلْقَدْر", "ٱلْبَيِّنَة", "ٱلزَّلْزَلَة", "ٱلْعَادِيَات",
    "ٱلْقَارِعَة", "ٱلتَّكَاثُر", "ٱلْعَصْر", "ٱلْهُمَزَة", "ٱلْفِيل",
    "قُرَيْش", "ٱلْمَاعُون", "ٱلْكَوْثَر", "ٱلْكَافِرُون", "ٱلنَّصْر",
    "ٱلْمَسَد", "ٱلْإِخْلَاص", "ٱلْفَلَق", "ٱلنَّاس"
];

const DOM = {
    juzList: document.getElementById('juzList'),
    surahList: document.getElementById('surahList'),
    risaleList: document.getElementById('risaleList'),
    tabJuz: document.getElementById('tabJuz'),
    tabSurah: document.getElementById('tabSurah'),
    tabRisale: document.getElementById('tabRisale'),
    versesContainer: document.getElementById('versesContainer'),
    homeView: document.getElementById('homeView'),
    currentSurahTitle: document.getElementById('currentSurahTitle'),
    closeSurahBtn: document.getElementById('closeSurahBtn'),
    reciterSelect: document.getElementById('reciterSelect'),
    translationSelect: document.getElementById('translationSelect'),
    searchInput: document.getElementById('searchInput'),
    audioControls: document.getElementById('audioControls'),
    playAllBtn: document.getElementById('playAllBtn'),
    pauseAudioBtn: document.getElementById('pauseAudioBtn'),
    nowPlayingText: document.getElementById('nowPlayingText'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    appContainer: document.querySelector('.app-container'),
    reciterGroup: document.getElementById('reciterGroup'),
    translationGroup: document.getElementById('translationGroup'),

    // Prayer Times DOM
    prayerTimesContainer: document.getElementById('prayerTimesContainer'),
    prayerLocation: document.getElementById('prayerLocation'),
    prayerDate: document.getElementById('prayerDate'),
    prayerGrid: document.getElementById('prayerGrid'),
    nextPrayerTime: document.getElementById('nextPrayerTime'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    citySearchInput: document.getElementById('citySearchInput'),
    citySearchBtn: document.getElementById('citySearchBtn'),
    locationSearchResults: document.getElementById('locationSearchResults'),

    // Modal DOM
    verseDetailModal: document.getElementById('verseDetailModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalVerseTitle: document.getElementById('modalVerseTitle'),
    modalVerseArabic: document.getElementById('modalVerseArabic'),
    modalVerseTransliteration: document.getElementById('modalVerseTransliteration'),
    modalTranslationList: document.getElementById('modalTranslationList'),
    tafsirSelect: document.getElementById('tafsirSelect'),
    tafsirContent: document.getElementById('tafsirContent'),

    // Reading Mode DOM
    readingModeOverlay: document.getElementById('readingModeOverlay'),
    readingModeContent: document.getElementById('readingModeContent'),
    readingModeBtn: document.getElementById('readingModeBtn'),
    exitReadingModeBtn: document.getElementById('exitReadingModeBtn'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageInfo: document.getElementById('pageInfo'),
    readingAudioBtn: document.getElementById('readingAudioBtn'),
    readingReciterSelect: document.getElementById('readingReciterSelect'),
    uploadMealBtn: document.getElementById('uploadMealBtn'),
    mealFileInput: document.getElementById('mealFileInput'),
    uploadKiraatBtn: document.getElementById('uploadKiraatBtn'),
    kiraatFileInput: document.getElementById('kiraatFileInput'),
    uploadTefsirBtn: document.getElementById('uploadTefsirBtn'),
    tefsirFileInput: document.getElementById('tefsirFileInput'),
    settingsOpenBtn: document.getElementById('settingsOpenBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsModal: document.getElementById('closeSettingsModal'),
    settingsMealsList: document.getElementById('settingsMealsList'),
    settingsKiraatsList: document.getElementById('settingsKiraatsList'),
    settingsTefsirsList: document.getElementById('settingsTefsirsList'),
    refreshRepoBtn: document.getElementById('refreshRepoBtn'),
    repoItemsList: document.getElementById('repoItemsList'),
    repoUrlInput: document.getElementById('repoUrlInput'),
    addRepoBtn: document.getElementById('addRepoBtn'),
    managedReposList: document.getElementById('managedReposList')
};


async function init() {
    await loadJuzData();
    await loadTafsirList();
    await loadRisaleData();
    await loadQuranSearchIndex();
    setupEventListeners();
    renderSidebar();
    renderRisaleList();
    toggleQuranControls(false);
    initPrayerTimes();
    await loadQuranPages();
    initMealUpload();
    await populateTranslations();
    await populateReciters();
    await handleHash();
}

function updateHash(type, id1, id2) {
    if (type === 'surah') {
        window.location.hash = `surah/${id1}`;
    } else if (type === 'risale') {
        window.location.hash = `risale/${id1}/${id2}`;
    } else if (type === 'home') {
        window.location.hash = '';
    }
}

async function handleHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    const parts = hash.split('/');
    if (parts[0] === 'surah') {
        const surahId = parseInt(parts[1]);
        if (surahId) loadSurah(surahId);
    } else if (parts[0] === 'risale') {
        const book = decodeURIComponent(parts[1]);
        const chapter = decodeURIComponent(parts[2]);
        if (book && chapter) loadRisaleChapter(book, chapter);
    }
}

async function populateReciters() {
    try {
        const res = await fetch('okumalar/okumalar.json?t=' + Date.now());
        const data = await res.json();

        const mainSelect = DOM.reciterSelect;
        const readingSelect = DOM.readingReciterSelect;

        if (mainSelect && readingSelect && data) {
            mainSelect.innerHTML = '';
            readingSelect.innerHTML = '';

            for (const [key, name] of Object.entries(data)) {
                const opt1 = document.createElement('option');
                opt1.value = key;
                opt1.innerText = name;
                mainSelect.appendChild(opt1);

                const opt2 = document.createElement('option');
                opt2.value = key;
                opt2.innerText = name;
                readingSelect.appendChild(opt2);
            }

            // Eğer state.reciter önceden ayarlanmışsa (örn gamadi), seçimi koru
            if (data[state.reciter]) {
                mainSelect.value = state.reciter;
                readingSelect.value = state.reciter;
            } else {
                const firstKey = Object.keys(data)[0];
                if (firstKey) {
                    state.reciter = firstKey;
                    mainSelect.value = firstKey;
                    readingSelect.value = firstKey;
                }
            }
        }
    } catch (e) {
        console.error("okumalar.json yüklenirken hata:", e);
    }
}

async function populateTranslations() {
    try {
        const res = await fetch('sureler/1.json?t=' + Date.now());
        const data = await res.json();
        if (data && data.length > 0) {
            const trTranslations = data[0].translations?.tr || {};
            const select = DOM.translationSelect;
            if (!select) return;

            select.innerHTML = ''; // Clear hardcoded and old options

            for (const [key, value] of Object.entries(trTranslations)) {
                const option = document.createElement('option');
                option.value = key;
                option.innerText = value.name || key;
                select.appendChild(option);
            }

            // Re-set selection if it was lost
            if (trTranslations[state.translation]) {
                select.value = state.translation;
            } else {
                const firstKey = Object.keys(trTranslations)[0];
                if (firstKey) {
                    state.translation = firstKey;
                    select.value = firstKey;
                }
            }
        }
    } catch (e) {
        console.error("Mealler yüklenirken hata oluştu:", e);
    }
}


function initMealUpload() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDesktop = urlParams.get('device') === 'desktop';
    const fileManagerPort = urlParams.get('port');
    const isMobile = !!window.cordova;

    if ((isDesktop && fileManagerPort) || isMobile) {
        if (DOM.settingsOpenBtn && DOM.settingsModal) {
            DOM.settingsOpenBtn.style.display = 'block';
            DOM.settingsOpenBtn.addEventListener('click', async () => {
                try {
                    DOM.settingsModal.style.display = 'flex';
                    await loadSettingsData(fileManagerPort);
                    initSettingsTabs();
                    try {
                        renderManagedRepos();
                        loadRepoItems();
                    } catch (e) { }
                } catch (e) {
                    console.error("Ayarlar açılırken hata:", e);
                    // Hata olsa bile modalı göster ki kullanıcı kapatabilsin veya diğer sekmelere bakabilsin
                    DOM.settingsModal.style.display = 'flex';
                }
            });
            DOM.closeSettingsModal.addEventListener('click', () => {
                DOM.settingsModal.style.display = 'none';
            });
        }

        const handleUpload = async (type) => {
            if (isDesktop && window.pywebview && window.pywebview.api && window.pywebview.api.select_file) {
                // DESKTOP NATIVE: Use pywebview to select file by path
                try {
                    const filePath = await window.pywebview.api.select_file(type);
                    if (filePath) {
                        const res = await fetch(`http://localhost:${fileManagerPort}/upload_${type}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: filePath })
                        });
                        if (res.ok) {
                            alert("Başarıyla yüklendi!");
                            window.location.reload();
                        }
                    }
                } catch (e) {
                    alert("Masaüstü yükleme hatası: " + e.message);
                }
            } else {
                // MOBILE or BROWSER: Trigger file input
                const input = type === 'meal' ? DOM.mealFileInput : (type === 'kiraat' ? DOM.kiraatFileInput : DOM.tefsirFileInput);
                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (isMobile) {
                        try {
                            if (typeof MobileFileManager !== 'undefined') {
                                await MobileFileManager.uploadItem(file);
                                alert("Başarıyla yüklendi!");
                                window.location.reload();
                            }
                        } catch (err) {
                            alert("Mobil yükleme hatası: " + err.message);
                        }
                    } else {
                        // Desktop Browser Fallback (send raw bytes)
                        try {
                            const res = await fetch(`http://localhost:${fileManagerPort}/upload_${type}`, {
                                method: 'POST',
                                body: file // Send raw bytes
                            });
                            if (res.ok) {
                                alert("Başarıyla yüklendi!");
                                window.location.reload();
                            }
                        } catch (err) {
                            alert("Yükleme hatası: " + err.message);
                        }
                    }
                };
                input.click();
            }
        };

        if (DOM.uploadMealBtn) DOM.uploadMealBtn.onclick = () => handleUpload('meal');
        if (DOM.uploadKiraatBtn) DOM.uploadKiraatBtn.onclick = () => handleUpload('kiraat');
        if (DOM.uploadTefsirBtn) DOM.uploadTefsirBtn.onclick = () => handleUpload('tefsir');
    }
}

function initSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab-btn');
    const contents = document.querySelectorAll('.settings-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderBottom = '3px solid transparent';
            });
            contents.forEach(c => c.style.display = 'none');

            tab.classList.add('active');
            tab.style.borderBottom = '3px solid #7b2a1a';
            document.getElementById(target).style.display = 'block';
        });
    });
}

function renderManagedRepos() {
    const repos = JSON.parse(localStorage.getItem('kuran_repos') || '["yaso09/kuran"]');
    DOM.managedReposList.innerHTML = '';
    repos.forEach(repo => {
        const li = document.createElement('li');
        li.style.cssText = 'display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; align-items:center; font-size:0.9rem; background:#fafafa;';
        li.innerHTML = `
            <span>${repo}</span>
            <button class="delete-repo-btn" data-repo="${repo}" style="background:none; border:none; color:#7b2a1a; cursor:pointer; font-weight:bold;">Sil</button>
        `;
        li.querySelector('.delete-repo-btn').onclick = (e) => {
            const r = e.target.dataset.repo;
            const updated = repos.filter(item => item !== r);
            localStorage.setItem('kuran_repos', JSON.stringify(updated));
            renderManagedRepos();
            loadRepoItems();
        };
        DOM.managedReposList.appendChild(li);
    });
}

async function loadRepoItems() {
    let repos = [];
    try {
        repos = JSON.parse(localStorage.getItem('kuran_repos') || '["yaso09/kuran"]');
    } catch (e) {
        repos = ["yaso09/kuran"];
    }

    DOM.repoItemsList.innerHTML = '<li style="padding:20px; text-align:center; color:#888;">Depolar taranıyor...</li>';

    let hasItems = false;
    const tempItems = [];

    const errorMessages = [];

    for (const repo of repos) {
        try {
            const apiUrl = `https://api.github.com/repos/${repo}/contents/extras`;
            const res = await fetch(apiUrl);

            if (!res.ok) {
                const errorText = res.status === 404 ? "Klasör bulunamadı (/extras)" : `Hata: ${res.status}`;
                errorMessages.push(`<li style="padding:10px; color:#721c24; background:#f8d7da; border-bottom:1px solid #f5c6cb; font-size:0.8rem;">❌ <b>${repo}:</b> ${errorText}</li>`);
                continue;
            } else {

                const files = await res.json();
                if (!Array.isArray(files)) continue;

                const filteredFiles = files.filter(f => f.name && (f.name.endsWith('.meal') || f.name.endsWith('.kiraat') || f.name.endsWith('.tefsir')));

                for (const file of filteredFiles) {
                    tempItems.push({ ...file, repo });
                    hasItems = true;
                }
            }
        } catch (e) {
            errorMessages.push(`<li style="padding:10px; color:#721c24; background:#f8d7da; border-bottom:1px solid #f5c6cb; font-size:0.8rem;">⚠️ <b>${repo}:</b> Bağlantı hatası</li>`);
        }
    }

    DOM.repoItemsList.innerHTML = errorMessages.join('') + (tempItems.length === 0 && errorMessages.length === 0 ? '<li style="padding:20px; text-align:center; color:#888;">Şu an için indirilebilir içerik bulunamadı.</li>' : '');

    if (tempItems.length > 0) {
        tempItems.forEach(file => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid #eee; align-items:center; font-size:0.85rem; transition: background 0.2s;';
            li.onmouseover = () => li.style.background = '#f9f9f9';
            li.onmouseout = () => li.style.background = 'transparent';

            const type = file.name.endsWith('.meal') ? 'Meal' : (file.name.endsWith('.kiraat') ? 'Kıraat' : 'Tefsir');
            const color = type === 'Meal' ? '#632314' : (type === 'Kıraat' ? '#2b3a42' : '#3b422b');

            li.innerHTML = `
            <div style="flex:1; overflow:hidden;">
                <div style="display:flex; align-items:center;">
                    <span style="background:${color}; color:white; padding:2px 6px; border-radius:3px; font-size:0.65rem; margin-right:8px; font-weight:bold;">${type}</span>
                    <span style="font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${file.name}">${file.name}</span>
                </div>
                <div style="font-size:0.7rem; color:#888; margin-top:2px;">Kaynak: ${file.repo}</div>
            </div>
            <button class="repo-install-btn" style="background:#2b422b; color:white; border:none; border-radius:4px; padding:6px 12px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Yükle</button>
        `;

            li.querySelector('.repo-install-btn').onclick = (e) => installFromRepo(file.download_url, file.name, e.target);
            DOM.repoItemsList.appendChild(li);
        });
    }
}

async function installFromRepo(url, fileName, btn) {
    const oldText = btn.innerText;
    btn.innerText = "⏳ İndiriliyor...";
    btn.disabled = true;

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], fileName);

        const isDesktop = urlParams.get('device') === 'desktop';
        const fileManagerPort = urlParams.get('port');

        if (isDesktop && fileManagerPort) {
            const formData = new FormData();
            formData.append('file', file);
            const uploadUrl = fileName.endsWith('.meal') ? '/upload_meal' : (fileName.endsWith('.kiraat') ? '/upload_kiraat' : '/upload_tefsir');
            const res = await fetch(`http://127.0.0.1:${fileManagerPort}${uploadUrl}`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert(`${fileName} başarıyla yüklendi!`);
                window.location.reload();
            } else {
                throw new Error("Yükleme başarısız");
            }
        } else if (window.cordova) {
            if (typeof MobileFileManager !== 'undefined') {
                await MobileFileManager.uploadItem(file);
                alert(`${fileName} başarıyla yüklendi!`);
                window.location.reload();
            }
        }
    } catch (e) {
        alert("Hata oluştu: " + e.message);
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

async function loadSettingsData(port) {
    // Mealler
    try {
        const res = await fetch('sureler/1.json?t=' + Date.now());
        const data = await res.json();
        const trTranslations = data[0].translations?.tr || {};
        DOM.settingsMealsList.innerHTML = '';
        for (const [key, value] of Object.entries(trTranslations)) {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #ddd; align-items:center;';
            li.innerHTML = `<span>${value.name || key} (${key})</span> <button style="background:red; color:white; border:none; border-radius:3px; padding:4px 8px; cursor:pointer;">Sil</button>`;
            li.querySelector('button').onclick = () => deleteItem('meal', key, port);
            DOM.settingsMealsList.appendChild(li);
        }
    } catch (e) {
        DOM.settingsMealsList.innerHTML = '<li>Yüklenirken hata oluştu.</li>';
    }

    // Kıraatlar
    try {
        const res = await fetch('okumalar/okumalar.json?t=' + Date.now());
        const data = await res.json();
        DOM.settingsKiraatsList.innerHTML = '';
        for (const [key, name] of Object.entries(data)) {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #ddd; align-items:center;';
            li.innerHTML = `<span>${name} (${key})</span> <button style="background:red; color:white; border:none; border-radius:3px; padding:4px 8px; cursor:pointer;">Sil</button>`;
            li.querySelector('button').onclick = () => deleteItem('kiraat', key, port);
            DOM.settingsKiraatsList.appendChild(li);
        }
    } catch (e) {
        DOM.settingsKiraatsList.innerHTML = '<li>Yüklenirken hata oluştu.</li>';
    }

    // Tefsirler
    try {
        const res = await fetch('tefsirler/tefsirler.json?t=' + Date.now());
        const data = await res.json();
        DOM.settingsTefsirsList.innerHTML = '';
        for (const [key, name] of Object.entries(data)) {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #ddd; align-items:center;';
            li.innerHTML = `<span>${name} (${key})</span> <button style="background:red; color:white; border:none; border-radius:3px; padding:4px 8px; cursor:pointer;">Sil</button>`;
            li.querySelector('button').onclick = () => deleteItem('tefsir', key, port);
            DOM.settingsTefsirsList.appendChild(li);
        }
    } catch (e) {
        DOM.settingsTefsirsList.innerHTML = '<li>Yüklenirken hata oluştu.</li>';
    }

    // Global UI listelerini yenile
    await loadTafsirList();
    await populateTranslations();
    await populateReciters();

    // Önbelleği temizle ve varsa açık sureyi tazele
    state.surahCache = {};
    if (state.currentSurah) {
        loadSurah(state.currentSurah);
    }
}

async function deleteItem(type, id, port) {
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`http://localhost:${port}/delete_item`, {
            method: 'POST',
            body: JSON.stringify({ type, id })
        });
        const data = await res.json();
        if (data.status === 'success') {
            window.location.reload();
        } else {
            alert('Silme hatası: ' + data.message);
        }
    } catch (e) {
        alert('Bağlantı hatası: ' + e);
    }
}

async function loadQuranSearchIndex() {
    try {
        const [resIdx, resWords, resVerses] = await Promise.all([
            fetch('quran_index.json'),
            fetch('quran_words.json'),
            fetch('quran_verses.json')
        ]);
        state.quranIndex = await resIdx.json();
        state.quranWords = await resWords.json();
        state.quranVerses = await resVerses.json();
    } catch (e) {
        console.error("Quran indexleri yüklenemedi", e);
    }
}

async function loadQuranPages() {
    try {
        const res = await fetch('number_of_verses_per_page.json');
        state.quranPages = await res.json();
    } catch (e) {
        console.error("Quran sayfaları yüklenemedi", e);
    }
}

async function loadRisaleData() {
    try {
        const res = await fetch('risaleinur/index.json');
        state.risaleIndex = await res.json();
    } catch (e) {
        console.error("Risale indexi yüklenemedi", e);
    }
}

async function loadTafsirList() {
    try {
        const res = await fetch('tefsirler/tefsirler.json?t=' + Date.now());
        state.tafsirler = await res.json();
    } catch (e) {
        console.error("Tefsir listesi yüklenemedi", e);
    }
}

async function loadJuzData() {
    try {
        const res = await fetch('juz.json');
        state.juzList = await res.json();
    } catch (e) {
        console.error('Juz verisi yüklenemedi:', e);
    }
}

function setupEventListeners() {
    DOM.menuToggleBtn.addEventListener('click', () => {
        DOM.appContainer.classList.toggle('sidebar-open');
    });

    DOM.closeSidebarBtn.addEventListener('click', () => {
        DOM.appContainer.classList.remove('sidebar-open');
    });

    DOM.citySearchBtn.addEventListener('click', () => {
        const city = DOM.citySearchInput.value.trim();
        if (city) searchCity(city);
    });

    // Search as you type with debounce
    const debouncedSearch = debounce((city) => {
        if (city.length >= 2) searchCity(city);
        else {
            DOM.locationSearchResults.style.display = 'none';
            if (!city) DOM.prayerLocation.innerText = state.lastCoords ? state.lastCoords.label : "Konum Seçilmedi";
        }
    }, 600);

    DOM.citySearchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
    });

    DOM.refreshRepoBtn.addEventListener('click', () => loadRepoItems());

    DOM.addRepoBtn.addEventListener('click', () => {
        const newRepo = DOM.repoUrlInput.value.trim();
        if (newRepo) {
            const repos = JSON.parse(localStorage.getItem('kuran_repos') || '["yaso09/kuran"]');
            if (!repos.includes(newRepo)) {
                repos.push(newRepo);
                localStorage.setItem('kuran_repos', JSON.stringify(repos));
                DOM.repoUrlInput.value = '';
                renderManagedRepos();
                loadRepoItems();
            }
        }
    });

    DOM.citySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = DOM.citySearchInput.value.trim();
            if (city) searchCity(city);
        }
    });

    document.addEventListener('click', (e) => {
        if (DOM.locationSearchResults && !DOM.locationSearchResults.contains(e.target) && e.target !== DOM.citySearchInput) {
            DOM.locationSearchResults.style.display = 'none';
        }
    });

    DOM.closeModalBtn.addEventListener('click', () => {
        DOM.verseDetailModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === DOM.verseDetailModal) {
            DOM.verseDetailModal.style.display = 'none';
        }
    });

    // Mobile specific setup
    document.addEventListener('deviceready', async () => {
        console.log("Cordova deviceready fired");
        if (typeof MobileFileManager !== 'undefined') {
            await MobileFileManager.init();
        }
        initMealUpload();
        initPrayerTimes();
        handleHash();
    }, false);

    // PyWebView API event check
    window.addEventListener('pywebviewready', function () {
        if (window.pywebview && window.pywebview.api) {
            initMealUpload();
        }
    });

    const guiUpdateBtn = document.getElementById('guiUpdateBtn');
    if (guiUpdateBtn) {
        guiUpdateBtn.addEventListener('click', async () => {
            const confirmed = confirm("Sistemi internetten en yeni sürüme güncellemek istediğinize emin misiniz? (İşlem bitince ekran kapanacaktır)");
            if (!confirmed) return;

            guiUpdateBtn.innerText = "⏳ İndiriliyor, bekleyin...";
            guiUpdateBtn.style.pointerEvents = "none";
            guiUpdateBtn.style.opacity = "0.7";

            try {
                const res = await window.pywebview.api.trigger_update();
                if (res.status === 'success') {
                    alert("✅ " + res.message);
                    window.pywebview.api.exit_app();
                } else {
                    alert("❌ Hata: " + res.message);
                    guiUpdateBtn.innerText = "🔄 Güncelle";
                    guiUpdateBtn.style.pointerEvents = "auto";
                    guiUpdateBtn.style.opacity = "1";
                }
            } catch (e) {
                alert("Bağlantı hatası: " + e);
                guiUpdateBtn.innerText = "🔄 Güncelle";
                guiUpdateBtn.style.pointerEvents = "auto";
                guiUpdateBtn.style.opacity = "1";
            }
        });
    }

    DOM.reciterSelect.addEventListener('change', (e) => {
        state.reciter = e.target.value;
        if (DOM.readingReciterSelect) DOM.readingReciterSelect.value = state.reciter;
        stopAudio();
    });


    DOM.translationSelect.addEventListener('change', (e) => {
        state.translation = e.target.value;
        if (state.currentSurah) {
            renderVerses();
        }
    });

    DOM.searchInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        Array.from(document.querySelectorAll('.surah-item')).forEach(item => {
            const name = item.dataset.name.toLowerCase();
            if (name.includes(val)) {
                item.style.display = 'flex';
                // Eğer Cüz görünümündeyse, ebeveyn cüzün açık kalması için:
                const juzItem = item.closest('.juz-item');
                if (juzItem) juzItem.classList.add('active');
            } else {
                item.style.display = 'none';
            }
        });
    });

    DOM.tabJuz.addEventListener('click', () => {
        DOM.tabJuz.classList.add('active');
        DOM.tabSurah.classList.remove('active');
        DOM.juzList.style.display = 'block';
        DOM.surahList.style.display = 'none';
    });

    DOM.tabSurah.addEventListener('click', () => {
        DOM.tabSurah.classList.add('active');
        DOM.tabJuz.classList.remove('active');
        DOM.tabRisale.classList.remove('active');
        DOM.surahList.style.display = 'block';
        DOM.juzList.style.display = 'none';
        DOM.risaleList.style.display = 'none';
    });

    DOM.tabRisale.addEventListener('click', () => {
        DOM.tabRisale.classList.add('active');
        DOM.tabJuz.classList.remove('active');
        DOM.tabSurah.classList.remove('active');
        DOM.risaleList.style.display = 'block';
        DOM.juzList.style.display = 'none';
        DOM.surahList.style.display = 'none';
    });

    DOM.closeSurahBtn.addEventListener('click', () => {
        stopAudio();
        state.currentSurah = null;
        DOM.currentSurahTitle.innerText = "Lütfen bir sure seçin";
        DOM.closeSurahBtn.style.display = 'none';
        DOM.readingModeBtn.style.display = 'none';
        DOM.audioControls.style.display = 'none';
        toggleQuranControls(false);
        DOM.versesContainer.style.display = 'none';
        DOM.homeView.style.display = 'block';
        document.querySelectorAll('.surah-item').forEach(item => item.classList.remove('active'));
        updateHash('home');
    });

    DOM.playAllBtn.addEventListener('click', () => {
        if (!state.currentSurah) return;
        state.isPlayingFull = true;
        DOM.playAllBtn.style.display = 'none';
        DOM.pauseAudioBtn.style.display = 'inline-block';
        if (state.currentAudioVerse === -1) {
            playVerse(0);
        } else {
            state.audioPlayer.play();
        }
    });

    DOM.pauseAudioBtn.addEventListener('click', () => {
        state.isPlayingFull = false;
        state.audioPlayer.pause();
        DOM.playAllBtn.style.display = 'inline-block';
        DOM.pauseAudioBtn.style.display = 'none';
        DOM.nowPlayingText.innerText = `Duraklatıldı`;
    });

    state.audioPlayer.addEventListener('ended', () => {
        document.querySelectorAll('.verse-item').forEach(v => v.classList.remove('playing'));

        if (state.isPlayingFull) {
            if (state.currentAudioVerse < state.currentSurahData.length - 1) {
                playVerse(state.currentAudioVerse + 1);
            } else {
                stopAudio();
            }
        }
    });

    DOM.readingModeBtn.addEventListener('click', enterReadingMode);
    DOM.exitReadingModeBtn.addEventListener('click', exitReadingMode);

    // Ok tuşlarıyla sayfa değiştirme (Kur'an sağdan sola: sol ok = sonraki, sağ ok = önceki)
    document.addEventListener('keydown', (e) => {
        if (DOM.readingModeOverlay.style.display === 'none' || !DOM.readingModeOverlay.style.display) return;
        if (e.key === 'ArrowLeft') {
            if (state.currentReadingPage < state.quranPages.length - 1) {
                state.currentReadingPage++;
                renderReadingPage();
            }
        } else if (e.key === 'ArrowRight') {
            if (state.currentReadingPage > 0) {
                state.currentReadingPage--;
                renderReadingPage();
            }
        }
    });

    // Kur'an sağdan sola: prevPageBtn (sağda) = önceki sayfa, nextPageBtn (solda) = sonraki sayfa
    DOM.prevPageBtn.addEventListener('click', () => {
        if (state.currentReadingPage > 0) {
            state.currentReadingPage--;
            renderReadingPage();
        }
    });
    DOM.nextPageBtn.addEventListener('click', () => {
        if (state.currentReadingPage < state.quranPages.length - 1) {
            state.currentReadingPage++;
            renderReadingPage();
        }
    });

    DOM.readingAudioBtn.addEventListener('click', () => {
        if (state.readingAudioPlaying) {
            stopAudio();
            state.readingAudioPlaying = false;
            DOM.readingAudioBtn.classList.remove('is-playing');
            DOM.readingAudioBtn.querySelector('.btn-icon').textContent = '🔊';
            DOM.readingAudioBtn.querySelector('.btn-label').textContent = 'Dinle';
        } else {
            // Sayfadaki ilk sureyi bul ve başlat
            const page = state.quranPages[state.currentReadingPage];
            if (page && page.length > 0) {
                const firstVerse = page[0];
                if (state.currentSurah === firstVerse.sure) {
                    const verseIdx = state.currentSurahData.findIndex(v => v.ayet === firstVerse.ayet);
                    if (verseIdx >= 0) {
                        state.isPlayingFull = true;
                        state.readingAudioPlaying = true;
                        DOM.readingAudioBtn.classList.add('is-playing');
                        DOM.readingAudioBtn.querySelector('.btn-icon').textContent = '⏸';
                        DOM.readingAudioBtn.querySelector('.btn-label').textContent = 'Duraklat';
                        playVerse(verseIdx);
                    }
                }
            }
        }
    });

    DOM.readingReciterSelect.value = state.reciter;
    DOM.readingReciterSelect.addEventListener('change', (e) => {
        state.reciter = e.target.value;
        // Also sync main reciter dropdown
        if (DOM.reciterSelect) DOM.reciterSelect.value = state.reciter;
        stopAudio();
    });



    // Font size: mouse wheel (desktop)
    DOM.readingModeOverlay.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return; // Only with Ctrl held, or always:
        e.preventDefault();
        state.readingFontSize = Math.min(3.5, Math.max(0.8, state.readingFontSize - e.deltaY * 0.002));
        applyReadingFontSize();
    }, { passive: false });

    // Also allow plain scroll wheel without Ctrl for convenience
    DOM.readingModeOverlay.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        // do nothing extra — reserved for page scroll
    }, { passive: true });

    // Font size: pinch gesture (mobile)
    let _pinchDist = null;
    DOM.readingModeOverlay.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            _pinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });
    DOM.readingModeOverlay.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && _pinchDist !== null) {
            const newDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = newDist / _pinchDist;
            _pinchDist = newDist;
            state.readingFontSize = Math.min(3.5, Math.max(0.8, state.readingFontSize * scale));
            applyReadingFontSize();
        }
    }, { passive: true });
    DOM.readingModeOverlay.addEventListener('touchend', () => { _pinchDist = null; }, { passive: true });
}

function applyReadingFontSize() {
    DOM.readingModeContent.querySelectorAll('.reading-arabic-line').forEach(el => {
        el.style.fontSize = state.readingFontSize.toFixed(2) + 'rem';
    });
}


function renderSidebar() {
    DOM.juzList.innerHTML = '';
    DOM.surahList.innerHTML = '';

    // Cüz Listesini Oluştur
    state.juzList.forEach(juz => {
        const li = document.createElement('li');
        li.className = 'juz-item';

        const header = document.createElement('div');
        header.className = 'juz-header';
        header.innerText = `Cüz ${juz.index}`;

        const ul = document.createElement('ul');
        ul.className = 'surah-list';

        let startSure = parseInt(juz.start.index);
        let endSure = parseInt(juz.end.index);

        for (let i = startSure; i <= endSure; i++) {
            const surahLi = document.createElement('li');
            surahLi.className = 'surah-item';
            surahLi.dataset.index = i;
            surahLi.dataset.name = surahNames[i - 1];

            const spanName = document.createElement('span');
            spanName.innerText = `${i}. ${surahNames[i - 1]}`;

            let sVerse = (i === startSure) ? parseInt(juz.start.verse) : 1;
            let eVerse = (i === endSure) ? parseInt(juz.end.verse) : 'son';

            const spanCount = document.createElement('span');
            spanCount.className = 'surah-number';
            if (eVerse === 'son') {
                spanCount.innerText = sVerse === 1 ? 'Tamamı' : `${sVerse} - Son`;
            } else {
                spanCount.innerText = `${sVerse}-${eVerse}`;
            }

            surahLi.appendChild(spanName);
            surahLi.appendChild(spanCount);

            surahLi.addEventListener('click', () => {
                document.querySelectorAll('.surah-item').forEach(item => item.classList.remove('active'));
                surahLi.classList.add('active');
                loadSurah(i, sVerse, eVerse);
            });
            ul.appendChild(surahLi);
        }

        header.addEventListener('click', () => {
            li.classList.toggle('active');
        });

        li.appendChild(header);
        li.appendChild(ul);
        DOM.juzList.appendChild(li);
    });

    // Düz Sure Listesini Oluştur
    for (let i = 1; i <= 114; i++) {
        const surahLi = document.createElement('li');
        surahLi.className = 'surah-item';
        surahLi.dataset.index = i;
        surahLi.dataset.name = surahNames[i - 1];

        const spanName = document.createElement('span');
        spanName.innerText = `${i}. ${surahNames[i - 1]}`;

        surahLi.appendChild(spanName);

        surahLi.addEventListener('click', () => {
            document.querySelectorAll('.surah-item').forEach(item => item.classList.remove('active'));
            surahLi.classList.add('active');
            loadSurah(i, 1, 'son');
        });

        DOM.surahList.appendChild(surahLi);
    }
}

async function loadSurah(index, startVerse = 1, endVerse = 'son') {
    try {
        DOM.appContainer.classList.remove('sidebar-open');
        stopAudio();
        DOM.homeView.style.display = 'none';
        DOM.versesContainer.style.display = 'block';
        DOM.versesContainer.innerHTML = '<p style="padding: 20px; color: #5d4f3b;">Yükleniyor...</p>';
        const res = await fetch(`sureler/${index}.json`);
        let data = await res.json();

        // Filter by verse range
        data = data.filter(v => {
            let vNum = parseInt(v.ayet);
            if (vNum < startVerse) return false;
            if (endVerse !== 'son' && vNum > endVerse) return false;
            return true;
        });

        state.currentSurahData = data;
        state.currentSurah = index;

        let titleSuffix = '';
        if (startVerse > 1 || endVerse !== 'son') {
            titleSuffix = ` (${startVerse}. - ${endVerse === 'son' ? 'Sonuncu' : endVerse + '.'} Ayetler)`;
        }

        DOM.currentSurahTitle.innerText = `${index}. ${surahNames[index - 1]}${titleSuffix}`;
        DOM.closeSurahBtn.style.display = 'inline-block';
        DOM.readingModeBtn.style.display = 'inline-block';
        DOM.audioControls.style.display = 'flex';
        toggleQuranControls(true);
        renderVerses();
        updateHash('surah', index);
    } catch (e) {
        console.error('Sure yüklenemedi:', e);
        DOM.versesContainer.innerHTML = '<p style="padding: 20px; color: #b83318;">Sure yüklenirken bir hata oluştu.</p>';
        DOM.audioControls.style.display = 'none';
        state.currentSurah = null;
    }
}

function renderVerses() {
    DOM.versesContainer.innerHTML = '';

    state.currentSurahData.forEach((verseData, index) => {
        const div = document.createElement('div');
        div.className = 'verse-item';
        div.id = `verse-${index}`;

        const header = document.createElement('div');
        header.className = 'verse-header';

        const vNum = document.createElement('span');
        vNum.className = 'verse-number';
        vNum.innerText = `Ayet ${verseData.ayet}`;

        const btn = document.createElement('button');
        btn.className = 'audio-btn';
        btn.innerText = '🔊 Dinle';
        btn.onclick = () => {
            playVerse(index);
        };

        const tafsirBtn = document.createElement('button');
        tafsirBtn.className = 'audio-btn';
        tafsirBtn.innerText = '📖 Tefsir / Detay';
        tafsirBtn.style.marginLeft = '10px';
        tafsirBtn.onclick = () => {
            openVerseDetail(state.currentSurah, verseData.ayet);
        };

        const btnGroup = document.createElement('div');
        btnGroup.appendChild(btn);
        btnGroup.appendChild(tafsirBtn);

        header.appendChild(vNum);
        header.appendChild(btnGroup);

        const arabicStr = verseData.words.map(w =>
            `<span class="word-span" data-meaning="${escapeHtml(w.meaning || '')}">${escapeHtml(w.text)}</span>`
        ).join(' ');

        const arabic = document.createElement('div');
        arabic.className = 'arabic-text';
        arabic.innerHTML = arabicStr;

        const trans = document.createElement('div');
        trans.className = 'transliteration';
        trans.innerText = verseData.transliteration;

        const mealData = verseData.translations?.tr?.[state.translation];
        const meal = document.createElement('div');
        meal.className = 'translation-text';
        meal.innerText = mealData ? mealData.text : 'Meal bulunamadı.';

        div.appendChild(header);
        div.appendChild(arabic);
        div.appendChild(trans);
        div.appendChild(meal);

        DOM.versesContainer.appendChild(div);
    });
}

function playVerse(index) {
    const verseData = state.currentSurahData[index];
    const surahPadded = String(state.currentSurah).padStart(3, '0');
    const versePadded = String(verseData.ayet).padStart(3, '0');

    const src = `okumalar/${state.reciter}/${surahPadded}/${versePadded}.mp3`;

    state.audioPlayer.src = src;
    state.currentAudioVerse = index;
    state.audioPlayer.play().catch(e => console.error("Ses çalınamadı:", e));

    document.querySelectorAll('.verse-item').forEach(v => v.classList.remove('playing'));
    const currentVerseEl = document.getElementById(`verse-${index}`);
    if (currentVerseEl) {
        currentVerseEl.classList.add('playing');
        currentVerseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    DOM.nowPlayingText.innerText = `Ayet ${verseData.ayet} okunuyor...`;
}

function stopAudio() {
    state.audioPlayer.pause();
    state.isPlayingFull = false;
    state.currentAudioVerse = -1;
    DOM.playAllBtn.style.display = 'inline-block';
    DOM.pauseAudioBtn.style.display = 'none';
    DOM.nowPlayingText.innerText = '';
    document.querySelectorAll('.verse-item').forEach(v => v.classList.remove('playing'));
}

async function openVerseDetail(surahId, verseNum) {
    let verseData = null;

    // Eğer o surenin verisi hali hazırda yoksa veya farklı bir sureyse yükle
    if (state.currentSurah !== surahId) {
        try {
            const res = await fetch(`sureler/${surahId}.json`);
            const data = await res.json();
            verseData = data.find(v => parseInt(v.ayet) === parseInt(verseNum));
        } catch (e) {
            console.error("Sure verisi yüklenemedi", e);
            return;
        }
    } else {
        verseData = state.currentSurahData.find(v => parseInt(v.ayet) === parseInt(verseNum));
    }

    if (!verseData) return;

    // Fill basic details
    DOM.modalVerseTitle.innerText = `${surahNames[surahId - 1]} Suresi - ${verseNum}. Ayet`;

    // Arabic + meanings
    const arabicStr = verseData.words.map(w =>
        `<span class="word-span" data-meaning="${escapeHtml(w.meaning || '')}">${escapeHtml(w.text)}</span>`
    ).join(' ');
    DOM.modalVerseArabic.innerHTML = arabicStr;
    DOM.modalVerseTransliteration.innerText = verseData.transliteration;

    // Translations
    DOM.modalTranslationList.innerHTML = '';
    if (verseData.translations && verseData.translations.tr) {
        for (const [key, value] of Object.entries(verseData.translations.tr)) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${escapeHtml(value.name)}</strong> ${escapeHtml(value.text)}`;
            DOM.modalTranslationList.appendChild(li);
        }
    }

    // Tafsirs dropdown
    DOM.tafsirSelect.innerHTML = '';
    let firstTafsirId = null;
    for (const [folder, name] of Object.entries(state.tafsirler)) {
        if (!firstTafsirId) firstTafsirId = folder;
        const option = document.createElement('option');
        option.value = folder;
        option.innerText = name;
        DOM.tafsirSelect.appendChild(option);
    }

    DOM.tafsirSelect.onchange = () => {
        loadTafsirContent(surahId, verseNum, DOM.tafsirSelect.value);
    };

    // Default load
    if (firstTafsirId) {
        loadTafsirContent(surahId, verseNum, firstTafsirId);
    } else {
        DOM.tafsirContent.innerHTML = '<p>Bilinmeyen veya tanımlı olmayan tefsir listesi.</p>';
    }

    DOM.verseDetailModal.style.display = 'flex';
}

async function loadTafsirContent(surahId, verseId, tafsirFolder) {
    DOM.tafsirContent.innerHTML = '<p style="font-style: italic; color: #5d4f3b;">Tefsir yükleniyor...</p>';
    try {
        const res = await fetch(`tefsirler/${tafsirFolder}/${surahId}/${verseId}.htm`);
        if (!res.ok) throw new Error('Not found');
        const htmlText = await res.text();
        DOM.tafsirContent.innerHTML = htmlText;
    } catch (e) {
        DOM.tafsirContent.innerHTML = '<p style="color:#b83318; font-weight: bold;">Bu ayet için bu tefsirde (veya seçilen kaynakta) kayıt bulunamadı.</p>';
    }
}

function renderRisaleList() {
    if (!DOM.risaleList) return;
    DOM.risaleList.innerHTML = '';
    state.risaleIndex.forEach(book => {
        const li = document.createElement('li');
        li.className = 'juz-item';

        const header = document.createElement('div');
        header.className = 'juz-header';
        header.innerText = book.book;

        const ul = document.createElement('ul');
        ul.className = 'surah-list';

        book.chapters.forEach(ch => {
            const chLi = document.createElement('li');
            chLi.className = 'surah-item';

            const spanName = document.createElement('span');
            spanName.innerText = ch.name;
            chLi.appendChild(spanName);

            chLi.dataset.name = ch.name;

            chLi.addEventListener('click', () => {
                document.querySelectorAll('.surah-item').forEach(item => item.classList.remove('active'));
                chLi.classList.add('active');
                loadRisaleChapter(book.path, ch.filename, book.book + " - " + ch.name);
            });
            ul.appendChild(chLi);
        });

        header.addEventListener('click', () => {
            li.classList.toggle('active');
        });

        li.appendChild(header);
        li.appendChild(ul);
        DOM.risaleList.appendChild(li);
    });

    // Risale içeriğindeki ayetleri yakala
    DOM.versesContainer.addEventListener('click', (e) => {
        // Sadece risale modundaysak
        if (state.currentSurah === null) {
            let text = e.target.innerText.trim();
            let normText = normalizeArabic(text);

            // Eğer direkt eşleşme yoksa, parent'ı da kontrol et (örn: strong içindeyse)
            if (!state.quranIndex[normText] && e.target.parentElement) {
                text = e.target.parentElement.innerText.trim();
                normText = normalizeArabic(text);
            }

            if (state.quranIndex[normText]) {
                const ref = state.quranIndex[normText];
                openVerseDetail(ref.s, ref.a);
            }
        }
    });
}

function normalizeArabic(text) {
    if (!text) return "";
    // Kur'an durak işaretlerini temizle (U+06D6 - U+06ED)
    return text.replace(/[\u06D6-\u06ED]/g, '').replace(/\s+/g, ' ').trim();
}

async function loadRisaleChapter(bookPath, fileName, title) {
    try {
        DOM.appContainer.classList.remove('sidebar-open');
        stopAudio();
        DOM.homeView.style.display = 'none';
        DOM.versesContainer.style.display = 'block';
        DOM.versesContainer.innerHTML = '<p style="padding: 20px; color: #5d4f3b;">Yükleniyor...</p>';

        const res = await fetch(`risaleinur/${encodeURIComponent(bookPath)}/${encodeURIComponent(fileName)}`);
        const html = await res.text();

        DOM.currentSurahTitle.innerText = title;
        DOM.closeSurahBtn.style.display = 'inline-block';
        DOM.audioControls.style.display = 'none';
        toggleQuranControls(false);
        state.currentSurah = null;

        DOM.versesContainer.innerHTML = `
            <div class="risale-container" style="padding: 30px; background-color: var(--paper-color); border: 1px outset var(--border-color); box-shadow: 2px 2px 5px rgba(0,0,0,0.05);">
                <div class="risale-content" style="line-height: 1.8; font-size: 1.15rem; text-align: left; direction: ltr;">
                    ${html}
                </div>
            </div>
        `;
        DOM.versesContainer.scrollTop = 0;

        // Ayetleri zenginleştir
        await enrichRisaleContent(DOM.versesContainer.querySelector('.risale-content'));
        updateHash('risale', bookPath, fileName);

    } catch (e) {
        console.error('Risale yüklenemedi:', e);
        DOM.versesContainer.innerHTML = '<p style="padding: 20px; color: #b83318;">İçerik yüklenirken bir hata oluştu.</p>';
    }
}

async function enrichRisaleContent(container) {
    if (!container || !state.quranIndex || !state.quranWords) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        // Eğer zaten işlenmiş bir elementin içindeyse atla
        if (node.parentElement.closest('.enriched, .word-span, .risale-verse-active')) continue;

        // Arapça karakter içeriyor mu?
        if (/[\u0600-\u06FF]/.test(node.nodeValue)) {
            nodesToReplace.push(node);
        }
    }

    for (const node of nodesToReplace) {
        processArabicTextNode(node);
    }
}

function processArabicTextNode(textNode) {
    const text = textNode.nodeValue;
    // Arapça olan ve olmayan kısımları ayır
    // Bu regex Arapça karakterleri ve aralarındaki boşlukları/işaretleri yakalar
    const regex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u06D6-\u06ED\s]{2,})/g;

    let lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Önceki normal metni ekle
        if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }

        const arabicPart = match[0];
        const trimmedArabic = arabicPart.trim();

        if (trimmedArabic.length > 0) {
            const normMatch = normalizeArabic(trimmedArabic);
            const words = trimmedArabic.split(/\s+/).filter(w => w.length > 0);
            const normWords = normMatch.split(/\s+/).filter(w => w.length > 0);

            const bestVerse = findBestVerseMatch(normMatch, normWords.length);

            // BDI etiketi BiDi izolasyonu için en güvenlisidir
            const bdi = document.createElement('bdi');
            bdi.dir = 'rtl';

            if (bestVerse) {
                bdi.className = 'risale-verse-active';
                bdi.onclick = (e) => {
                    e.stopPropagation();
                    openVerseDetail(bestVerse.s, bestVerse.a);
                };
                bdi.title = `${bestVerse.s}:${bestVerse.a} Ayetine git`;
            } else {
                bdi.className = 'arabic-inline';
            }

            // Kelimeleri zenginleştir
            normWords.forEach((nw, i) => {
                const originalWord = words[i] || "";
                const meaning = state.quranWords[nw];

                if (meaning) {
                    const span = document.createElement('span');
                    span.className = 'word-span';
                    span.setAttribute('data-meaning', meaning);
                    span.innerText = originalWord;
                    bdi.appendChild(span);
                } else {
                    bdi.appendChild(document.createTextNode(originalWord));
                }

                if (i < normWords.length - 1) {
                    bdi.appendChild(document.createTextNode(' '));
                }
            });

            fragment.appendChild(bdi);
        } else {
            fragment.appendChild(document.createTextNode(arabicPart));
        }

        lastIndex = regex.lastIndex;
    }

    // Kalan metni ekle
    if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    if (fragment.childNodes.length > 0) {
        textNode.parentNode.replaceChild(fragment, textNode);
    }
}

function findBestVerseMatch(normPhrase, phraseWordCount) {
    if (!state.quranVerses || !normPhrase) return null;

    // Tam eşleşme (S,A) kaydı varsa direkt dön
    if (state.quranIndex[normPhrase]) {
        return state.quranIndex[normPhrase];
    }

    // Alt dizi eşleşmesi araması
    // 1 kelimelik eşleşmeler genellikle çok fazladır, karmaşayı önlemek için en az 2 kelime veya uzun bir kelime grubu arayalım
    if (phraseWordCount < 1) return null;

    let bestMatch = null;
    let maxSc = 0;

    for (let v of state.quranVerses) {
        if (v.t.includes(normPhrase)) {
            // Skor: PhraseKelimeSayısı / AyetToplamKelimeSayısı
            let sc = phraseWordCount / v.l;
            if (sc >= 0.2 && sc > maxSc) {
                maxSc = sc;
                bestMatch = v;
            }
        }
    }
    return bestMatch;
}

// transformElementToVerse artık enrichRisaleContent içinde replace ile hallediliyor, silebiliriz veya yedek bırakabiliriz.
// Şimdilik temiz kalsın diye eski fonksiyonu pasifize edelim.
async function transformElementToVerse(el, surahId, verseNum) {
    // enrichment logic artık merkezi yapılıyor
}

function toggleQuranControls(show) {
    const display = show ? 'flex' : 'none';
    if (DOM.reciterGroup) DOM.reciterGroup.style.display = display;
    if (DOM.translationGroup) DOM.translationGroup.style.display = display;
    if (DOM.readingModeBtn) DOM.readingModeBtn.style.display = display;
}

function escapeHtml(unsafe) {
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.onload = init;

/* Prayer Times Functionality */
function initPrayerTimes() {
    // Default coordinates (Istanbul)
    const defaultCoords = { latitude: 41.0082, longitude: 28.9784, city: "İstanbul" };

    if (navigator.geolocation) {
        const useLocation = confirm("Namaz vakitlerini otomatik hesaplamak için konum bilgisini kullanmak istiyor musunuz?");
        if (useLocation) {
            navigator.geolocation.getCurrentPosition(position => {
                updatePrayerTimes(position.coords.latitude, position.coords.longitude, "Konumunuz");
            }, error => {
                console.warn("Konum alınamadı, varsayılan (İstanbul) kullanılıyor:", error);
                updatePrayerTimes(defaultCoords.latitude, defaultCoords.longitude, defaultCoords.city);
            });
        } else {
            updatePrayerTimes(defaultCoords.latitude, defaultCoords.longitude, defaultCoords.city);
        }
    } else {
        updatePrayerTimes(defaultCoords.latitude, defaultCoords.longitude, defaultCoords.city);
    }

    // Refresh every second for live countdown
    setInterval(() => {
        if (state.lastCoords) {
            updatePrayerTimes(state.lastCoords.lat, state.lastCoords.lng, state.lastCoords.label);
        }
    }, 1000);
}

async function searchCity(city) {
    DOM.prayerLocation.innerText = "Aranıyor...";
    DOM.locationSearchResults.style.display = 'none';
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            renderSearchResults(data);
            DOM.prayerLocation.innerText = "Sonuç seçin...";
        } else {
            alert("Şehir bulunamadı.");
            DOM.prayerLocation.innerText = state.lastCoords.label;
        }
    } catch (e) {
        console.error("Arama hatası:", e);
        alert("Arama sırasında bir hata oluştu.");
        DOM.prayerLocation.innerText = state.lastCoords.label;
    }
}

function renderSearchResults(results) {
    DOM.locationSearchResults.innerHTML = results.slice(0, 10).map(r => {
        const nameParts = r.display_name.split(',');
        const mainName = nameParts[0].trim();
        const detail = nameParts.slice(1).join(',').trim();
        return `
            <div class="location-result-item" onclick="selectLocation(${r.lat}, ${r.lon}, '${mainName.replace(/'/g, "\\'")}')">
                <span class="location-name">${mainName}</span>
                <span class="location-detail">${detail}</span>
            </div>
        `;
    }).join('');
    DOM.locationSearchResults.style.display = 'block';
}

function selectLocation(lat, lon, label) {
    DOM.locationSearchResults.style.display = 'none';
    DOM.citySearchInput.value = label;
    updatePrayerTimes(lat, lon, label);
}

function updatePrayerTimes(lat, lng, label) {
    state.lastCoords = { lat, lng, label };

    const coordinates = new adhan.Coordinates(lat, lng);
    const params = adhan.CalculationMethod.Turkey();
    const date = new Date();
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

    // Update Header
    if (DOM.prayerLocation) DOM.prayerLocation.innerText = label;
    if (DOM.prayerDate) DOM.prayerDate.innerText = moment(date).locale('tr').format('D MMMM YYYY, dddd HH:mm:ss');

    // Prepare Times for UI
    const times = [
        { id: 'fajr', name: 'İmsak', time: prayerTimes.fajr },
        { id: 'sunrise', name: 'Güneş', time: prayerTimes.sunrise },
        { id: 'dhuhr', name: 'Öğle', time: prayerTimes.dhuhr },
        { id: 'asr', name: 'İkindi', time: prayerTimes.asr },
        { id: 'maghrib', name: 'Akşam', time: prayerTimes.maghrib },
        { id: 'isha', name: 'Yatsı', time: prayerTimes.isha }
    ];

    const currentPrayer = prayerTimes.currentPrayer();
    const nextPrayer = prayerTimes.nextPrayer();

    // Render Grid
    if (DOM.prayerGrid) {
        DOM.prayerGrid.innerHTML = times.map(t => {
            const isActive = t.id === currentPrayer;
            return `
                <div class="prayer-item ${isActive ? 'active' : ''}">
                    <span class="prayer-name">${t.name}</span>
                    <span class="prayer-time">${moment(t.time).format('HH:mm')}</span>
                </div>
            `;
        }).join('');
    }

    // Update Footer (Countdown)
    if (DOM.nextPrayerTime) {
        if (nextPrayer !== adhan.Prayer.None) {
            const nextTime = prayerTimes.timeForPrayer(nextPrayer);
            const now = moment();
            const next = moment(nextTime);

            // Handle next day wraps (if Isha is current, next is Fajr tomorrow)
            if (next.isBefore(now)) next.add(1, 'day');

            const diff = next.diff(now);
            const duration = moment.duration(diff);

            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            const pName = times.find(t => t.id === nextPrayer)?.name || 'İmsak';

            let countdownStr = `${pName} vaktine `;
            if (hours > 0) countdownStr += `${hours} saat `;
            if (minutes > 0 || hours > 0) countdownStr += `${minutes} dakika `;
            countdownStr += `${seconds} saniye kaldı`;

            DOM.nextPrayerTime.innerText = countdownStr;
        } else {
            DOM.nextPrayerTime.innerText = "Yarınki İmsak vaktine hazırlanılıyor...";
        }
    }
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function enterReadingMode() {
    if (!state.currentSurah || state.quranPages.length === 0) return;

    // Find page for current surah's first visible verse
    const startVerse = parseInt(state.currentSurahData[0].ayet);
    let foundPage = 0;
    for (let i = 0; i < state.quranPages.length; i++) {
        if (state.quranPages[i].some(v => v.sure === state.currentSurah && v.ayet === startVerse)) {
            foundPage = i;
            break;
        }
    }

    state.currentReadingPage = foundPage;
    DOM.readingModeOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent main page scroll
    renderReadingPage();
}

function exitReadingMode() {
    DOM.readingModeOverlay.style.display = 'none';
    document.body.style.overflow = '';
    DOM.readingModeContent.innerHTML = '';
}

async function renderReadingPage() {
    const page = state.quranPages[state.currentReadingPage];
    if (!page) return;

    DOM.pageInfo.innerText = `Sayfa ${state.currentReadingPage + 1} / ${state.quranPages.length}`;
    DOM.prevPageBtn.disabled = (state.currentReadingPage === 0);
    DOM.nextPageBtn.disabled = (state.currentReadingPage === state.quranPages.length - 1);

    DOM.readingModeContent.innerHTML = '';

    // Group page verses by surah
    const groups = [];
    let currentGroup = null;
    page.forEach(v => {
        if (!currentGroup || currentGroup.sure !== v.sure) {
            currentGroup = { sure: v.sure, ayetler: [] };
            groups.push(currentGroup);
        }
        currentGroup.ayetler.push(v.ayet);
    });

    // Fetch/cache all surah data needed for this page
    const sureNums = [...new Set(page.map(v => v.sure))];
    const fetchPromises = sureNums.map(sureNo => {
        if (!state.surahCache[sureNo]) {
            return fetch(`sureler/${sureNo}.json`)
                .then(r => r.json())
                .then(data => { state.surahCache[sureNo] = data; })
                .catch(() => { state.surahCache[sureNo] = []; });
        }
        return Promise.resolve();
    });
    await Promise.all(fetchPromises);

    const sheet = document.createElement('div');
    sheet.className = 'mushaf-page-sheet';

    groups.forEach((g, idx) => {
        const isFirstAyah = g.ayetler[0] === 1;

        if (isFirstAyah || idx > 0) {
            const header = document.createElement('div');
            header.className = 'mushaf-surah-header';
            const arabicName = arabicSurahNames[g.sure - 1] || '';
            const latinName = surahNames[g.sure - 1] || '';
            header.innerHTML = `
                <div class="mushaf-header-line"></div>
                <div class="mushaf-header-box">
                    <span class="mushaf-surah-arabic">${arabicName}</span>
                    <span class="mushaf-surah-latin">${latinName}</span>
                </div>
                <div class="mushaf-header-line"></div>
            `;
            sheet.appendChild(header);

            if (isFirstAyah && g.sure !== 9) {
                // Besmele: Fatiha 1:1 kelime kelime (hover anlamlı)
                const besmeleDiv = document.createElement('div');
                besmeleDiv.className = 'mushaf-besmele';

                // Surah 1 verisini al (cache'te olmayabilir — garantile)
                const renderBesmele = () => {
                    const s1data = state.surahCache[1] || [];
                    const v1 = s1data.find(v => parseInt(v.ayet) === 1);
                    if (v1 && v1.words) {
                        v1.words.forEach(w => {
                            const sp = document.createElement('span');
                            sp.className = 'word-span';
                            sp.textContent = w.text;
                            if (w.meaning) sp.setAttribute('data-meaning', w.meaning);
                            besmeleDiv.appendChild(sp);
                            besmeleDiv.appendChild(document.createTextNode('\u00A0'));
                        });
                    } else {
                        besmeleDiv.textContent = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
                    }
                };

                if (!state.surahCache[1]) {
                    fetch('sureler/1.json').then(r => r.json()).then(data => {
                        state.surahCache[1] = data;
                        renderBesmele();
                    }).catch(() => { besmeleDiv.textContent = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'; });
                } else {
                    renderBesmele();
                }

                sheet.appendChild(besmeleDiv);
            }

        }

        const surahData = state.surahCache[g.sure] || [];

        // One single block per surah group — all verses flow inline
        const arabicBlock = document.createElement('div');
        arabicBlock.className = 'reading-arabic-line';

        g.ayetler.forEach(ayetNo => {
            const verseData = surahData.find(v => parseInt(v.ayet) === ayetNo);

            if (verseData && verseData.words && verseData.words.length > 0) {
                verseData.words.forEach(w => {
                    const span = document.createElement('span');
                    span.className = 'word-span';
                    span.textContent = w.text;
                    if (w.meaning) span.setAttribute('data-meaning', w.meaning);
                    arabicBlock.appendChild(span);
                    arabicBlock.appendChild(document.createTextNode('\u00A0'));
                });
            }

            // Ayah end marker inline
            const marker = document.createElement('span');
            marker.className = 'mushaf-ayah-marker';
            marker.textContent = '\u06DD' + toArabicNumerals(ayetNo);
            arabicBlock.appendChild(marker);
            arabicBlock.appendChild(document.createTextNode('\u00A0'));
        });

        sheet.appendChild(arabicBlock);
    });


    DOM.readingModeContent.appendChild(sheet);
    DOM.readingModeOverlay.scrollTop = 0;
}

function toArabicNumerals(n) {
    const d = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
    return String(n).split('').map(c => d[parseInt(c)] ?? c).join('');
}
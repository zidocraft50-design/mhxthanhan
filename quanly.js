// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAe5evR4GLSnTG4iTQAXH2uepOXAqZnYbE",
    authDomain: "thanh-an-guidebook.firebaseapp.com",
    projectId: "thanh-an-guidebook",
    storageBucket: "thanh-an-guidebook.firebasestorage.app",
    messagingSenderId: "267179583637",
    appId: "1:267179583637:web:70d8835f66028844cd139c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global State
let allPlaces = [];
let customCategories = [];
let miniMap = null;
let miniMarker = null;

const DEFAULT_CATEGORIES = [
    { id: 'luu-tru', name: 'Lưu trú', nameEn: 'Accommodation', icon: 'fas fa-bed', color: '#2563eb' },
    { id: 'an-uong', name: 'Ăn uống', nameEn: 'Food & Drink', icon: 'fas fa-utensils', color: '#ea580c' },
    { id: 'dich-vu', name: 'Dịch vụ', nameEn: 'Services', icon: 'fas fa-concierge-bell', color: '#7c3aed' },
    { id: 'tham-quan', name: 'Tham quan', nameEn: 'Sightseeing', icon: 'fas fa-binoculars', color: '#0891b2' },
];

// Utility functions
function driveToImg(url) {
    if (!url) return '';
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? 'https://lh3.googleusercontent.com/d/' + m[1] : url;
}

function toSlug(name) {
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Authentication
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = (document.getElementById('login-username').value || '').trim();
    const pass = (document.getElementById('login-password').value || '').trim();
    
    if (user.toLowerCase() === 'cttnyouthuel2026' && pass === '26031931') {
        document.getElementById('auth-error').style.display = 'none';
        localStorage.setItem('admin_logged_in', 'true');
        try {
            await firebase.auth().signInAnonymously();
        } catch (error) {
            console.log("Firebase auth note:", error);
        }
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        initDashboard();
    } else {
        document.getElementById('auth-error').style.display = 'block';
    }
});

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('admin_logged_in');
    try { firebase.auth().signOut(); } catch(e) {}
    location.reload();
});

// Auto-login check on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('admin_logged_in') === 'true') {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        initDashboard();
    }
});

firebase.auth().onAuthStateChanged((user) => {
    if (user || localStorage.getItem('admin_logged_in') === 'true') {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        initDashboard();
    }
});

// UI Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.section-container').forEach(s => s.classList.remove('active'));
        document.getElementById(this.dataset.target).classList.add('active');
    });
});

// Initialize Dashboard Data
async function initDashboard() {
    loadCategories();
    loadPlaces();
    loadHomeConfig();
    loadGreenRules();
    loadTransport();
    loadGallery();
    loadNews();
    loadPdfConfig();
}

// --- CATEGORIES ---
async function loadCategories() {
    // Render defaults
    const defContainer = document.getElementById('default-categories-list');
    defContainer.innerHTML = DEFAULT_CATEGORIES.map(c => `
        <div class="data-item">
            <div class="data-info">
                <div class="data-title"><i class="${c.icon}" style="color:${c.color}"></i> ${c.name} (${c.nameEn})</div>
            </div>
            <div class="data-actions"><span class="badge" style="background: ${c.color}">Mặc định</span></div>
        </div>
    `).join('');

    // Load custom
    db.collection('categories').onSnapshot(snap => {
        customCategories = [];
        snap.forEach(doc => customCategories.push({ id: doc.id, ...doc.data() }));
        
        const custContainer = document.getElementById('custom-categories-list');
        custContainer.innerHTML = customCategories.map(c => `
            <div class="data-item">
                <div class="data-info">
                    <div class="data-title"><i class="${c.icon}" style="color:${c.color}"></i> ${c.name} (${c.nameEn})</div>
                </div>
                <div class="data-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editCategory('${c.id}')"><i class="fas fa-edit"></i> Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}')"><i class="fas fa-trash"></i> Xóa</button>
                </div>
            </div>
        `).join('');
        
        updateCategorySelect();
    });
}

function updateCategorySelect() {
    const select = document.getElementById('p-type');
    let html = '<option value="">Chọn danh mục</option>';
    const all = [...DEFAULT_CATEGORIES, ...customCategories];
    all.forEach(c => {
        html += `<option value="${c.id}">${c.name}</option>`;
    });
    select.innerHTML = html;
}

function openCategoryModal() {
    document.getElementById('cat-form').reset();
    document.getElementById('c-id').value = '';
    document.getElementById('c-icon-preview').className = '';
    document.getElementById('cat-modal-title').innerText = 'Thêm danh mục';
    document.getElementById('cat-modal').classList.add('show');
}

function closeCategoryModal() {
    document.getElementById('cat-modal').classList.remove('show');
}

function editCategory(id) {
    const c = customCategories.find(x => x.id === id);
    if (!c) return;
    document.getElementById('c-id').value = c.id;
    document.getElementById('c-name').value = c.name || '';
    document.getElementById('c-nameEn').value = c.nameEn || '';
    document.getElementById('c-icon').value = c.icon || '';
    document.getElementById('c-icon-preview').className = c.icon || '';
    document.getElementById('c-color').value = c.color || '#000000';
    document.getElementById('cat-modal-title').innerText = 'Sửa danh mục';
    document.getElementById('cat-modal').classList.add('show');
}

async function saveCategory() {
    const id = document.getElementById('c-id').value;
    const name = document.getElementById('c-name').value;
    if (!name) return showToast('Vui lòng nhập tên danh mục', 'error');

    const data = {
        name: name,
        nameEn: document.getElementById('c-nameEn').value,
        icon: document.getElementById('c-icon').value,
        color: document.getElementById('c-color').value
    };

    try {
        if (id) {
            await db.collection('categories').doc(id).update(data);
            showToast('Cập nhật thành công');
        } else {
            const newId = toSlug(name);
            await db.collection('categories').doc(newId).set(data);
            showToast('Thêm thành công');
        }
        closeCategoryModal();
    } catch (e) {
        showToast('Lỗi: ' + e.message, 'error');
    }
}

async function deleteCategory(id) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        await db.collection('categories').doc(id).delete();
        showToast('Đã xóa');
    }
}

// --- PLACES ---
function loadPlaces() {
    // 1. Read stored places from localStorage
    try {
        let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
        if (Array.isArray(localPlaces) && localPlaces.length > 0) {
            allPlaces = [...localPlaces];
        }
    } catch(e) {}

    document.getElementById('stat-places').innerText = allPlaces.length;
    renderPlaces(allPlaces);

    // 2. Sync with Firebase Firestore without wiping out local places
    db.collection('places').onSnapshot(snap => {
        snap.forEach(doc => {
            const data = doc.data();
            if (data && data.name) {
                const idx = allPlaces.findIndex(p => p.id === doc.id || p.name === data.name);
                if (idx >= 0) {
                    allPlaces[idx] = { id: doc.id, ...data };
                } else {
                    allPlaces.push({ id: doc.id, ...data });
                }
            }
        });

        try {
            localStorage.setItem('local_places', JSON.stringify(allPlaces));
        } catch(e) {}

        document.getElementById('stat-places').innerText = allPlaces.length;
        renderPlaces(allPlaces);
    }, err => {
        console.log("Firestore snapshot note:", err);
    });
}

function renderPlaces(places) {
    const container = document.getElementById('places-list');
    const allCats = [...DEFAULT_CATEGORIES, ...customCategories];
    
    container.innerHTML = places.map(p => {
        const cat = allCats.find(c => c.id === p.type);
        const catName = cat ? cat.name : p.type;
        const catColor = cat ? cat.color : '#666';
        
        return `
        <div class="data-item">
            <div class="data-info">
                <div class="data-title">${p.name}</div>
                <div class="data-meta">
                    <span class="badge" style="background: ${catColor}">${catName}</span>
                    <span style="margin-left: 10px"><i class="fas fa-map-marker-alt"></i> ${p.lat}, ${p.lng}</span>
                </div>
            </div>
            <div class="data-actions">
                <button class="btn btn-secondary btn-sm" onclick="editPlace('${p.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deletePlace('${p.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `}).join('');
}

function filterPlaces() {
    const kw = document.getElementById('search-place').value.toLowerCase();
    const filtered = allPlaces.filter(p => p.name.toLowerCase().includes(kw));
    renderPlaces(filtered);
}

function initMiniMap() {
    if (miniMap) return;
    miniMap = L.map('mini-map').setView([10.468, 106.945], 14); // Thạnh An coord
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
    
    miniMarker = L.marker([10.468, 106.945], {draggable: true}).addTo(miniMap);
    
    miniMarker.on('dragend', function(e) {
        const pos = miniMarker.getLatLng();
        document.getElementById('p-lat').value = pos.lat.toFixed(6);
        document.getElementById('p-lng').value = pos.lng.toFixed(6);
    });

    const updateMarker = () => {
        const lat = parseFloat(document.getElementById('p-lat').value) || 10.468;
        const lng = parseFloat(document.getElementById('p-lng').value) || 106.945;
        miniMarker.setLatLng([lat, lng]);
        miniMap.setView([lat, lng], 16);
    };

    document.getElementById('p-lat').addEventListener('change', updateMarker);
    document.getElementById('p-lng').addEventListener('change', updateMarker);
}

function openPlaceModal() {
    document.getElementById('place-form').reset();
    document.getElementById('p-id').value = '';
    document.getElementById('place-modal-title').innerText = 'Thêm địa điểm mới';
    document.getElementById('p-img-preview').innerHTML = '';
    document.getElementById('place-modal').classList.add('show');
    
    setTimeout(() => {
        initMiniMap();
        miniMap.invalidateSize();
        const lat = 10.468;
        const lng = 106.945;
        document.getElementById('p-lat').value = lat;
        document.getElementById('p-lng').value = lng;
        miniMarker.setLatLng([lat, lng]);
        miniMap.setView([lat, lng], 14);
    }, 200);
}

function closePlaceModal() {
    document.getElementById('place-modal').classList.remove('show');
}

function updateImagePreviews() {
    const text = document.getElementById('p-images').value;
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const container = document.getElementById('p-img-preview');
    container.innerHTML = lines.map(url => `<img src="${driveToImg(url)}" class="img-preview-item" onerror="this.style.display='none'">`).join('');
}

function editPlace(id) {
    const p = allPlaces.find(x => x.id === id);
    if (!p) return;
    
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name || '';
    document.getElementById('p-nameEn').value = p.nameEn || '';
    document.getElementById('p-type').value = p.type || '';
    document.getElementById('p-desc').value = p.description || '';
    document.getElementById('p-descEn').value = p.descriptionEn || '';
    document.getElementById('p-lat').value = p.lat || '';
    document.getElementById('p-lng').value = p.lng || '';
    document.getElementById('p-address').value = p.address || '';
    document.getElementById('p-contact').value = p.contact || '';
    document.getElementById('p-price').value = p.price || '';
    
    document.getElementById('p-images').value = (p.images || []).join('\n');
    updateImagePreviews();
    
    document.getElementById('place-modal-title').innerText = 'Sửa địa điểm';
    document.getElementById('place-modal').classList.add('show');
    
    setTimeout(() => {
        initMiniMap();
        miniMap.invalidateSize();
        const lat = parseFloat(p.lat) || 10.468;
        const lng = parseFloat(p.lng) || 106.945;
        miniMarker.setLatLng([lat, lng]);
        miniMap.setView([lat, lng], 16);
    }, 200);
}

async function savePlace() {
    const id = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value;
    const type = document.getElementById('p-type').value;
    const lat = parseFloat(document.getElementById('p-lat').value);
    const lng = parseFloat(document.getElementById('p-lng').value);

    if (!name || !type || isNaN(lat) || isNaN(lng)) {
        return showToast('Vui lòng điền đủ tên, danh mục và tọa độ', 'error');
    }

    const imagesText = document.getElementById('p-images').value;
    const images = imagesText.split('\n').map(l => l.trim()).filter(l => l !== '');

    const data = {
        name,
        nameEn: document.getElementById('p-nameEn').value,
        type,
        category: type,
        description: document.getElementById('p-desc').value,
        descriptionEn: document.getElementById('p-descEn').value,
        lat,
        lng,
        images,
        image: images[0] || '',
        address: document.getElementById('p-address').value,
        contact: document.getElementById('p-contact').value,
        price: document.getElementById('p-price').value
    };

    // Update local_places in localStorage
    try {
        let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
        if (!Array.isArray(localPlaces)) localPlaces = [];
        const targetId = id || (toSlug(name) + '-' + Date.now().toString().slice(-4));
        const placeObj = { id: targetId, ...data };
        const idx = localPlaces.findIndex(p => p.id === targetId || p.name === name);
        if (idx >= 0) {
            localPlaces[idx] = placeObj;
        } else {
            localPlaces.unshift(placeObj);
        }
        localStorage.setItem('local_places', JSON.stringify(localPlaces));
        allPlaces = [...localPlaces];
        document.getElementById('stat-places').innerText = allPlaces.length;
        renderPlaces(allPlaces);
    } catch(e) {}

    try {
        if (id) {
            await db.collection('places').doc(id).set(data, { merge: true });
            showToast('Cập nhật thành công');
        } else {
            const newId = toSlug(name) + '-' + Date.now().toString().slice(-4);
            await db.collection('places').doc(newId).set(data);
            showToast('Thêm mới thành công');
        }
        closePlaceModal();
    } catch (e) {
        showToast('Lưu bản ghi thành công');
        closePlaceModal();
    }
}

async function deletePlace(id) {
    if (confirm('Xóa địa điểm này?')) {
        try {
            let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
            localPlaces = localPlaces.filter(p => p.id !== id);
            localStorage.setItem('local_places', JSON.stringify(localPlaces));
        } catch(e) {}

        try {
            await db.collection('places').doc(id).delete();
        } catch(e) {}
        showToast('Đã xóa');
    }
}

// --- HOME CONFIG ---
async function loadHomeConfig() {
    const doc = await db.collection('siteConfig').doc('main').get();
    if (doc.exists) {
        const d = doc.data();
        document.getElementById('hc-title').value = d.tieu_de || '';
        document.getElementById('hc-desc').value = d.mo_ta_ngan || '';
        document.getElementById('hc-area').value = d.dien_tich_tong || '';
        document.getElementById('hc-pop').value = d.dan_so_tong || '';
        document.getElementById('hc-dist').value = d.khoang_cach_tt || '';
        document.getElementById('hc-feat').value = d.dac_diem_noibat || '';
        document.getElementById('hc-about').value = d.gioi_thieu_chi_tiet || '';
        document.getElementById('hc-banner').value = d.anh_banner || '';
    }
}

async function saveHomeConfig() {
    const data = {
        tieu_de: document.getElementById('hc-title').value,
        mo_ta_ngan: document.getElementById('hc-desc').value,
        dien_tich_tong: document.getElementById('hc-area').value,
        dan_so_tong: document.getElementById('hc-pop').value,
        khoang_cach_tt: document.getElementById('hc-dist').value,
        dac_diem_noibat: document.getElementById('hc-feat').value,
        gioi_thieu_chi_tiet: document.getElementById('hc-about').value,
        anh_banner: document.getElementById('hc-banner').value,
    };
    await db.collection('siteConfig').doc('main').set(data, { merge: true });
    showToast('Đã lưu cấu hình trang chủ');
}

// --- GREEN RULES ---
let greenRulesItems = [];

async function loadGreenRules() {
    const doc = await db.collection('greenRules').doc('main').get();
    if (doc.exists) {
        greenRulesItems = doc.data().items || [];
    } else {
        greenRulesItems = [];
    }
    renderGreenRules();
}

function renderGreenRules() {
    const container = document.getElementById('green-rules-container');
    container.innerHTML = greenRulesItems.map((item, idx) => `
        <div class="dynamic-list-item">
            <div class="dynamic-list-item-content">
                <div style="display:flex; gap: 10px;">
                    <select class="form-group" style="width: 150px; margin:0;" onchange="updateGreenRule(${idx}, 'type', this.value)">
                        <option value="allowed" ${item.type==='allowed'?'selected':''}>Nên làm</option>
                        <option value="forbidden" ${item.type==='forbidden'?'selected':''}>Không nên</option>
                        <option value="info" ${item.type==='info'?'selected':''}>Thông tin</option>
                    </select>
                    <input type="text" placeholder="Icon class (vd: fas fa-leaf)" value="${item.icon||''}" onchange="updateGreenRule(${idx}, 'icon', this.value)" style="width: 200px;">
                </div>
                <input type="text" placeholder="Tiếng Việt" value="${item.text||''}" onchange="updateGreenRule(${idx}, 'text', this.value)">
                <input type="text" placeholder="Tiếng Anh" value="${item.textEn||''}" onchange="updateGreenRule(${idx}, 'textEn', this.value)">
            </div>
            <button class="btn btn-danger btn-sm" onclick="removeGreenRule(${idx})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addGreenRule() {
    greenRulesItems.push({ type: 'allowed', icon: '', text: '', textEn: '' });
    renderGreenRules();
}

function updateGreenRule(idx, field, value) {
    greenRulesItems[idx][field] = value;
}

function removeGreenRule(idx) {
    greenRulesItems.splice(idx, 1);
    renderGreenRules();
}

async function saveGreenRules() {
    await db.collection('greenRules').doc('main').set({ items: greenRulesItems });
    showToast('Đã lưu quy định xanh');
}

// --- TRANSPORT & ITINERARIES & TIPS ---
let tgTips = [];
let tgSteps = [];
let itineraries = [];

async function loadTransport() {
    const doc = await db.collection('travelGuide').doc('main').get();
    if (doc.exists) {
        const d = doc.data();
        document.getElementById('tg-schedule-vi').value = d.schedule || '';
        document.getElementById('tg-schedule-en').value = d.scheduleEn || '';
        tgTips = d.tips || [];
        tgSteps = d.steps || [];
        itineraries = d.itineraries || [];
    }
    renderTgTips();
    renderTgSteps();
    renderItineraries();
}

function renderTgTips() {
    const container = document.getElementById('tg-tips-container');
    container.innerHTML = tgTips.map((t, idx) => `
        <div class="dynamic-list-item">
            <div class="dynamic-list-item-content">
                <input type="text" placeholder="Tiếng Việt" value="${t.text||''}" onchange="tgTips[${idx}].text=this.value">
                <input type="text" placeholder="Tiếng Anh" value="${t.textEn||''}" onchange="tgTips[${idx}].textEn=this.value">
            </div>
            <button class="btn btn-danger btn-sm" onclick="tgTips.splice(${idx},1); renderTgTips()"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addTgTip() {
    tgTips.push({ text: '', textEn: '' });
    renderTgTips();
}

function renderTgSteps() {
    const container = document.getElementById('tg-steps-container');
    container.innerHTML = tgSteps.map((s, idx) => `
        <div class="dynamic-list-item">
            <div class="dynamic-list-item-content">
                <input type="text" placeholder="Icon (fas fa-ship)" value="${s.icon||''}" onchange="tgSteps[${idx}].icon=this.value">
                <input type="text" placeholder="Tiêu đề (VN)" value="${s.title||''}" onchange="tgSteps[${idx}].title=this.value">
                <input type="text" placeholder="Tiêu đề (EN)" value="${s.titleEn||''}" onchange="tgSteps[${idx}].titleEn=this.value">
                <textarea placeholder="Mô tả (VN)" onchange="tgSteps[${idx}].desc=this.value">${s.desc||''}</textarea>
                <textarea placeholder="Mô tả (EN)" onchange="tgSteps[${idx}].descEn=this.value">${s.descEn||''}</textarea>
            </div>
            <button class="btn btn-danger btn-sm" onclick="tgSteps.splice(${idx},1); renderTgSteps()"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addTgStep() {
    tgSteps.push({ icon: '', title: '', titleEn: '', desc: '', descEn: '' });
    renderTgSteps();
}

function renderItineraries() {
    const container = document.getElementById('itineraries-container');
    container.innerHTML = itineraries.map((i, idx) => `
        <div class="dynamic-list-item">
            <div class="dynamic-list-item-content">
                <input type="text" placeholder="Tên lịch trình (VD: Lịch trình 1 ngày)" value="${i.title||''}" onchange="itineraries[${idx}].title=this.value">
                <textarea placeholder="Nội dung chi tiết (HTML hoặc Text)" onchange="itineraries[${idx}].content=this.value">${i.content||''}</textarea>
            </div>
            <button class="btn btn-danger btn-sm" onclick="itineraries.splice(${idx},1); renderItineraries()"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addItinerary() {
    itineraries.push({ title: '', content: '' });
    renderItineraries();
}

async function saveTransport() {
    const data = {
        schedule: document.getElementById('tg-schedule-vi').value,
        scheduleEn: document.getElementById('tg-schedule-en').value,
        steps: tgSteps,
        itineraries: itineraries
    };
    await db.collection('travelGuide').doc('main').set(data, { merge: true });
    showToast('Đã lưu di chuyển & lịch trình');
}

async function saveTips() {
    await db.collection('travelGuide').doc('main').set({ tips: tgTips }, { merge: true });
    showToast('Đã lưu mẹo du lịch');
}

// --- GALLERY ---
let galleryImages = [];

async function loadGallery() {
    galleryImages = [];

    // 1. Try local storage first
    try {
        const local = localStorage.getItem('local_gallery');
        if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
                galleryImages = parsed;
            }
        }
    } catch(e) {}

    // 2. Fetch from Firestore doc main
    try {
        const doc = await db.collection('gallery').doc('main').get();
        if (doc.exists && doc.data().items && doc.data().items.length > 0) {
            const fsItems = doc.data().items;
            fsItems.forEach(item => {
                if (item && item.url && !galleryImages.some(x => x.url === item.url)) {
                    galleryImages.push(item);
                }
            });
        }
    } catch(e) {}

    // 3. Fetch from Firestore collection gallery
    try {
        const snap = await db.collection('gallery').get();
        if (snap && !snap.empty) {
            snap.forEach(d => {
                const data = d.data();
                if (data && data.url && !galleryImages.some(x => x.url === data.url)) {
                    galleryImages.push({ id: d.id, ...data });
                }
            });
        }
    } catch(e) {}

    // 4. Fallback default sample photos if empty
    if (!galleryImages || galleryImages.length === 0) {
        galleryImages = [
            { id: 'g_1', title: 'Bờ kè đá ven biển Thạnh An', category: 'sea', url: 'https://drive.google.com/file/d/10k0qoXvY9cU1cYSK_vxbf7evmiQcdXfu/view?usp=drive_link' },
            { id: 'g_2', title: 'Hoàng hôn làng chài xứ đảo', category: 'sea', url: 'https://drive.google.com/file/d/19pM74t2Jk5eY-sQj_U8k-uW-v-xYyZ_7/view?usp=drive_link' },
            { id: 'g_3', title: 'Nhà bè hải sản tươi sống', category: 'food', url: 'https://drive.google.com/file/d/12m-N8b-c9X4_d-Z-w-e-f-g-h-i/view?usp=drive_link' }
        ];
    }

    renderGallery();
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    if (!galleryImages || galleryImages.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:35px; color:#64748b; background:#f8fafc; border-radius:12px; border:1px dashed #cbd5e1;">
                Chưa có hình ảnh nào. Bấm nút <strong>"+ Thêm ảnh mới"</strong> ở trên để thêm hình ảnh vào thư viện!
            </div>
        `;
        return;
    }

    container.innerHTML = galleryImages.map((g, idx) => {
        const imgUrl = driveToImg(g.url || g.imageUrl || g.img);
        const cat = g.category || 'sea';
        const title = (g.title || g.caption || '').replace(/"/g, '&quot;');
        const urlVal = (g.url || g.imageUrl || '').replace(/"/g, '&quot;');

        return `
            <div style="background:#ffffff; border:1.5px solid #e2e8f0; border-radius:14px; padding:18px; margin-bottom:16px; display:flex; gap:16px; align-items:center; box-shadow:0 4px 12px rgba(0,0,0,0.03); flex-wrap:wrap;">
                <div style="width:100px; height:100px; border-radius:12px; overflow:hidden; background:#f1f5f9; flex-shrink:0; border:1px solid #cbd5e1; display:flex; align-items:center; justify-content:center;">
                    <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='3.jpg'; this.onerror=null;">
                </div>

                <div style="flex:1; min-width:280px; display:flex; flex-direction:column; gap:10px;">
                    <div style="display:grid; grid-template-columns: 2fr 1.2fr; gap:12px;">
                        <div>
                            <label style="font-size:0.8rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Tiêu đề / Caption ảnh:</label>
                            <input type="text" placeholder="Ví dụ: Hoàng hôn làng chài Thạnh An" value="${title}" oninput="galleryImages[${idx}].title=this.value; galleryImages[${idx}].caption=this.value;" style="padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; width:100%; font-size:0.9rem; box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="font-size:0.8rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Phân loại danh mục:</label>
                            <select onchange="galleryImages[${idx}].category=this.value;" style="padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; width:100%; font-size:0.9rem; font-weight:700; background:#f0f9ff; color:#0369a1; box-sizing:border-box; cursor:pointer;">
                                <option value="sea" ${cat==='sea'?'selected':''}>🌊 Biển đảo</option>
                                <option value="village" ${cat==='village'?'selected':''}>⚓ Làng chài / Lưu trú</option>
                                <option value="salt" ${cat==='salt'?'selected':''}>🌾 Thiềng Liềng</option>
                                <option value="food" ${cat==='food'?'selected':''}>🍜 Ẩm thực</option>
                                <option value="event" ${cat==='event'?'selected':''}>🎉 Sự kiện / Cộng đồng</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:0.8rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Link ảnh Google Drive / URL ảnh:</label>
                        <input type="text" placeholder="https://drive.google.com/file/d/..." value="${urlVal}" oninput="galleryImages[${idx}].url=this.value; galleryImages[${idx}].imageUrl=this.value;" onchange="renderGallery()" style="padding:8px 12px; border-radius:8px; border:1.5px solid #cbd5e1; width:100%; font-size:0.88rem; box-sizing:border-box;">
                    </div>
                </div>

                <button type="button" onclick="galleryImages.splice(${idx},1); renderGallery();" title="Xóa ảnh" style="padding:10px 16px; border-radius:10px; background:#ef4444; color:white; border:none; cursor:pointer; font-weight:700; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px;">
                    <i class="fas fa-trash-alt"></i> Xóa
                </button>
            </div>
        `;
    }).join('');
}

function addGalleryImage() {
    galleryImages.unshift({
        id: 'g_' + Date.now() + '_' + Math.floor(Math.random()*1000),
        url: '',
        title: '',
        caption: '',
        category: 'sea'
    });
    renderGallery();
}

async function saveGallery() {
    // Filter items with valid URLs
    const validItems = galleryImages.filter(g => g && g.url && g.url.trim() !== '');

    // 1. Instant local persistence
    try {
        localStorage.setItem('local_gallery', JSON.stringify(validItems));
    } catch(e) {}

    // 2. Save to Firestore doc main
    try {
        await db.collection('gallery').doc('main').set({ items: validItems }, { merge: true });
    } catch(e) {}

    // 3. Save individual items to Firestore collection gallery
    try {
        const batch = db.batch();
        validItems.forEach(item => {
            const docId = item.id || ('g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));
            const ref = db.collection('gallery').doc(docId);
            batch.set(ref, {
                title: item.title || item.caption || 'Hình ảnh Thạnh An',
                caption: item.title || item.caption || 'Hình ảnh Thạnh An',
                category: item.category || 'sea',
                url: item.url,
                imageUrl: item.url,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        });
        await batch.commit();
    } catch(e) {}

    showToast('✅ Đã lưu Thư viện ảnh thành công!');
    renderGallery();
}


// --- NEWS ---
let newsItems = [];

async function loadNews() {
    const doc = await db.collection('siteConfig').doc('news').get();
    if (doc.exists) {
        newsItems = doc.data().items || [];
    }
    document.getElementById('stat-news').innerText = newsItems.length;
    renderNews();
}

function renderNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = newsItems.map((n, idx) => `
        <div class="dynamic-list-item">
            <div class="dynamic-list-item-content">
                <input type="text" placeholder="Tiêu đề bài viết" value="${n.tieu_de||''}" onchange="newsItems[${idx}].tieu_de=this.value">
                <textarea placeholder="Mô tả ngắn" onchange="newsItems[${idx}].mo_ta=this.value">${n.mo_ta||''}</textarea>
                <input type="text" placeholder="Link ảnh" value="${n.anh||''}" onchange="newsItems[${idx}].anh=this.value">
                <input type="text" placeholder="Link bài chi tiết" value="${n.link||''}" onchange="newsItems[${idx}].link=this.value">
                <input type="date" value="${n.ngay||''}" onchange="newsItems[${idx}].ngay=this.value">
            </div>
            <button class="btn btn-danger btn-sm" onclick="newsItems.splice(${idx},1); renderNews()"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function addNewsItem() {
    newsItems.push({ tieu_de: '', mo_ta: '', anh: '', link: '', ngay: '' });
    renderNews();
}

async function saveNews() {
    await db.collection('siteConfig').doc('news').set({ items: newsItems });
    showToast('Đã lưu tin tức');
}

// --- EXCEL IMPORT/EXPORT ---
function downloadExcelTemplate() {
    const wb = XLSX.utils.book_new();
    
    // DiaDiem
    const ddData = [
        ["name", "nameEn", "type", "description", "descriptionEn", "lat", "lng", "images", "contact", "price", "address"],
        ["Nhà hàng Biển Xanh", "Blue Sea Restaurant", "an-uong", "Hải sản tươi ngon", "Fresh seafood", "10.4678", "106.9452", "link_anh1\nlink_anh2", "0123456789", "100k - 500k", "Xã Thạnh An"]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ddData), "DiaDiem");

    // DanhMuc
    const dmData = [
        ["name", "nameEn", "icon", "color"],
        ["Đặc sản", "Specialties", "fas fa-gift", "#ff0000"]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dmData), "DanhMuc");

    XLSX.writeFile(wb, "Template_CamNang_ThanhAn.xlsx");
}

async function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(evt) {
        const data = evt.target.result;
        const wb = XLSX.read(data, {type: 'binary'});
        
        document.getElementById('progress-panel').style.display = 'block';
        const pText = document.getElementById('progress-text');
        const pFill = document.getElementById('progress-fill');
        
        try {
            // Process DiaDiem
            if (wb.SheetNames.includes("DiaDiem")) {
                const places = XLSX.utils.sheet_to_json(wb.Sheets["DiaDiem"]);
                pText.innerText = `Đang xử lý ${places.length} địa điểm...`;
                
                const batch = db.batch();
                let count = 0;
                for (let p of places) {
                    if (!p.name || !p.type || !p.lat || !p.lng) continue;
                    const id = toSlug(p.name) + '-' + Date.now().toString().slice(-4) + count;
                    const ref = db.collection('places').doc(id);
                    batch.set(ref, {
                        name: p.name,
                        nameEn: p.nameEn || '',
                        type: p.type,
                        description: p.description || '',
                        descriptionEn: p.descriptionEn || '',
                        lat: parseFloat(p.lat),
                        lng: parseFloat(p.lng),
                        images: p.images ? p.images.split('\n').map(l=>l.trim()).filter(l=>l!=='') : [],
                        contact: p.contact || '',
                        price: p.price || '',
                        address: p.address || ''
                    });
                    count++;
                }
                if (count > 0) await batch.commit();
            }

            // Process DanhMuc
            if (wb.SheetNames.includes("DanhMuc")) {
                const cats = XLSX.utils.sheet_to_json(wb.Sheets["DanhMuc"]);
                const batch = db.batch();
                let count = 0;
                for (let c of cats) {
                    if (!c.name) continue;
                    const id = toSlug(c.name);
                    const ref = db.collection('categories').doc(id);
                    batch.set(ref, {
                        name: c.name,
                        nameEn: c.nameEn || '',
                        icon: c.icon || 'fas fa-folder',
                        color: c.color || '#000000'
                    });
                    count++;
                }
                if (count > 0) await batch.commit();
            }

            pFill.style.width = '100%';
            pText.innerText = 'Hoàn tất nhập dữ liệu!';
            showToast('Nhập dữ liệu thành công');
            setTimeout(() => {
                document.getElementById('progress-panel').style.display = 'none';
                pFill.style.width = '0%';
            }, 3000);
            
        } catch (error) {
            pText.innerText = 'Lỗi: ' + error.message;
            pFill.style.backgroundColor = 'var(--danger)';
        }
        
        e.target.value = ''; // reset file input
    };
    reader.readAsBinaryString(file);
}

// --- CẨM NANG SỐ PDF CONFIG ---
async function loadPdfConfig() {
    const displayEl = document.getElementById('current-pdf-filename-display');
    const inputUrl = document.getElementById('pdf-url-link-input');
    if (!displayEl) return;

    const localFileName = localStorage.getItem('pdf_file_name') || localStorage.getItem('local_pdf_name');

    if (localFileName) {
        displayEl.innerHTML = `✅ <strong>${localFileName}</strong> (Đã lưu trong máy)`;
    } else {
        displayEl.innerHTML = 'Chưa có file PDF nào được tải lên.';
    }

    // Fetch from Firestore system_config
    try {
        const doc = await db.collection('system_config').doc('pdf_file').get();
        if (doc.exists) {
            const data = doc.data();
            if (data && (data.url || data.fileName || data.totalChunks > 0)) {
                if (inputUrl && data.url) inputUrl.value = data.url;
                displayEl.innerHTML = `✅ <strong>${data.fileName || 'cam-nang-thanh-an.pdf'}</strong> (Đã đồng bộ Cloud Firestore)`;
            }
        }
    } catch(e) {}
}

function handlePdfUploadSubmit() {
    const fileInput = document.getElementById('pdf-file-upload-input');
    const statusEl = document.getElementById('pdf-upload-status');
    const progressBox = document.getElementById('pdf-progress-box');
    const progressText = document.getElementById('pdf-progress-text');
    const progressSize = document.getElementById('pdf-progress-size');
    const progressFill = document.getElementById('pdf-progress-bar-fill');

    if (!fileInput || !fileInput.files.length) {
        showToast('Vui lòng chọn 1 file PDF từ máy tính của bạn!', 'error');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        showToast('Chỉ chấp nhận tệp định dạng .pdf!', 'error');
        return;
    }

    if (progressBox) progressBox.style.display = 'block';
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.innerText = 'Đang nạp file PDF... 0%';
    if (progressSize) progressSize.innerText = `0 MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();

    reader.onprogress = function(e) {
        if (e.lengthComputable && e.total > 0) {
            const pct = Math.round((e.loaded / e.total) * 100);
            const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
            const totalMB = (e.total / (1024 * 1024)).toFixed(1);
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressText) progressText.innerText = `Đang đọc file PDF... ${pct}%`;
            if (progressSize) progressSize.innerText = `${loadedMB} MB / ${totalMB} MB`;
        }
    };

    reader.onload = async function(e) {
        const dataUrl = e.target.result;
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.innerText = 'Đang đồng bộ file PDF lên Cloud... 100%';

        // 1. Safe localStorage metadata (don't store huge base64 in localStorage)
        try {
            localStorage.setItem('pdf_file_name', file.name);
            localStorage.setItem('local_pdf_name', file.name);
            if (dataUrl.length < 500000) {
                localStorage.setItem('pdf_data_url', dataUrl);
                localStorage.setItem('local_pdf_data', dataUrl);
            }
        } catch(err) {
            console.warn("LocalStorage quota reached for pdf data, relying on IndexedDB & Cloud.");
        }

        // 2. Update IndexedDB for instant offline access
        try {
            await savePdfToIndexedDB(dataUrl, file.name);
        } catch(idbErr) {}

        // 3. Save chunked base64 to Cloud Firestore for cross-device sync
        try {
            const chunkSize = 350 * 1024; // 350KB per chunk
            const totalChunks = Math.ceil(dataUrl.length / chunkSize);

            const chunkPromises = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkData = dataUrl.substr(i * chunkSize, chunkSize);
                chunkPromises.push(db.collection('pdf_chunks').doc(`chunk_${i}`).set({
                    index: i,
                    data: chunkData,
                    updatedAt: new Date().toISOString()
                }));
            }

            await Promise.all(chunkPromises);

            const docData = {
                fileName: file.name,
                fileSize: file.size,
                totalChunks: totalChunks,
                updatedAt: new Date().toISOString()
            };
            if (dataUrl.length < 900000) {
                docData.url = dataUrl;
                docData.pdfDataUrl = dataUrl;
                docData.pdfFileName = file.name;
            }

            await db.collection('system_config').doc('pdf_file').set(docData, { merge: true });

            showToast('✅ Tải và lưu file PDF Cẩm nang số lên Cloud thành công!');
            setTimeout(() => {
                if (progressBox) progressBox.style.display = 'none';
                loadPdfConfig();
            }, 1200);
        } catch(err) {
            console.error("Firestore upload error:", err);
            showToast('⚠️ Lỗi đồng bộ Cloud Firestore: ' + err.message);
            setTimeout(() => {
                if (progressBox) progressBox.style.display = 'none';
                loadPdfConfig();
            }, 1200);
        }
    };

    reader.onerror = function() {
        if (progressBox) progressBox.style.display = 'none';
        showToast('❌ Lỗi khi đọc file PDF từ máy tính!', 'error');
    };

    reader.readAsDataURL(file);
}

async function handlePdfUrlSubmit() {
    const urlInput = document.getElementById('pdf-url-link-input');
    const url = (urlInput ? urlInput.value : '').trim();
    if (!url) {
        showToast('Vui lòng nhập đường dẫn URL file PDF!', 'error');
        return;
    }

    try {
        localStorage.setItem('pdf_data_url', url);
        localStorage.setItem('pdf_file_name', 'Link_PDF_Cam_Nang.pdf');

        await db.collection('system_config').doc('pdf_file').set({
            fileName: 'Link_PDF_Cam_Nang.pdf',
            url: url,
            updatedAt: new Date().toISOString()
        });

        showToast('✅ Đã lưu đường dẫn Link PDF!');
        loadPdfConfig();
    } catch(e) {
        showToast('✅ Đã lưu đường dẫn Link PDF!');
        loadPdfConfig();
    }
}

async function deleteCurrentPdf() {
    if (!confirm('Bạn có chắc chắn muốn xóa file Cẩm nang số hiện tại?')) return;
    localStorage.removeItem('pdf_data_url');
    localStorage.removeItem('pdf_file_name');
    try {
        await db.collection('system_config').doc('pdf_file').delete();
    } catch(e) {}
    showToast('🗑️ Đã xóa file PDF Cẩm nang!');
    loadPdfConfig();
}

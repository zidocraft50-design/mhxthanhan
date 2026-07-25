// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAe5evR4GLSnTG4iTQAXH2uepOXAqZnYbE",
  authDomain: "thanh-an-guidebook.firebaseapp.com",
  projectId: "thanh-an-guidebook",
  storageBucket: "thanh-an-guidebook.firebasestorage.app",
  messagingSenderId: "267179583637",
  appId: "1:267179583637:web:70d8835f66028844cd139c"
};

let db = null;
let auth = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (typeof firebase.firestore === 'function') {
      db = firebase.firestore();
    }
    if (typeof firebase.auth === 'function') {
      auth = firebase.auth();
    }
  }
} catch(e) {
  console.warn("Firebase initialization skipped:", e);
}

// Variables
let map = null;
let currentLang = 'VI';
let placesData = [];
let greenRulesData = [];
let editMode = false;
let currentIdx = 0;

// Mobile Navigation Toggle
function toggleMobileNav() {
  var navLinks = document.getElementById('nav-links');
  var icon = document.getElementById('nav-toggle-icon');
  if (!navLinks) return;
  
  navLinks.classList.toggle('open');
  
  if (navLinks.classList.contains('open')) {
    if (icon) { icon.className = 'fas fa-times'; }
    document.body.style.overflow = 'hidden';
  } else {
    if (icon) { icon.className = 'fas fa-bars'; }
    document.body.style.overflow = '';
  }
}

// Auto-close mobile nav when a link is clicked
document.addEventListener('DOMContentLoaded', function() {
  var navLinks = document.getElementById('nav-links');
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          var icon = document.getElementById('nav-toggle-icon');
          if (icon) icon.className = 'fas fa-bars';
          document.body.style.overflow = '';
        }
      });
    });
  }
});

// Translations
const translations = {
  VI: {
    "nav-home": "Trang chủ",
    "nav-overview": "Tổng quan",
    "nav-transport": "Di chuyển",
    "nav-places": "Địa điểm",
    "nav-food": "Ẩm thực",
    "nav-stay": "Lưu trú",
    "nav-tips": "Mẹo du lịch",
    "nav-itinerary": "Lịch trình",
    "nav-gallery": "Hình ảnh",
    "nav-contact": "Liên hệ",
    "hero-title": "CẨM NANG XÃ ĐẢO THẠNH AN",
    "hero-subtitle": "Hướng dẫn tham quan, lưu trú, ẩm thực và bảo vệ môi trường tại xã đảo Thạnh An, TP.HCM",
    "hero-search": "Tìm địa điểm, lưu trú, ăn uống...",
    "hero-search-btn": "Tìm kiếm",
    "stat-area-lbl": "DIỆN TÍCH",
    "stat-pop-lbl": "DÂN SỐ",
    "stat-dist-lbl": "KHOẢNG CÁCH",
    "stat-ward-lbl": "ẤP ĐẢO",
    "intro-map-btn": "Xem chi tiết bản đồ →",
    "intro-badge": "CHÀO MỪNG ĐẾN VỚI",
    "intro-heading": "Xã Đảo Thạnh An",
    "intro-desc1": "Thạnh An là một xã đảo thuộc TP.HCM. Nơi đây mang nét đẹp mộc mạc, bình yên của làng chài truyền thống.",
    "intro-desc2": "Tránh xa ồn ào phố thị, Thạnh An chào đón bạn bằng hương vị biển cả, những bữa hải sản tươi ngon và nụ cười đôn hậu của người dân xứ đảo.",
    "intro-f1": "Làng chài bình yên",
    "intro-f2": "Hải sản tươi ngon, giá rẻ",
    "intro-f3": "Phát triển du lịch xanh",
    "intro-f4": "Di chuyển thuận tiện bằng phà",
    "intro-cta": "Khám phá cẩm nang →",
    "explore-title": "CẨM NANG HƯỚNG DẪN",
    "explore-subtitle": "Tất cả thông tin bạn cần cho một chuyến đi trọn vẹn",
    "explore-c1-t": "CÁCH DI CHUYỂN",
    "explore-c1-d": "Tuyến đường, lịch phà & giá vé",
    "explore-c2-t": "KHÁM PHÁ ĐỊA ĐIỂM",
    "explore-c2-d": "Tham quan, ăn uống & lưu trú",
    "explore-c3-t": "MẸO DU LỊCH",
    "explore-c3-d": "Kinh nghiệm & quy định xanh",
    "explore-c4-t": "LỊCH TRÌNH CỤ THỂ",
    "explore-c4-d": "Gợi ý tour 1 ngày & 2 ngày",
    "green-title": "QUY ĐỊNH HẠN CHẾ RÁC THẢI NHỰA",
    "green-subtitle": "Cùng chung tay bảo vệ môi trường biển đảo",
    "rule-1-t": "Không nhựa dùng một lần",
    "rule-1-d": "Hạn chế mang ly, ống hút, túi nilon ra đảo.",
    "rule-2-t": "Mang bình cá nhân",
    "rule-2-d": "Sử dụng bình nước cá nhân để giảm rác thải.",
    "rule-3-t": "Phân loại rác",
    "rule-3-d": "Bỏ rác đúng nơi quy định, phân loại theo hướng dẫn.",
    "rule-4-t": "Bảo vệ đại dương",
    "rule-4-d": "Không vứt rác xuống biển, tôn trọng sinh vật biển.",
    "feat-title": "ĐỊA ĐIỂM NỔI BẬT",
    "feat-subtitle": "Khám phá những nét đặc trưng của Thạnh An",
    "footer-social": "MẠNG XÃ HỘI",
    "footer-contact": "THÔNG TIN LIÊN HỆ",
    "footer-address": "Phòng A.210, 669 Đỗ Mười, Linh Xuân, TP.HCM",
    "footer-copy": "© 2026 Đoàn Trường Đại học Kinh tế - Luật, ĐHQG-HCM.",
  },
  EN: {
    "nav-home": "Home",
    "nav-overview": "Overview",
    "nav-transport": "Transport",
    "nav-places": "Places",
    "nav-food": "Food",
    "nav-stay": "Accommodation",
    "nav-tips": "Tips",
    "nav-itinerary": "Itinerary",
    "nav-gallery": "Gallery",
    "nav-contact": "Contact",
    "hero-title": "THANH AN ISLAND GUIDEBOOK",
    "hero-subtitle": "Guide for sightseeing, staying, dining and environmental protection at Thanh An Island, HCMC",
    "hero-search": "Search places, food, stays...",
    "hero-search-btn": "Search",
    "stat-area-lbl": "AREA",
    "stat-pop-lbl": "POPULATION",
    "stat-dist-lbl": "DISTANCE",
    "stat-ward-lbl": "HAMLETS",
    "intro-map-btn": "View detailed map →",
    "intro-badge": "WELCOME TO",
    "intro-heading": "Thanh An Island",
    "intro-desc1": "Thanh An is an island commune in HCMC. It preserves the rustic and peaceful beauty of a traditional fishing village.",
    "intro-desc2": "Away from the city noise, Thanh An welcomes you with the ocean breeze, fresh seafood, and warm smiles of the locals.",
    "intro-f1": "Peaceful fishing village",
    "intro-f2": "Fresh & cheap seafood",
    "intro-f3": "Green tourism development",
    "intro-f4": "Convenient ferry transport",
    "intro-cta": "Explore the guide →",
    "explore-title": "GUIDEBOOK",
    "explore-subtitle": "Everything you need for a perfect trip",
    "explore-c1-t": "OVERVIEW",
    "explore-c1-d": "History, geography & culture",
    "explore-c2-t": "TRANSPORTATION",
    "explore-c2-d": "Routes & ferry schedules",
    "explore-c3-t": "PLACES TO GO",
    "explore-c3-d": "Check-in & sightseeing",
    "explore-c4-t": "CUISINE",
    "explore-c4-d": "Seafood & local specialties",
    "explore-c5-t": "ACCOMMODATION",
    "explore-c5-d": "Homestays & motels",
    "explore-c6-t": "TRAVEL TIPS",
    "explore-c6-d": "Pocket experiences",
    "explore-c7-t": "ITINERARY",
    "explore-c7-d": "1-day, 2-day tour suggestions",
    "rule-3-t": "Sort waste",
    "rule-3-d": "Dispose of trash properly and sort it.",
    "rule-4-t": "Protect the ocean",
    "rule-4-d": "Do not litter into the sea, respect marine life.",
    "feat-title": "FEATURED PLACES",
    "feat-subtitle": "Discover the signatures of Thanh An",
    "footer-social": "SOCIAL MEDIA",
    "footer-contact": "CONTACT INFO",
    "footer-address": "Room A.210, 669 Do Muoi, Linh Xuan, HCMC",
    "footer-copy": "© 2026 UEL's Youth Union, VNU-HCM."
  }
};

// Drive Image URL converter
function driveToImg(url) {
  if (!url) return '3.jpg';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([^&]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : url;
}

// Initialize Map
function initOverviewMap() {
  const mapEl = document.getElementById('overview-map');
  if (!mapEl || typeof L === 'undefined' || mapEl._leaflet_id) return;

  if (map) {
    try { map.remove(); } catch(e) {}
  }

  map = L.map('overview-map', {
    center: [10.51, 106.96],
    zoom: 12,
    minZoom: 9,
    maxZoom: 18,
    maxBoundsViscosity: 0.8
  });

  // Base Tile Layers (CartoDB Voyager + Esri Satellite)
  const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
    subdomains: 'abcd',
    maxZoom: 19
  });

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  });

  // Add Esri Satellite tile layer by default matching cam-nang.html
  satelliteLayer.addTo(map);

  // Layer Switcher Control
  try {
    L.control.layers({
      "Bản đồ Vệ tinh (Satellite)": satelliteLayer,
      "Bản đồ đường phố (Carto)": cartoLayer
    }).addTo(map);
  } catch(e) {}

  // === RANH GIỚI HÀNH CHÍNH CHUẨN XÃ THẠNH AN ===
  if (typeof thanhAnGeoData !== 'undefined') {
    var geoLayer = L.geoJSON(thanhAnGeoData, {
      style: {
        color: '#ef4444',
        weight: 4,
        opacity: 0.95,
        fillColor: 'rgba(239, 68, 68, 0.12)',
        fillOpacity: 0.12,
        interactive: false
      }
    }).addTo(map);

    try {
      var bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [18, 18] });
        map.setMaxBounds(bounds.pad(0.35));
      }
    } catch(e) {}
  }

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 300);

  loadPlacesForMap();
}

// Load Places & Render Custom Satellite Markers & Featured Carousel
async function loadPlacesForMap() {
  const official6Places = [
    {
      id: 'p1_bo_ke',
      name: 'Bờ kè đá Thạnh An',
      category: '📍 Tham quan',
      type: 'tham-quan',
      imageUrl: 'https://drive.google.com/file/d/10k0qoXvY9cU1cYSK_vxbf7evmiQcdXfu/view?usp=drive_link',
      description: 'Tuyến bờ kè ven biển là một trong những điểm check-in nổi bật nhất của đảo. Du khách có thể đi bộ, hóng gió, quan sát tàu thuyền và ngắm hoàng hôn trên biển.',
      lat: 10.472138787155915,
      lng: 106.97791847182997
    },
    {
      id: 'p2_lang_chai',
      name: 'Làng chài Thạnh An',
      category: '⚓ Văn hóa & Làng chài',
      type: 'tham-quan',
      imageUrl: 'https://drive.google.com/file/d/144nv1zEWJz_8r-6njBHDHjMzjXMIp1Pu/view?usp=drive_link',
      description: 'Không gian làng chài mang đậm nét sinh hoạt của cư dân ven biển với bến cá, ghe thuyền và những con đường nhỏ bình dị. Đây là nơi phù hợp để tìm hiểu đời sống ngư dân và trải nghiệm nhịp sống địa phương.',
      lat: 10.470838880405362,
      lng: 106.97443592711399
    },
    {
      id: 'p3_ruong_muoi',
      name: 'Cánh đồng muối Thiềng Liềng',
      category: '🌾 Trải nghiệm eco',
      type: 'tham-quan',
      imageUrl: 'https://drive.google.com/file/d/1oOCWfX1U3UX6bI9jb_K13CAkyiuSmb56/view?usp=drive_link',
      description: 'Những ruộng muối trải dài tạo nên cảnh quan đặc trưng của ấp đảo Thiềng Liềng. Vào mùa nắng, du khách có thể tìm hiểu quy trình làm muối thủ công và trải nghiệm công việc của diêm dân.',
      lat: 10.516469110717948,
      lng: 106.95303090512297
    },
    {
      id: 'p4_giong_chua',
      name: 'Núi Giồng Chùa',
      category: '⛰️ Địa hình & Tự nhiên',
      type: 'tham-quan',
      imageUrl: 'https://drive.google.com/file/d/1eysNFXNy2TILUu_mFG4mPi1K7cR8NzDQ/view?usp=drive_link',
      description: 'Giồng Chùa là núi đá tự nhiên đặc biệt tại Thiềng Liềng, được xem là một nét địa hình hiếm có của TP.HCM. Điểm đến thích hợp cho hoạt động tìm hiểu tự nhiên, văn hóa địa phương và chụp ảnh.',
      lat: 10.536843033249674,
      lng: 106.97566075118243
    },
    {
      id: 'p5_cung_duong_oval',
      name: 'Cung đường vòng quanh Thiềng Liềng',
      category: '🚴 Trải nghiệm & Cung đường',
      type: 'tham-quan',
      imageUrl: 'https://drive.google.com/file/d/179DYFLHYaENj8AhQlP1x38aDu_vgQgGA/view?usp=drive_link',
      description: 'Con đường hình oval dài khoảng 4 km uốn quanh ruộng muối, sông rạch và rừng ngập mặn. Du khách có thể đi bộ hoặc đạp xe để cảm nhận không khí yên bình của vùng đảo.',
      lat: 10.518500,
      lng: 106.956000
    },
    {
      id: 'p6_du_lich_cong_dong',
      name: 'Không gian du lịch cộng đồng Thiềng Liềng',
      category: '🏡 Du lịch cộng đồng',
      type: 'dich-vu',
      imageUrl: 'https://drive.google.com/file/d/1-4d-lhC6p9br-CvSlzk3u_pJ74hpWXJw/view?usp=drive_link',
      description: 'Khu du lịch cộng đồng gồm nhiều hộ dân cung cấp các trải nghiệm như nghề muối, ẩm thực vùng biển, homestay, làm bánh, đồ uống địa phương và đờn ca tài tử.',
      lat: 10.512828549807393,
      lng: 106.95365670785324
    }
  ];

  renderFeatured(official6Places);
}

// Always ensure featured carousel is rendered on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadPlacesForMap();
});

// Render Featured Carousel
function renderFeatured(places) {
  const track = document.getElementById('featured-track');
  if (!track) return;
  track.innerHTML = '';
  
  const isLogged = localStorage.getItem('admin_logged_in') === 'true';

  if (!places || places.length === 0) {
    if (typeof official6Places !== 'undefined' && Array.isArray(official6Places)) {
      places = official6Places;
    } else {
      return;
    }
  }

  places.forEach((p, index) => {
    const rawImg = p.imageUrl || p.img || (p.images && p.images[0]) || '3.jpg';
    const imgUrl = driveToImg(rawImg);
    const catName = p.category || p.type || 'Địa điểm nổi bật';

    const div = document.createElement('div');
    div.className = 'featured-card';
    div.style.position = 'relative';
    div.innerHTML = `
      <img src="${imgUrl}" alt="${p.name}" data-img-key="featured_img_${index}">
      ${isLogged && p.id ? `
        <button onclick="deletePlaceFromHome('${p.id}')" title="Xóa địa điểm này" style="position:absolute; top:12px; right:12px; background:#ef4444; color:white; border:none; border-radius:50%; width:34px; height:34px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:10; font-size:0.9rem;">
          <i class="fas fa-trash-alt"></i>
        </button>
      ` : ''}
      <div class="featured-card-content">
        <span class="featured-card-cat" data-editable="featured_cat_${index}">${catName}</span>
        <h3 data-editable="featured_title_${index}">${p.name}</h3>
        <p style="font-size:0.85rem; color:#64748b; margin:6px 0 10px 0; line-height:1.4;">${p.description || ''}</p>
        <a href="cam-nang.html?tab=tab-kham-pha&placeId=${p.id || ''}">Xem chi tiết →</a>
      </div>
    `;
    track.appendChild(div);
  });

  if (typeof editMode !== 'undefined' && editMode) {
    startEditing();
  }
}

async function deletePlaceFromHome(placeId) {
  if (!confirm("Bạn có chắc chắn muốn xóa địa điểm này khỏi trang chủ và bản đồ?")) return;
  try {
    await db.collection('places').doc(placeId).delete();
    showToast("🗑️ Đã xóa địa điểm thành công!");
    if (typeof loadPlacesForMap === 'function') loadPlacesForMap();
  } catch(e) {
    console.error("Lỗi xóa địa điểm:", e);
    showToast("❌ Lỗi khi xóa địa điểm!");
  }
}

// Carousel Navigation
function moveCarousel(direction) {
  const track = document.getElementById('featured-track');
  const cards = track.querySelectorAll('.featured-card');
  if(cards.length === 0) return;
  
  const cardWidth = cards[0].offsetWidth + 32; // width + gap
  const maxIdx = Math.max(0, cards.length - Math.floor(track.parentElement.offsetWidth / cardWidth));
  
  currentIdx += direction;
  if(currentIdx < 0) currentIdx = 0;
  if(currentIdx > maxIdx) currentIdx = maxIdx;
  
  track.style.transform = `translateX(-${currentIdx * cardWidth}px)`;
}

// Search
function doSearch() {
  const inputEl = document.getElementById('hero-search-input');
  const q = inputEl ? inputEl.value.trim() : '';
  if (q) {
    window.location.href = `cam-nang.html?tab=tab-kham-pha&q=${encodeURIComponent(q)}`;
  } else {
    window.location.href = `cam-nang.html?tab=tab-kham-pha`;
  }
}

// Global Translation Cache
const translationCache = {
  "Trang chủ": "Home",
  "Giới thiệu chung": "General Overview",
  "Cẩm nang du lịch": "Travel Guide",
  "Cẩm nang số": "Digital Flipbook",
  "Hình ảnh": "Photo Gallery",
  "Liên hệ": "Contact Us",
  "Di chuyển": "Transportation",
  "Địa điểm": "Sightseeing",
  "Ẩm thực": "Gastronomy",
  "Lưu trú": "Accommodations",
  "Mẹo du lịch": "Travel Tips",
  "Lịch trình": "Itineraries",
  "Khám phá": "Explore Places",
  "Cách di chuyển": "Transit Logistics",
  "Khám phá địa điểm": "Explore Places & Map",
  "Lịch trình cụ thể": "Curated Itineraries",
  "Vị trí": "Location",
  "Dân số": "Demographic Population",
  "Đặc trưng": "Key Highlights",
  "Lịch sử và Con người": "History & Community",
  "THÔNG TIN CƠ BẢN": "ESSENTIAL OVERVIEW",
  "ĐIỂM NỔI BẬT": "KEY HIGHLIGHTS",
  "Thế mạnh": "Core Strengths",
  "Sinh kế": "Livelihoods",
  "Sinh thái": "Ecology & Nature",
  "Du lịch": "Community Tourism"
};

// Global Current Language State (persisted via localStorage)
currentLang = localStorage.getItem('site_lang') || 'VI';

// IELTS 8.0 Polish Dictionary & Refine Enhancer
const ielts8PolishMap = [
  [/\bxã đảo thạnh an\b/gi, "Thanh An Island Commune"],
  [/\bđảo thạnh an\b/gi, "Thanh An Island"],
  [/\bthạnh an\b/gi, "Thanh An"]
];

function polishToIelts8(text) {
  let polished = text;
  ielts8PolishMap.forEach(([regex, replacement]) => {
    polished = polished.replace(regex, replacement);
  });
  return polished;
}

// Global Direct Phrase Translation Dictionary (Offline & Fast)
const staticPhraseMap = {
  // Navigation & Headers
  "Trang chủ": "Home",
  "Giới thiệu chung": "Overview",
  "Cẩm nang du lịch": "Travel Guide",
  "Cẩm nang số": "Digital Guide",
  "Hình ảnh": "Gallery",
  "Liên hệ": "Contact",
  "THẠNH AN – NÉT ĐẸP CỦA XÃ ĐẢO": "THANH AN – BEAUTY OF THE ISLAND",
  "THÔNG TIN TỔNG QUAN XÃ ĐẢO THẠNH AN": "THANH AN ISLAND OVERVIEW",
  "CẨM NANG DU LỊCH XÃ ĐẢO THẠNH AN": "THANH AN ISLAND TRAVEL GUIDE",
  "THƯ MỤC ẢNH XÃ ĐẢO THẠNH AN": "THANH AN ISLAND PHOTO GALLERY",
  "📖 CẨM NANG SỐ XÃ ĐẢO THẠNH AN": "📖 THANH AN DIGITAL GUIDEBOOK",

  // Banners & Subtitles
  "Khám phá vị trí, lịch sử con người và bức tranh kinh tế sinh thái đặc trưng": "Discover location, history, people and unique ecological economy",
  "Hướng dẫn trọn gói: Di chuyển, Địa điểm, Mẹo du lịch & Lịch trình": "Comprehensive guide: Transportation, Places, Travel Tips & Itinerary",
  "Khoảnh khắc thiên nhiên, làng chài và con người xứ đảo Thạnh An - Thiềng Liềng": "Moments of nature, fishing villages and people of Thanh An - Thieng Lieng island",
  "Hướng dẫn tham quan, lưu trú, ăn uống & bảo vệ môi trường xã đảo Thạnh An": "Sightseeing, accommodation, dining & environmental protection guide",

  // Tong Quan Page
  "Vị trí": "Location",
  "Thành phố Hồ Chí Minh": "Ho Chi Minh City",
  "Khoảng cách": "Distance",
  "~70 km từ trung tâm": "~70 km from center",
  "Diện tích": "Area",
  "~131,31 km²": "~131.31 km²",
  "Dân số": "Population",
  "Hơn 6.000 cư dân": "Over 6,000 residents",
  "Đơn vị cư trú": "Residential Units",
  "3 ấp": "3 hamlets",
  "Tổng quan nhanh": "Quick Overview",
  "Thạnh An là xã đảo ven biển thuộc TP.HCM, mang đậm nét làng chài truyền thống. Nơi đây gắn bó với nghề biển, làm muối và du lịch cộng đồng, sở hữu hệ sinh thái phong phú và nếp sống hiền hòa, mộc mạc của người dân vùng đảo.": "Thanh An is a coastal island commune in HCMC, rich in traditional fishing village charm. Locals are engaged in fishing, salt making, and eco-tourism, possessing a rich ecosystem and peaceful island life.",
  "Lịch sử và Con người": "History & People",
  "Thạnh An gắn với quá trình khai phá vùng cửa biển và đời sống của cộng đồng cư dân ven biển. Người dân nơi đây hiền hòa, chân chất, gắn bó với biển và vẫn giữ được nét sinh hoạt mộc mạc của một xã đảo truyền thống.": "Thanh An is linked with the exploration of coastal estuaries and seafaring communities. Locals are gentle, genuine, and preserve traditional island customs.",
  "Cộng đồng đoàn kết, chia sẻ và tương trợ lẫn nhau. Những giá trị văn hóa, tập quán, lễ hội dân gian và nếp sống nghĩa tình đã tạo nên bản sắc riêng của người dân Thạnh An.": "The community is united, sharing, and supportive. Cultural values, traditions, folk festivals, and warm lifestyle create the unique identity of Thanh An people.",
  "🌊 Xã đảo TP.HCM": "🌊 HCMC Island Commune",
  "⚓ Làng chài truyền thống": "⚓ Traditional Fishing Village",
  "🏠 3 ấp đảo": "🏠 3 Island Hamlets",
  "❤️ Tinh thần cộng đồng": "❤️ Community Spirit",
  "6.000+": "6,000+",
  "cư dân sinh sống": "residents living",
  "Thạnh Bình, Thạnh Hòa, Thiềng Liềng": "Thanh Binh, Thanh Hoa, Thieng Lieng",
  "Con người": "People",
  "hiền hòa, mộc mạc": "gentle & rustic",
  "Đời sống": "Life",
  "gắn bó với biển": "attached to the sea",
  "Tự nhiên & Kinh tế": "Nature & Economy",
  "Thạnh An nằm trong vùng cửa sông – ven biển, có hệ thống kênh rạch, bãi bồi và cảnh quan sinh thái đặc trưng. Kinh tế địa phương chủ yếu dựa vào thủy sản, làm muối, vận tải đường thủy và du lịch cộng đồng.": "Thanh An is located in the estuarine coastal zone with canals, mudflats, and mangrove ecosystems. Local economy relies on fisheries, salt production, water transport, and community tourism.",
  "Sinh thái cửa sông": "Estuarine Ecosystem",
  "Hệ thống kênh rạch, bãi bồi & rừng ngập mặn đặc trưng.": "Characteristic system of canals, mudflats & mangroves.",
  "Ngư nghiệp ven bờ": "Coastal Fisheries",
  "Khai thác & nuôi trồng hải sản mang nguồn thu nhập chính.": "Seafood harvesting & aquaculture provide primary income.",
  "Làng muối Thạnh An": "Thanh An Salt Village",
  "Nghề làm muối trắng truyền thống lâu đời trên xã đảo.": "Long-standing traditional white salt-making craft on the island.",
  "Du lịch cộng đồng": "Community Tourism",
  "Mô hình du lịch sinh thái xanh, bình yên và hiền hòa.": "Green, peaceful & tranquil ecotourism model.",
  "Thủy sản & Đời sống biển": "Fisheries & Marine Life",
  "Khai thác & nuôi trồng hải sản tươi": "Seafood harvesting & fresh aquaculture",
  "Nếp sống làng chài gắn bó với biển": "Fishing village lifestyle attached to the sea",
  "Làm muối & Vận tải thủy": "Salt Production & Water Transport",
  "Nghề làm muối trắng truyền thống": "Traditional white salt-making craft",
  "Vận tải đường thủy & dịch vụ đảo": "Water transport & island services",
  "Rừng ngập mặn & Bãi bồi": "Mangroves & Tidal Mudflats",
  "Khu dự trữ sinh quyển thế giới": "World Biosphere Reserve Area",
  "Cảnh quan thiên nhiên trong lành": "Fresh natural ecology and scenery",
  "Du lịch sinh thái cộng đồng": "Community Ecotourism",
  "Trải nghiệm bản địa Thạnh An": "Thanh An authentic local experience",
  "Thưởng thức hải sản tươi tại chỗ": "Enjoy fresh seafood on the spot",
  "🐟 Thủy sản": "🐟 Fisheries",
  "🧂 Làm muối": "🧂 Salt Production",
  "🌲 Rừng ngập mặn": "🌲 Mangroves",
  "⛵ Du lịch cộng đồng": "⛵ Community Tourism",
  "🛍️ Dịch vụ địa phương": "🛍️ Local Services",
  "Thế mạnh": "Strengths",
  "Thủy sản và đời sống biển đảo": "Fisheries & island lifestyle",
  "🐟 Ngư nghiệp chính": "🐟 Main Fisheries",
  "Sinh kế": "Livelihood",
  "Làm muối, vận tải đường thủy": "Salt making, water transport",
  "🧂 Muối & Vận tải": "🧂 Salt & Transport",
  "Sinh thái": "Ecology",
  "Rừng ngập mặn, bãi bồi ven biển": "Mangroves, coastal mudflats",
  "🌲 Khu dự trữ sinh quyển": "🌲 Biosphere Reserve",
  "Du lịch": "Tourism",
  "Du lịch cộng đồng, trải nghiệm đảo": "Community tourism, island tour",
  "📸 Trải nghiệm độc đáo": "📸 Unique Experience",

  // Cam Nang Tabs & Sections
  "Cách di chuyển": "Transportation",
  "Khám phá địa điểm": "Explore Places",
  "Mẹo du lịch và các lưu ý": "Travel Tips & Notes",
  "Lịch trình cụ thể": "Detailed Itinerary",
  "CÁCH DI CHUYỂN": "TRANSPORTATION",
  "Lộ trình tổng quát từ TP.HCM đến đảo Thạnh An": "General route from HCMC to Thanh An Island",
  "CHẶNG": "STAGE",
  "CHI TIẾT": "DETAILS",
  "GIÁ/VÉ": "FARE/TICKET",
  "TP.HCM ➔ Phà Bình Khánh": "HCMC ➔ Binh Khanh Ferry",
  "Phà Bình Khánh ➔ Bến phà Tắc Xuất": "Binh Khanh Ferry ➔ Tac Xuat Terminal",
  "Gửi xe tại bến phà Tắc Xuất": "Parking at Tac Xuat Terminal",
  "Bến phà Tắc Xuất ➔ Đảo Thạnh An": "Tac Xuat Terminal ➔ Thanh An Island",
  "438 Rừng Sác, xã Bình Khánh": "438 Rung Sac, Binh Khanh commune",
  "~43km đường Rừng Sác (1 tiếng xe máy; đường thẳng, dễ đi)": "~43km Rung Sac road (1 hr motorbike; straight & easy)",
  "Các quán nước gần bến": "Drink stalls near the terminal",
  "Mua vé phà, lên phà sang đảo": "Buy ferry tickets, board the boat to the island",
  "Xe máy 1 người:": "Motorbike 1 person:",
  "Xe máy 2 người:": "Motorbike 2 persons:",
  "Qua đêm:": "Overnight:",
  "1 ngày:": "1 day:",
  "7.000đ": "7,000 VND",
  "9.000đ": "9,000 VND",
  "10.000đ": "10,000 VND",
  "20.000đ": "20,000 VND",
  "20.000đ/người": "20,000 VND/person",
  "Lịch phà:": "Ferry schedule:",
  "LỰA CHỌN PHƯƠNG TIỆN DI CHUYỂN": "TRANSPORTATION OPTIONS",
  "KHUYẾN KHÍCH": "RECOMMENDED",
  "Xe máy (khuyến khích)": "Motorbike (Recommended)",
  "Xe buýt (Tuyến 20, 90 & 75)": "Bus (Routes 20, 90 & 75)",
  "Ưu điểm:": "Pros:",
  "Nhược điểm:": "Cons:",
  "Chủ động thời gian, tiết kiệm chi phí, dễ gửi xe": "Flexible timing, budget-friendly, easy parking",
  "Cần sức khỏe, tự lái, trời nắng và mưa ảnh hưởng": "Requires stamina, self-driving, affected by sun/rain",
  "Các tuyến chính:": "Main routes:",
  "An toàn, mát mẻ, có trợ giá cho Học sinh - Sinh viên": "Safe, cool, subsidized for students",
  "Cần đổi tuyến tại phà Bình Khánh, di chuyển ~2 tiếng": "Need to transfer at Binh Khanh ferry, ~2 hrs trip",
  "LƯU Ý KHI DI CHUYỂN": "TRAVEL NOTES",
  "Không nên đi chuyến phà 17g00 về vì đường Rừng Sác tối, ít đèn, khó đi.": "Do not take the 17:00 ferry back as Rung Sac road gets dark with few streetlights.",
  "Chuẩn bị tiền tiền mặt để mua vé phà, ăn uống, chi tiêu trên đảo.": "Prepare cash for ferry tickets, food, and island expenses.",
  "Nếu bị say sóng, nên chuẩn bị sẵn thuốc chống say.": "If you get seasick, bring motion sickness medication.",
  "Hỏi kỹ bác tài phà trước khi lên, tránh lộn nhầm phà đi Vũng Tàu.": "Check with ferry crew before boarding to avoid getting on the Vung Tau ferry.",
  "Mang theo thẻ sinh viên để được trợ giá vé xe buýt (nếu có).": "Bring student ID for bus fare discounts.",
  "Xe buýt ít chuyến, nên đi xe cá nhân sẽ chủ động hơn.": "Buses have low frequency; private transport is more convenient.",

  // Explore Section
  "Khám Phá Địa Điểm Nổi Bật": "Discover Featured Places",
  "Tất cả địa điểm": "All Places",
  "Tham quan": "Sightseeing",
  "Ẩm thực": "Cuisine",
  "Lưu trú": "Accommodation",
  "Đang tải dữ liệu...": "Loading data...",

  // Tips & Green Rules Section
  "Mẹo Du Lịch & Cẩm Nang Bỏ Túi": "Travel Tips & Pocket Guide",
  "Chuẩn bị tiền mặt": "Prepare Cash",
  "Trên đảo không có cây ATM. Bạn nên chuẩn bị sẵn tiền mặt lẻ để mua vé phà, ăn uống và mua đặc sản.": "There are no ATMs on the island. Bring small cash bills for ferry tickets, dining, and local products.",
  "Sóng 4G & Điện": "4G Signal & Electricity",
  "Sóng thoại và 4G (Viettel, Vina, Mobi) phủ tốt. Đảo dùng điện lưới quốc gia 24/24 ổn định.": "Cellular signal & 4G (Viettel, Vina, Mobi) are good. The island has stable 24/7 national grid power.",
  "Nước ngọt": "Fresh Water",
  "Đảo dùng nước máy sạch từ đất liền. Tuy nhiên nên tiết kiệm nước ngọt và dùng nước đóng chai khi uống.": "Fresh tap water comes from mainland. Please conserve fresh water and use bottled water for drinking.",
  "Y tế & An ninh": "Medical & Security",
  "Có Trạm Y tế xã Đảo Thạnh An và Công an Xã. Đảo rất an ninh, người dân thân thiện và mến khách.": "There is a local Health Station and Commune Police. The island is very safe and friendly.",
  "Thời điểm đi": "Best Time to Visit",
  "Nên đi vào mùa khô (tháng 12 đến tháng 4). Tránh các ngày mưa bão bãi bồi sẽ bị lầy và sóng lớn.": "Best to visit in dry season (Dec to Apr). Avoid rainy stormy days when mudflats get slippery.",

  // Itinerary Section
  "GỢI Ý LỊCH TRÌNH 1 NGÀY (SÁNG ĐI CHIỀU VỀ)": "SUGGESTED 1-DAY ITINERARY (MORNING TO AFTERNOON)",
  "GỢI Ý LỊCH TRÌNH 2 NGÀY 1 ĐÊM (QUA ĐÊM ĐẢO)": "SUGGESTED 2-DAY 1-NIGHT ITINERARY (OVERNIGHT)",
  "SÁNG (6:00 - 11:30)": "MORNING (6:00 - 11:30)",
  "TRƯA (11:30 - 14:00)": "NOON (11:30 - 14:00)",
  "CHIỀU (14:00 - 17:00)": "AFTERNOON (14:00 - 17:00)",
  "NGÀY 1": "DAY 1",
  "NGÀY 2": "DAY 2",

  // Rules & Tips
  "QUY ĐỊNH HẠN CHẾ RÁC THẢI NHỰA": "PLASTIC WASTE RESTRICTION RULES",
  "Cùng chung tay bảo vệ môi trường biển đảo": "Join hands to protect the island environment",
  "Không nhựa dùng một lần": "No single-use plastic",
  "Hạn chế mang ly, ống hút, túi nilon ra đảo.": "Limit bringing cups, straws, plastic bags to the island.",
  "Mang bình cá nhân": "Bring personal water bottles",
  "Sử dụng bình nước cá nhân để giảm rác thải.": "Use personal water bottles to reduce waste.",
  "Phân loại rác": "Sort waste",
  "Bỏ rác đúng nơi quy định, phân loại theo hướng dẫn.": "Dispose of waste in designated areas.",
  "Bảo vệ đại dương": "Protect the ocean",
  "Không vứt rác xuống biển, tôn trọng sinh vật biển.": "Do not litter into the sea, respect marine life.",

  // Footer
  "MẠNG XÃ HỘI": "SOCIAL MEDIA",
  "THÔNG TIN LIÊN HỆ": "CONTACT INFO",
  "Phòng A.210, 669 Đỗ Mười, Linh Xuân, TP.HCM": "Room A.210, 669 Do Muoi, Linh Xuan, HCMC",
  "© 2026 Đoàn Trường Đại học Kinh tế - Luật, ĐHQG-HCM.": "© 2026 UEL Youth Union, VNU-HCM."
};

function translatePhraseFast(text) {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();
  if (staticPhraseMap[trimmed]) return staticPhraseMap[trimmed];

  const clean = trimmed.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (staticPhraseMap[clean]) return staticPhraseMap[clean];
  return null;
}

// Auto-Translate VI to IELTS 8.0 EN with 2s timeout
async function translateViToIelts8En(textVi) {
  if (!textVi || !textVi.trim()) return '';
  const trimmed = textVi.trim();
  if (translationCache[trimmed]) return translationCache[trimmed];

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = trimmed;
  const plainText = tempDiv.textContent || tempDiv.innerText || trimmed;
  
  if (!plainText.trim() || /^\d+[\d\s:.,đđĐ-]*$/.test(plainText.trim())) {
    return textVi;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(plainText)}`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    let translated = data[0].map(item => item[0]).join(' ');
    translated = polishToIelts8(translated);
    translationCache[trimmed] = translated;
    return translated;
  } catch(e) {
    return textVi;
  }
}

// I18n Toggle with Real-Time Global Translation & Persistence
function toggleLanguage() {
  try {
    currentLang = currentLang === 'VI' ? 'EN' : 'VI';
    localStorage.setItem('site_lang', currentLang);
    
    const langLabels = document.querySelectorAll('#lang-label, .lang-label');
    langLabels.forEach(lbl => {
      if (lbl) lbl.innerText = currentLang === 'VI' ? 'EN' : 'VI';
    });
    
    try {
      if (currentLang === 'EN') {
        showToast("🌐 Đang chuyển Tiếng Anh...");
      } else {
        showToast("🇻🇳 Đã chuyển sang Tiếng Việt");
      }
    } catch(e) {}

    applyLanguage();
  } catch(err) {
    console.error("toggleLanguage error:", err);
  }
}
window.toggleLang = toggleLanguage;
window.toggleLanguage = toggleLanguage;

async function applyLanguage() {
  const langLabels = document.querySelectorAll('#lang-label, .lang-label');
  langLabels.forEach(lbl => {
    lbl.innerText = currentLang === 'VI' ? 'EN' : 'VI';
  });

  const dict = typeof translations !== 'undefined' ? translations[currentLang] : null;

  if (currentLang === 'EN') {
    // 1. Translate nav-links SAFELY
    document.querySelectorAll('.nav-links a').forEach(a => {
      if (!a.getAttribute('data-vi-original')) {
        a.setAttribute('data-vi-original', a.innerHTML);
      }
      const rawVi = a.getAttribute('data-vi-original').trim();
      if (staticPhraseMap[rawVi]) {
        a.innerHTML = staticPhraseMap[rawVi];
      }
    });

    // 2. Target LEAF elements across all subpages
    const targets = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, td, th, li, span, button, a.btn, label, option, .stat-pill-label, .stat-pill-val, .v-stat-title, .v-stat-sub, .pill-tag, .mini-card-badge, .card-sub-badge, .tab-btn, .filter-btn, .rec-tag, .sub-lead, .section-title, .sub-section-title, .alert-bar div, strong, .badge-step, .vehicle-card h4, .tip-card h3, .tip-card p, .route-card h3, .alert-box h4, .alert-box p, [data-editable], [data-i18n]'
    );

    const validElements = Array.from(targets).filter(el => {
      if (el.closest('.nav-links') || el.closest('#admin-toolbar') || el.closest('.admin-login-card') || el.id === 'lang-label' || el.classList.contains('lang-toggle-btn')) return false;
      const text = el.innerText || el.textContent;
      return text && text.trim().length > 0;
    });

    validElements.forEach(el => {
      if (!el.getAttribute('data-vi-original')) {
        el.setAttribute('data-vi-original', el.innerHTML);
      }
      
      const key = el.id || el.getAttribute('data-editable') || el.getAttribute('data-i18n');
      if (dict && dict[key]) {
        el.innerHTML = dict[key];
        return;
      }

      const viHtml = el.getAttribute('data-vi-original').trim();
      const directMatch = translatePhraseFast(viHtml);
      if (directMatch) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = viHtml;
        const innerIcons = tempDiv.querySelectorAll('i, svg, img');
        if (innerIcons.length > 0) {
          const textNodes = [];
          const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while(node = walk.nextNode()) {
            if (node.nodeValue && node.nodeValue.trim().length > 0) textNodes.push(node);
          }
          textNodes.forEach(tn => {
            const m = translatePhraseFast(tn.nodeValue);
            if (m) tn.nodeValue = m;
          });
          el.innerHTML = tempDiv.innerHTML;
        } else {
          el.innerHTML = directMatch;
        }
        return;
      }

      // Check inner text nodes
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = viHtml;
      const textNodes = [];
      const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while(node = walk.nextNode()) {
        if (node.nodeValue && node.nodeValue.trim().length > 0) {
          textNodes.push(node);
        }
      }

      let changed = false;
      for (let tn of textNodes) {
        const matched = translatePhraseFast(tn.nodeValue);
        if (matched) {
          tn.nodeValue = matched;
          changed = true;
        }
      }
      if (changed) {
        el.innerHTML = tempDiv.innerHTML;
      }
    });

    // 3. Background async translation for any remaining unmapped paragraphs
    const unTranslated = validElements.filter(el => {
      const viHtml = el.getAttribute('data-vi-original') || '';
      return el.innerHTML === viHtml && viHtml.trim().length > 0;
    });

    let idx = 0;
    async function processRemaining() {
      if (idx >= unTranslated.length || currentLang !== 'EN') return;
      const chunk = unTranslated.slice(idx, idx + 10);
      idx += 10;

      await Promise.all(chunk.map(async (el) => {
        const viHtml = el.getAttribute('data-vi-original');
        if (!viHtml || !viHtml.trim()) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = viHtml;
        const hasIcons = tempDiv.querySelector('i, svg, img');

        if (hasIcons) {
          const textNodes = [];
          const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while(node = walk.nextNode()) {
            if (node.nodeValue && node.nodeValue.trim().length > 0) textNodes.push(node);
          }
          await Promise.all(textNodes.map(async (tn) => {
            const enVal = await translateViToIelts8En(tn.nodeValue);
            if (enVal) tn.nodeValue = enVal;
          }));
          el.innerHTML = tempDiv.innerHTML;
        } else if (!viHtml.includes('<iframe') && !viHtml.includes('<svg')) {
          const enText = await translateViToIelts8En(viHtml);
          if (enText) el.innerHTML = enText;
        }
      }));

      if (idx < unTranslated.length && currentLang === 'EN') {
        requestAnimationFrame(processRemaining);
      }
    }

    requestAnimationFrame(processRemaining);
  } else {
    // Restore original Vietnamese (0ms instant)
    document.querySelectorAll('[data-vi-original]').forEach(el => {
      el.innerHTML = el.getAttribute('data-vi-original');
    });
  }
}

// Auto-apply saved language choice & admin status when ANY page loads
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('site_lang');
  if (savedLang === 'EN') {
    currentLang = 'EN';
    setTimeout(() => applyLanguage(), 100);
  }
  try { checkAdminStatus(); } catch(e) {}
});

window.addEventListener('load', () => {
  const savedLang = localStorage.getItem('site_lang');
  if (savedLang === 'EN') {
    currentLang = 'EN';
    applyLanguage();
  }
});

// Admin Sidebar Drawer Panel (Thanh bên Quản trị)
function openAdminSidebar() {
  injectAdminSidebarUI();
  const drawer = document.getElementById('admin-sidebar-drawer');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  updateAdminSidebarContent();
  if (drawer) drawer.style.right = '0';
  if (backdrop) {
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
  }
}

function closeAdminSidebar() {
  const drawer = document.getElementById('admin-sidebar-drawer');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (drawer) drawer.style.right = '-400px';
  if (backdrop) {
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
  }
}

function injectAdminSidebarUI() {
  if (!document.getElementById('admin-sidebar-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'admin-sidebar-backdrop';
    backdrop.onclick = closeAdminSidebar;
    backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); z-index:999998; opacity:0; pointer-events:none; transition:opacity 0.3s ease;';
    document.body.appendChild(backdrop);
  }

  if (!document.getElementById('admin-sidebar-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'admin-sidebar-drawer';
    drawer.style.cssText = 'position:fixed; top:0; right:-400px; width:380px; max-width:90vw; height:100vh; background:#ffffff; box-shadow:-10px 0 35px rgba(0,0,0,0.25); z-index:999999; transition:right 0.35s cubic-bezier(0.4,0,0.2,1); font-family:sans-serif; overflow-y:auto; padding:25px 20px; box-sizing:border-box;';
    document.body.appendChild(drawer);
  }
}

function updateAdminSidebarContent() {
  const drawer = document.getElementById('admin-sidebar-drawer');
  if (!drawer) return;

  const isLogged = localStorage.getItem('admin_logged_in') === 'true';

  if (!isLogged) {
    drawer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:15px; margin-bottom:20px;">
        <h3 style="margin:0; color:#0f172a; font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-lock" style="color:#0284c7;"></i> QUẢN TRỊ WEBSITE
        </h3>
        <button onclick="closeAdminSidebar()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
      </div>

      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:15px; margin-bottom:20px; text-align:center;">
        <i class="fas fa-user-shield" style="font-size:2.2rem; color:#0284c7; margin-bottom:8px;"></i>
        <h4 style="margin:0 0 5px 0; color:#0369a1;">Đăng nhập để Quản trị</h4>
        <p style="margin:0; font-size:0.82rem; color:#64748b;">Nhập mật khẩu quản trị để chỉnh sửa nội dung, quản lý danh sách địa điểm & ảnh trực tiếp.</p>
      </div>

      <form onsubmit="submitSidebarPass(event)">
        <div style="margin-bottom:15px;">
          <label style="display:block; font-weight:bold; font-size:0.85rem; color:#334155; margin-bottom:6px;">Mật khẩu Quản trị</label>
          <input type="password" id="sidebar-pass-input" placeholder="Nhập mật khẩu (26031931)" required style="width:100%; padding:12px 14px; border-radius:10px; border:2px solid #cbd5e1; font-size:0.95rem; box-sizing:border-box; outline:none;">
        </div>
        <div id="sidebar-err-msg" style="color:#ef4444; font-weight:bold; font-size:0.85rem; margin-bottom:12px; display:none;">❌ Mật khẩu không chính xác!</div>
        <button type="submit" style="width:100%; background:#0284c7; color:white; border:none; padding:13px; border-radius:10px; font-weight:bold; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 15px rgba(2,132,199,0.3);">
          🔓 Đăng Nhập & Mở Chức Năng
        </button>
      </form>
    `;
    return;
  }

  // LOGGED IN STATE - BUILD RICH EDITABLE CARDS FOR ALL PLACES
  let currentPlaces = [];
  try {
    currentPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
  } catch(e) {}
  if (!currentPlaces || currentPlaces.length === 0) {
    currentPlaces = [...placesData];
  }

  let placesHtml = '';
  if (currentPlaces.length === 0) {
    placesHtml = `<div style="font-size:0.82rem; color:#94a3b8; text-align:center; padding:15px; background:#f8fafc; border-radius:10px;">Chưa có địa điểm nào. Bấm nút "+ Thêm Mới" ở trên để nhập!</div>`;
  } else {
    currentPlaces.forEach((p, idx) => {
      const pImg = p.img || p.imageUrl || '';
      placesHtml += `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:12px; margin-bottom:12px; position:relative; text-align:left;">
          <button onclick="deletePlaceFromSidebar('${p.id || idx}')" title="Xóa địa điểm này" style="position:absolute; top:8px; right:8px; background:#ef4444; color:white; border:none; width:24px; height:24px; border-radius:50%; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.75rem;">
            &times;
          </button>
          <div style="font-weight:bold; font-size:0.85rem; color:#0369a1; margin-bottom:8px; padding-right:25px;">
            📍 地 điểm #${idx + 1}
          </div>
          
          <div style="margin-bottom:6px;">
            <label style="display:block; font-size:0.75rem; color:#64748b; font-weight:600; margin-bottom:2px;">Tên địa điểm</label>
            <input type="text" id="side-p-name-${idx}" value="${(p.name || '').replace(/"/g, '&quot;')}" style="width:100%; padding:6px 8px; border-radius:6px; border:1px solid #cbd5e1; font-size:0.82rem; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:6px;">
            <label style="display:block; font-size:0.75rem; color:#64748b; font-weight:600; margin-bottom:2px;">Link Ảnh Google Drive</label>
            <input type="text" id="side-p-img-${idx}" value="${(pImg || '').replace(/"/g, '&quot;')}" style="width:100%; padding:6px 8px; border-radius:6px; border:1px solid #cbd5e1; font-size:0.8rem; box-sizing:border-box;">
          </div>

          <div style="margin-bottom:8px;">
            <label style="display:block; font-size:0.75rem; color:#64748b; font-weight:600; margin-bottom:2px;">Mô tả ngắn</label>
            <textarea id="side-p-desc-${idx}" rows="2" style="width:100%; padding:6px 8px; border-radius:6px; border:1px solid #cbd5e1; font-size:0.8rem; box-sizing:border-box;">${p.description || ''}</textarea>
          </div>

          <button onclick="saveSinglePlaceFromSidebar(${idx})" style="width:100%; background:#0284c7; color:white; border:none; padding:7px; border-radius:6px; font-weight:bold; font-size:0.8rem; cursor:pointer;">
            💾 Cập nhật địa điểm này
          </button>
        </div>
      `;
    });
  }

  drawer.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:15px; margin-bottom:18px;">
      <div>
        <span style="background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:12px; font-size:0.75rem; font-weight:800;">● ĐÃ ĐĂNG NHẬP</span>
        <h3 style="margin:4px 0 0 0; color:#0f172a; font-size:1.15rem; font-weight:800;">THANH QUẢN TRỊ BÊN</h3>
      </div>
      <button onclick="closeAdminSidebar()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
    </div>

    <!-- Quick Tool Actions -->
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:12px; margin-bottom:18px; display:flex; gap:8px;">
      <button onclick="toggleInlineEditing()" style="flex:1; background:${editMode ? '#10b981' : '#0284c7'}; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer;">
        <i class="fas ${editMode ? 'fa-check' : 'fa-pencil-alt'}"></i> ${editMode ? 'Đang Bật Sửa' : 'Sửa Trực Tiếp'}
      </button>
      <button onclick="saveEdits()" style="flex:1; background:#10b981; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer;">
        <i class="fas fa-save"></i> Lưu Thay Đổi
      </button>
    </div>

    <!-- Section 1: Danh sách địa điểm đã nhập -->
    <div style="margin-bottom:20px; border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:white;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="margin:0; font-size:0.9rem; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:6px;">
          <i class="fas fa-map-marked-alt" style="color:#0284c7;"></i> Địa Điểm Đã Thêm (${currentPlaces.length})
        </h4>
        <button onclick="openAddPlaceModal()" style="background:#0284c7; color:white; border:none; padding:5px 10px; border-radius:6px; font-weight:bold; font-size:0.75rem; cursor:pointer;">
          + Thêm Mới
        </button>
      </div>

      <div id="sidebar-places-list">
        ${placesHtml}
      </div>
    </div>

    <!-- Section 2: Quản lý Cẩm Nang Số PDF -->
    <div style="margin-bottom:20px; border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:white;">
      <h4 style="margin:0 0 8px 0; font-size:0.9rem; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:6px;">
        <i class="fas fa-file-pdf" style="color:#0d9488;"></i> Cẩm Nang Số PDF 3D
      </h4>
      <p style="margin:0 0 10px 0; font-size:0.78rem; color:#64748b;">Up file PDF từ máy tính để hiển thị dưới dạng Sách Lật 3D.</p>
      <button onclick="uploadPdfFileDirectly()" style="width:100%; background:#0d9488; color:white; border:none; padding:9px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
        <i class="fas fa-upload"></i> Up File PDF Từ Máy Tính
      </button>
    </div>

    <!-- Section 3: Thư viện hình ảnh -->
    <div style="margin-bottom:20px; border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:white;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <h4 style="margin:0; font-size:0.9rem; color:#0f172a; font-weight:800; display:flex; align-items:center; gap:6px;">
          <i class="fas fa-camera" style="color:#0369a1;"></i> Thư Viện Ảnh
        </h4>
        <button onclick="openAddGalleryModal()" style="background:#0369a1; color:white; border:none; padding:5px 10px; border-radius:6px; font-weight:bold; font-size:0.75rem; cursor:pointer;">
          + Thêm Ảnh
        </button>
      </div>
      <p style="margin:0; font-size:0.78rem; color:#64748b;">Thêm hình ảnh hoạt động, phong cảnh Thạnh An bằng link Google Drive.</p>
    </div>

    <!-- Footer Logout -->
    <div style="border-top:1px solid #e2e8f0; padding-top:12px; margin-top:12px;">
      <button onclick="adminLogout()" style="width:100%; background:#ef4444; color:white; border:none; padding:9px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer;">
        🚪 Đăng Xuất Quản Trị
      </button>
    </div>
  `;
}

function submitSidebarPass(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('sidebar-pass-input');
  const err = document.getElementById('sidebar-err-msg');
  const pass = input ? input.value.trim() : '';

  if (pass === '26031931') {
    if (err) err.style.display = 'none';
    localStorage.setItem('admin_logged_in', 'true');
    updateAdminSidebarContent();
    startEditing();
    showToast("🎉 Đã đăng nhập quản trị thành công!");
  } else {
    if (err) err.style.display = 'block';
  }
}

function saveSinglePlaceFromSidebar(idx) {
  const nameEl = document.getElementById(`side-p-name-${idx}`);
  const imgEl = document.getElementById(`side-p-img-${idx}`);
  const descEl = document.getElementById(`side-p-desc-${idx}`);

  if (!nameEl) return;
  const newName = nameEl.value.trim();
  const newImg = imgEl ? imgEl.value.trim() : '';
  const newDesc = descEl ? descEl.value.trim() : '';

  try {
    let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
    if (localPlaces[idx]) {
      localPlaces[idx].name = newName;
      localPlaces[idx].img = newImg;
      localPlaces[idx].imageUrl = newImg;
      localPlaces[idx].description = newDesc;
      localStorage.setItem('local_places', JSON.stringify(localPlaces));
    }
  } catch(e) {}

  showToast(`💾 Đã cập nhật địa điểm #${idx + 1}!`);
  loadPlacesForMap();
  updateAdminSidebarContent();
}

function deletePlaceFromSidebar(idOrIdx) {
  if (!confirm("Bạn có chắc chắn muốn xóa địa điểm này khỏi hệ thống?")) return;

  try {
    let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
    if (typeof idOrIdx === 'number' || !isNaN(idOrIdx)) {
      localPlaces.splice(parseInt(idOrIdx), 1);
    } else {
      localPlaces = localPlaces.filter(p => p.id !== idOrIdx);
    }
    localStorage.setItem('local_places', JSON.stringify(localPlaces));
  } catch(e) {}

  showToast("🗑️ Đã xóa địa điểm thành công!");
  loadPlacesForMap();
  updateAdminSidebarContent();
}

// Dynamic Injection of Admin UI & Floating Pencil FAB Button
function injectAdminUI() {
  let floatBtn = document.getElementById('admin-floating-pencil-btn');
  if (floatBtn) {
    floatBtn.style.display = 'none';
  }

  const footerFab = document.getElementById('admin-pencil-fab');
  if (footerFab) {
    footerFab.style.display = 'none';
  }

  const adminFab = document.querySelector('.admin-fab');
  if (adminFab) {
    adminFab.style.display = 'none';
  }

  if (!document.getElementById('admin-toolbar')) {
    const toolbar = document.createElement('div');
    toolbar.id = 'admin-toolbar';
    toolbar.className = 'admin-toolbar';
    toolbar.style.cssText = 'position:fixed !important; bottom:0 !important; top:auto !important; left:0 !important; width:100% !important; height:auto !important; max-height:85px !important; background:#0f172a !important; color:white !important; padding:8px 18px !important; z-index:9999 !important; display:none; align-items:center; justify-content:space-between; box-shadow:0 -4px 20px rgba(0,0,0,0.4) !important; font-family:sans-serif; flex-wrap:wrap; gap:8px; box-sizing:border-box !important;';
    toolbar.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; font-weight:bold; color:#38bdf8; font-size:0.88rem;">
        <i class="fas fa-user-shield"></i> QUẢN TRỊ TRỰC TIẾP
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <button onclick="openAddPlaceModal()" style="background:#0284c7; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:5px;">
          <i class="fas fa-plus-circle"></i> Thêm Địa Điểm
        </button>
        <button onclick="openAddGalleryModal()" style="background:#0369a1; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:5px;">
          <i class="fas fa-camera"></i> Thêm Ảnh
        </button>
        <button onclick="uploadPdfFileDirectly()" style="background:#0d9488; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:5px;">
          <i class="fas fa-file-pdf"></i> Up File PDF
        </button>
        <button onclick="saveEdits()" style="background:#10b981; color:white; border:none; padding:7px 14px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:5px;">
          <i class="fas fa-save"></i> Lưu Thay Đổi
        </button>
        <button onclick="adminLogout()" style="background:#ef4444; color:white; border:none; padding:7px 10px; border-radius:8px; font-weight:bold; font-size:0.82rem; cursor:pointer;">
          Thoát
        </button>
      </div>
    `;
    document.body.appendChild(toolbar);
  }

  if (!document.getElementById('toast')) {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
}

// On-Page Modal to Add New Place
function openAddPlaceModal() {
  let modal = document.getElementById('add-place-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'add-place-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:white; border-radius:20px; padding:30px; max-width:480px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,0.3); text-align:left; position:relative; font-family:sans-serif;">
        <button onclick="closeAddPlaceModal()" style="position:absolute; top:15px; right:18px; background:none; border:none; font-size:1.4rem; color:#64748b; cursor:pointer;">&times;</button>
        <h3 style="margin:0 0 15px 0; color:#0369a1; font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-map-marker-alt"></i> Thêm Địa Điểm Nổi Bật Mới
        </h3>
        <form onsubmit="savePlaceDirectly(event)">
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Tên địa điểm *</label>
            <input type="text" id="modal-place-name" placeholder="Ví dụ: Bờ Kè Đá Thạnh An" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Phân loại địa điểm</label>
            <select id="modal-place-type" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
              <option value="tham-quan">📍 Tham quan / Điểm đến</option>
              <option value="an-uong">🍜 Ẩm thực / Ăn uống</option>
              <option value="luu-tru">🏨 Lưu trú / Homestay</option>
              <option value="dich-vu">🛍️ Dịch vụ / Tiện ích</option>
            </select>
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Link Ảnh Google Drive (URL) *</label>
            <input type="text" id="modal-place-img" placeholder="https://drive.google.com/file/d/..." required style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Mô tả ngắn</label>
            <textarea id="modal-place-desc" rows="2" placeholder="Nhập giới thiệu ngắn gọn..." style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;"></textarea>
          </div>
          <button type="submit" id="btn-save-place-direct" style="width:100%; background:#0284c7; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:0.95rem; cursor:pointer;">
            ➕ Thêm Địa Điểm Lên Trang Chủ
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

function closeAddPlaceModal() {
  const modal = document.getElementById('add-place-modal');
  if (modal) modal.style.display = 'none';
}

async function savePlaceDirectly(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-place-direct');
  if (btn) { btn.disabled = true; btn.innerText = '⌛ Đang lưu...'; }

  const name = document.getElementById('modal-place-name').value.trim();
  const type = document.getElementById('modal-place-type').value;
  const imgRaw = document.getElementById('modal-place-img').value.trim();
  const desc = document.getElementById('modal-place-desc').value.trim();

  const newPlace = {
    id: 'place_' + Date.now(),
    name, type, category: type,
    img: imgRaw, imageUrl: imgRaw,
    description: desc,
    featured: true,
    lat: 10.4678 + (Math.random() * 0.01),
    lng: 106.8962 + (Math.random() * 0.01),
    createdAt: new Date().toISOString()
  };

  // Instant local cache so user never waits
  try {
    let localPlaces = JSON.parse(localStorage.getItem('local_places') || '[]');
    localPlaces.unshift(newPlace);
    localStorage.setItem('local_places', JSON.stringify(localPlaces));
  } catch(err) {}

  // Firestore save with 2.5s timeout race
  try {
    if (typeof firebase !== 'undefined' && firebase.auth && !firebase.auth().currentUser) {
      await firebase.auth().signInAnonymously().catch(() => {});
    }

    const firestoreSave = db.collection('places').add({
      name, type, category: type,
      img: imgRaw, imageUrl: imgRaw,
      description: desc,
      featured: true,
      lat: newPlace.lat,
      lng: newPlace.lng,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    const timeout = new Promise(resolve => setTimeout(() => resolve('timeout'), 2500));
    await Promise.race([firestoreSave, timeout]);
  } catch(err) {
    console.warn("Firestore save fallback to local:", err);
  }

  showToast(`📍 Đã thêm địa điểm "${name}" thành công!`);
  closeAddPlaceModal();
  setTimeout(() => window.location.reload(), 400);
}

// On-Page Modal to Add New Photo to Gallery
function openAddGalleryModal() {
  let modal = document.getElementById('add-gallery-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'add-gallery-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:white; border-radius:20px; padding:30px; max-width:480px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,0.3); text-align:left; position:relative; font-family:sans-serif;">
        <button onclick="closeAddGalleryModal()" style="position:absolute; top:15px; right:18px; background:none; border:none; font-size:1.4rem; color:#64748b; cursor:pointer;">&times;</button>
        <h3 style="margin:0 0 15px 0; color:#0369a1; font-size:1.25rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-camera"></i> Thêm Ảnh Mới Vào Thư Viện
        </h3>
        <form onsubmit="saveGalleryDirectly(event)">
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Tiêu đề hình ảnh *</label>
            <input type="text" id="modal-gallery-title" placeholder="Ví dụ: Hoàng hôn làng chài" required style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Phân loại hình ảnh</label>
            <select id="modal-gallery-cat" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
              <option value="bien-dao">🌊 Biển đảo</option>
              <option value="lang-chai">⚓ Làng chài</option>
              <option value="thieng-lieng">🌾 Thiềng Liềng</option>
              <option value="am-thuc">🍜 Ẩm thực</option>
              <option value="su-kien">🎉 Sự kiện / Cộng đồng</option>
            </select>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; font-weight:bold; font-size:0.82rem; color:#334155; margin-bottom:4px;">Link Ảnh Google Drive (URL) *</label>
            <input type="text" id="modal-gallery-url" placeholder="https://drive.google.com/file/d/..." required style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; font-size:0.9rem; box-sizing:border-box;">
          </div>
          <button type="submit" id="btn-save-gallery-direct" style="width:100%; background:#0284c7; color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; font-size:0.95rem; cursor:pointer;">
            ➕ Thêm Ảnh Vào Thư Viện
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
}

function closeAddGalleryModal() {
  const modal = document.getElementById('add-gallery-modal');
  if (modal) modal.style.display = 'none';
}

async function saveGalleryDirectly(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-gallery-direct');
  if (btn) { btn.disabled = true; btn.innerText = 'Đang lưu...'; }

  const title = document.getElementById('modal-gallery-title').value.trim();
  const category = document.getElementById('modal-gallery-cat').value;
  const url = document.getElementById('modal-gallery-url').value.trim();

  try {
    await db.collection('gallery').add({
      title, category, url, imageUrl: url,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast(`🖼️ Đã thêm ảnh "${title}" vào thư viện!`);
    closeAddGalleryModal();
    setTimeout(() => window.location.reload(), 1000);
  } catch(err) {
    console.error("Lỗi khi thêm ảnh:", err);
    showToast("Lỗi khi thêm ảnh!");
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '➕ Thêm Ảnh Vào Thư Viện'; }
  }
}

// Admin Login Modal Popup
function openAdminLoginModal() {
  const isLogged = localStorage.getItem('admin_logged_in') === 'true';
  if (isLogged) {
    if (!editMode) {
      startEditing();
      const tb = document.getElementById('admin-toolbar');
      if (tb) tb.style.display = 'flex';
      showToast("✏️ Đã bật Chế độ Chỉnh sửa trực tiếp!");
    } else {
      showToast("ℹ️ Bạn đang ở Chế độ Chỉnh sửa trực tiếp.");
    }
    return;
  }

  let modal = document.getElementById('admin-login-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.8); backdrop-filter:blur(6px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:white; border-radius:20px; padding:35px 30px; max-width:420px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,0.3); text-align:center; position:relative; font-family:sans-serif;">
        <button onclick="closeAdminModal()" style="position:absolute; top:15px; right:18px; background:none; border:none; font-size:1.4rem; color:#64748b; cursor:pointer;">&times;</button>
        <div style="width:60px; height:60px; background:#e0f2fe; color:#0284c7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto; font-size:1.6rem;">
          <i class="fas fa-lock"></i>
        </div>
        <h3 style="margin:0 0 8px 0; color:#0f172a; font-size:1.35rem; font-weight:800;">ĐĂNG NHẬP QUẢN TRỊ</h3>
        <p style="margin:0 0 20px 0; color:#64748b; font-size:0.9rem; line-height:1.4;">Nhập mật khẩu quản trị để bật Cây Bút & Chỉnh sửa trực tiếp nội dung trên trang này.</p>
        
        <form onsubmit="submitAdminModalLogin(event)">
          <div style="margin-bottom:15px; text-align:left;">
            <label style="display:block; margin-bottom:6px; font-weight:bold; font-size:0.85rem; color:#334155;">Mật khẩu Quản trị</label>
            <input type="password" id="admin-modal-pass" placeholder="Nhập mật khẩu (Mặc định: 26031931)" style="width:100%; padding:12px 15px; border-radius:10px; border:2px solid #cbd5e1; font-size:1rem; box-sizing:border-box; outline:none;" required>
          </div>
          <div id="admin-modal-error" style="color:#ef4444; font-weight:bold; font-size:0.85rem; margin-bottom:12px; display:none;">❌ Mật khẩu không chính xác!</div>
          <button type="submit" style="width:100%; background:#0284c7; color:white; border:none; padding:13px; border-radius:10px; font-weight:bold; font-size:1rem; cursor:pointer; box-shadow:0 4px 15px rgba(2,132,199,0.3);">
            🔓 Bật Chế Độ Chỉnh Sửa Trực Tiếp
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
  
  setTimeout(() => {
    const input = document.getElementById('admin-modal-pass');
    if (input) { input.value = ''; input.focus(); }
  }, 100);
}

function closeAdminModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.style.display = 'none';
}

function submitAdminModalLogin(e) {
  if (e) e.preventDefault();
  const passInput = document.getElementById('admin-modal-pass');
  const errEl = document.getElementById('admin-modal-error');
  const pass = passInput ? passInput.value.trim() : '';

  if (pass === '26031931') {
    if (errEl) errEl.style.display = 'none';
    localStorage.setItem('admin_logged_in', 'true');
    closeAdminModal();
    startEditing();
    const tb = document.getElementById('admin-toolbar');
    if (tb) tb.style.display = 'flex';
    document.querySelectorAll('#admin-floating-pencil-btn, #admin-pencil-fab').forEach(btn => {
      btn.style.background = '#10b981';
      btn.innerHTML = '<i class="fas fa-save"></i>';
      btn.title = 'Bấm để Lưu tất cả thay đổi trên trang';
    });
    showToast("🎉 ĐÃ BẬT CHẾ ĐỘ CHỈNH SỬA! Bấm trực tiếp vào văn bản để sửa, bấm vào ảnh để đổi link Google Drive.");
  } else {
    if (errEl) errEl.style.display = 'block';
  }
}

function toggleInlineEditing() {
  const isLogged = localStorage.getItem('admin_logged_in') === 'true';

  if (!editMode) {
    if (!isLogged) {
      openAdminLoginModal();
      return;
    }

    startEditing();
    const tb = document.getElementById('admin-toolbar');
    if (tb) tb.style.display = 'flex';

    document.querySelectorAll('#admin-floating-pencil-btn, #admin-pencil-fab').forEach(btn => {
      btn.style.background = '#10b981';
      btn.innerHTML = '<i class="fas fa-save"></i>';
      btn.title = 'Bấm để Lưu tất cả thay đổi trên trang';
    });
    showToast("✏️ ĐÃ BẬT CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP! Bấm vào dòng chữ bất kỳ để sửa.");
  } else {
    saveEdits();
    document.querySelectorAll('#admin-floating-pencil-btn, #admin-pencil-fab').forEach(btn => {
      btn.style.background = '#0284c7';
      btn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
      btn.title = 'Bấm để Bật chế độ chỉnh sửa cây bút';
    });
  }
}

function uploadPdfFileDirectly() {
  let fileInput = document.getElementById('global-pdf-file-input');
  if (fileInput) {
    document.body.removeChild(fileInput);
  }
  
  fileInput = document.createElement('input');
  fileInput.id = 'global-pdf-file-input';
  fileInput.type = 'file';
  fileInput.accept = 'application/pdf,.pdf';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      if (document.body.contains(fileInput)) document.body.removeChild(fileInput);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert("❌ Vui lòng chọn đúng file định dạng PDF (.pdf)!");
      if (document.body.contains(fileInput)) document.body.removeChild(fileInput);
      return;
    }

    showToast(`⏳ Đang lưu file Cẩm nang PDF [${file.name}]...`);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const pdfDataUrl = event.target.result;
      
      // 1. Try LocalStorage
      try {
        localStorage.setItem('local_pdf_data', pdfDataUrl);
        localStorage.setItem('local_pdf_name', file.name);
      } catch(err) {
        console.warn("LocalStorage quota full, using IndexedDB storage.");
      }

      // 2. Wait until IndexedDB write COMPLETELY finishes
      await savePdfToIndexedDB(pdfDataUrl, file.name);

      // 3. Cloud Firestore Chunk Sync (Syncs across ALL devices globally)
      try {
        if (typeof db !== 'undefined' && db.collection) {
          showToast(`☁️ Đang đồng bộ Cẩm Nang PDF 3MB lên Cloud Firestore...`);
          
          const chunkSize = 350 * 1024; // 350KB per chunk
          const totalChunks = Math.ceil(pdfDataUrl.length / chunkSize);

          const chunkPromises = [];
          for (let i = 0; i < totalChunks; i++) {
            const chunkData = pdfDataUrl.substr(i * chunkSize, chunkSize);
            chunkPromises.push(db.collection('pdf_chunks').doc(`chunk_${i}`).set({
              index: i,
              data: chunkData,
              updatedAt: new Date().toISOString()
            }));
          }

          await Promise.all(chunkPromises);

          const docData = {
            fileName: file.name,
            totalChunks: totalChunks,
            updatedAt: new Date().toISOString()
          };
          if (pdfDataUrl.length < 900000) {
            docData.url = pdfDataUrl;
            docData.pdfDataUrl = pdfDataUrl;
          }

          await db.collection('system_config').doc('pdf_file').set(docData, { merge: true });
          await db.collection('siteConfig').doc('main').set({
            pdfFileName: file.name,
            pdfUploadedAt: new Date().toISOString(),
            ...(pdfDataUrl.length < 900000 ? { pdfDataUrl: pdfDataUrl } : {})
          }, { merge: true });
        }
      } catch(err) {
        console.error("Firestore PDF upload error:", err);
      }

      if (document.body.contains(fileInput)) document.body.removeChild(fileInput);
      showToast(`🎉 Tải thành công Cẩm Nang PDF [${file.name}]!`);
      
      setTimeout(() => {
        if (window.location.pathname.includes('cam-nang-so.html')) {
          window.location.reload();
        } else {
          window.location.href = 'cam-nang-so.html';
        }
      }, 300);
    };

    reader.readAsDataURL(file);
  };

  fileInput.click();
}

function savePdfToIndexedDB(dataUrl, fileName) {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("ThanhAnPdfDB", 1);
      req.onupgradeneeded = (e) => {
        const dbInst = e.target.result;
        if (!dbInst.objectStoreNames.contains("pdfs")) {
          dbInst.createObjectStore("pdfs");
        }
      };
      req.onsuccess = (e) => {
        const dbInst = e.target.result;
        const tx = dbInst.transaction("pdfs", "readwrite");
        const store = tx.objectStore("pdfs");
        store.put({ dataUrl, fileName, time: Date.now() }, "currentPdf");
        
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      };
      req.onerror = () => resolve(false);
    } catch(e) {
      console.error("IndexedDB error:", e);
      resolve(false);
    }
  });
}

function changeGuidebookPdfUrl() {
  uploadPdfFileDirectly();
}

async function checkAdminStatus() {
  injectAdminUI();
  
  const isLogged = localStorage.getItem('admin_logged_in') === 'true';

  const fab = document.getElementById('admin-pencil-fab');
  if (fab) fab.style.display = 'none';

  if (isLogged) {
    const tb = document.getElementById('admin-toolbar');
    if (tb) tb.style.display = 'flex';
    const overlay = document.getElementById('admin-login-overlay');
    if (overlay) overlay.style.display = 'none';
    startEditing();
  } else {
    const tb = document.getElementById('admin-toolbar');
    if (tb) tb.style.display = 'none';
    editMode = false;
  }

  if (typeof auth !== 'undefined' && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(user => {
      if (user || isLogged) {
        localStorage.setItem('admin_logged_in', 'true');
        const tb = document.getElementById('admin-toolbar');
        if (tb) tb.style.display = 'flex';
        if (fab) fab.style.display = 'none';
        const overlay = document.getElementById('admin-login-overlay');
        if (overlay) overlay.style.display = 'none';
        startEditing();
      }
    });
  }
}

function adminLogin() {
  const u = document.getElementById('admin-user').value;
  const p = document.getElementById('admin-pass').value;
  if(u === 'cttnyouthuel2026' && p === '26031931') {
    localStorage.setItem('admin_logged_in', 'true');
    auth.signInAnonymously().then(() => {
      showToast("Đăng nhập quản trị thành công!");
      checkAdminStatus();
    }).catch(e => {
      localStorage.setItem('admin_logged_in', 'true');
      checkAdminStatus();
    });
  } else {
    const errEl = document.getElementById('admin-error');
    if (errEl) errEl.style.display = 'block';
  }
}

function adminLogout() {
  localStorage.removeItem('admin_logged_in');
  auth.signOut().then(() => {
    window.location.reload();
  }).catch(() => {
    window.location.reload();
  });
}

function startEditing() {
  editMode = true;
  const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
  
  let idx = 0;
  document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span.stat-value, .note-desc-text, .tip-card p, .rule-item p, .overview-block p, [data-editable]').forEach(el => {
    // Ignore navbar and toolbar elements
    if (el.closest('#navbar') || el.closest('#admin-toolbar') || el.closest('.site-footer') || el.classList.contains('lang-toggle-btn')) return;
    
    let key = el.id || el.getAttribute('data-editable') || el.getAttribute('data-edit-key');
    if (!key) {
      key = `${pagePath}_text_${idx++}`;
      el.setAttribute('data-edit-key', key);
    }
    
    originalContent[key] = el.innerHTML;
    el.contentEditable = true;
    el.style.outline = '2px dashed #0284c7';
    el.style.outlineOffset = '2px';
    el.style.cursor = 'text';
  });

  // Attach click handler to images for Google Drive upload/change
  document.querySelectorAll('img').forEach((img, i) => {
    if (img.classList.contains('logo-img') || img.classList.contains('footer-logo')) return;
    
    let imgKey = img.id || img.getAttribute('data-editable') || img.getAttribute('data-img-key');
    if (!imgKey) {
      imgKey = `${pagePath}_img_${i}`;
      img.setAttribute('data-img-key', imgKey);
    }

    img.style.cursor = 'pointer';
    img.title = 'Bấm để đổi ảnh bằng link Google Drive';
    img.onclick = (e) => {
      if (editMode) {
        e.preventDefault();
        e.stopPropagation();
        changeImgUrl(img);
      }
    };
  });

  showToast("✏️ CHẾ ĐỘ CHỈNH SỬA: Bấm trực tiếp vào bất kỳ dòng chữ nào để sửa, bấm vào ảnh để dán link Google Drive mới!");
}

function changeImgUrl(imgEl) {
  const currentUrl = imgEl.src;
  const url = prompt("Nhập link ảnh mới (dán link Google Drive hoặc URL ảnh bất kỳ):", currentUrl);
  if (url && url.trim()) {
    const convertedUrl = driveToImg(url.trim());
    imgEl.src = convertedUrl;
    imgEl.setAttribute('data-img-src', url.trim());
    showToast("Đã cập nhật ảnh Google Drive mới!");
  }
}

function cancelEdits() {
  document.querySelectorAll('[contenteditable="true"]').forEach(el => {
    el.contentEditable = false;
    el.style.outline = 'none';
    const key = el.id || el.getAttribute('data-editable') || el.getAttribute('data-edit-key');
    if (key && originalContent[key]) {
      el.innerHTML = originalContent[key];
    }
  });
  editMode = false;
  showToast("Đã hủy các thay đổi!");
}

async function saveEdits() {
  const data = {};
  document.querySelectorAll('[data-edit-key], [data-editable], [id]').forEach(el => {
    if (el.isContentEditable) {
      const key = el.id || el.getAttribute('data-editable') || el.getAttribute('data-edit-key');
      if (key) {
        data[key] = el.innerHTML;
        el.contentEditable = false;
        el.style.outline = 'none';
      }
    }
  });

  // Save image changes
  document.querySelectorAll('img[data-img-src]').forEach(img => {
    const imgKey = img.id || img.getAttribute('data-editable') || img.getAttribute('data-img-key') || 'heroBgImg';
    data[imgKey] = img.getAttribute('data-img-src');
  });

  editMode = false;

  try {
    await db.collection('siteConfig').doc('main').set(data, {merge: true});
    showToast("💾 ĐÃ LƯU TẤT CẢ NỘI DUNG & ẢNH GOOGLE DRIVE THÀNH CÔNG!");
    setTimeout(() => {
      checkAdminStatus();
    }, 1000);
  } catch(e) {
    showToast("Lỗi khi lưu dữ liệu lên Firestore!");
    console.error(e);
  }
}

function changeHeroImage() {
  const heroImg = document.getElementById('hero-bg-img') || document.querySelector('.page-banner img') || document.querySelector('img');
  if (heroImg) {
    changeImgUrl(heroImg);
  } else {
    const url = prompt("Nhập link ảnh Google Drive làm Ảnh bìa:");
    if(url) {
      showToast("Đã cập nhật ảnh!");
    }
  }
}

async function loadSiteConfig() {
  try {
    const doc = await db.collection('siteConfig').doc('main').get();
    if(doc.exists) {
      const data = doc.data();
      
      const pagePath = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
      let idx = 0;
      
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span.stat-value, .note-desc-text, .tip-card p, .rule-item p, .overview-block p, [data-editable]').forEach(el => {
        if (el.closest('#navbar') || el.closest('#admin-toolbar') || el.closest('.site-footer')) return;
        let key = el.id || el.getAttribute('data-editable') || el.getAttribute('data-edit-key');
        if (!key) {
          key = `${pagePath}_text_${idx++}`;
          el.setAttribute('data-edit-key', key);
        }
        if (data[key]) {
          el.innerHTML = data[key];
        }
      });

      document.querySelectorAll('img').forEach((img, i) => {
        let imgKey = img.id || img.getAttribute('data-editable') || img.getAttribute('data-img-key');
        if (!imgKey) {
          imgKey = `${pagePath}_img_${i}`;
          img.setAttribute('data-img-key', imgKey);
        }
        if (data[imgKey]) {
          img.src = driveToImg(data[imgKey]);
        }
      });

      if(data.heroBgImg) {
        const heroImg = document.getElementById('hero-bg-img');
        if (heroImg) heroImg.src = driveToImg(data.heroBgImg);
      }
    }
  } catch(e) {
    console.error("Lỗi nạp cấu hình trang:", e);
  }
}

// Scroll spy & Fab
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if(window.scrollY > 50) {
    nav.style.boxShadow = 'var(--shadow)';
  } else {
    nav.style.boxShadow = 'var(--shadow-sm)';
  }

  const fab = document.getElementById('scroll-top-fab');
  if(window.scrollY > 300) {
    fab.classList.add('visible');
  } else {
    fab.classList.remove('visible');
  }
  
  // simple spy
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if(window.scrollY >= top) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(a => {
    a.classList.remove('active');
    if(a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
});

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => { if (t) t.classList.remove('show'); }, 3000);
}

// Auto init map on DOMContentLoaded so it loads instantly without waiting for images
document.addEventListener('DOMContentLoaded', () => {
  try { initOverviewMap(); } catch(e) {}
});

// Init
window.onload = () => {
  if (!map) {
    try { initOverviewMap(); } catch(e) { console.error("Map init error:", e); }
  } else {
    try { map.invalidateSize(); } catch(e) {}
  }
  try { loadSiteConfig(); } catch(e) {}
  try { checkAdminStatus(); } catch(e) {}
  try { applyLanguage(); } catch(e) {}
};

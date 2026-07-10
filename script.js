// BỘ TỪ ĐIỂN CHUẨN HÓA 100% THEO TIẾNG VIỆT TRONG GAME COC
// Hỗ trợ cả ID số lẫn Tên gốc tiếng Anh từ file JSON xuất ra
const DEFAULT_DICTIONARY = {
    // --- CÔNG TRÌNH (BUILDINGS) ---
    "1000002": "Kho chứa Tiên dược",
    "Elixir Storage": "Kho chứa Tiên dược",
    "elixir_storage": "Kho chứa Tiên dược",
    
    "1000015": "Trại lính Hắc ám",
    "Dark Barracks": "Trại lính Hắc ám",
    "dark_barracks": "Trại lính Hắc ám",
    
    "1000059": "Chuồng Linh thú",
    "Pet House": "Chuồng Linh thú",
    "pet_house": "Chuồng Linh thú",

    "1000003": "Đại Bác",
    "1000013": "Tháp Cung Thủ",
    "1000026": "Tháp Phù Thủy",

    // --- PHÒNG THÍ NGHIỆM (LABORATORY - UNITS & SPELLS) ---
    "23000097": "Kỵ sĩ rễ cây",
    "Root Rider": "Kỵ sĩ rễ cây",
    "root_rider": "Kỵ sĩ rễ cây",

    "26000002": "Thần chú Thịnh nộ",
    "Rage Spell": "Thần chú Thịnh nộ",
    "rage_spell": "Thần chú Thịnh nộ",

    "Chiến binh Phóng điện": "Chiến binh Phóng điện",
    "Electro Titan": "Chiến binh Phóng điện",
    "Minion": "Minion",
    "Thần chú hồi sinh": "Thần chú hồi sinh",
    "Không nhân": "Không nhân",
    "Yêu tinh": "Yêu tinh",
    "Thần chú Nhân bản": "Thần chú Nhân bản",
    "Xe Phá thành": "Xe Phá thành",

    // --- LINH THÚ (PETS) ---
    "73000003": "Thằn lằn phun độc",
    "Poison Lizard": "Thằn lằn phun độc",
    "poison_lizard": "Thằn lằn phun độc",

    "73000007": "Phượng hoàng lửa",
    "Linh Thú Phượng Hoàng": "Phượng hoàng lửa",
    "Phoenix": "Phượng hoàng lửa",

    "Cáo linh hồn": "Cáo linh hồn",
    "Spirit Fox": "Cáo linh hồn",
    "Sứa dữ tợn": "Sứa dữ tợn",
    "Angry Jelly": "Sứa dữ tợn"
};

let customDict = {};
let timerInterval = null;

// Tải bộ từ điển từ bộ nhớ máy tính người dùng (Ưu tiên tên đã sửa đổi nếu có)
function loadDictionary() {
    const savedDict = localStorage.getItem('coc_custom_names');
    if (savedDict) {
        customDict = JSON.parse(savedDict);
    } else {
        customDict = { ...DEFAULT_DICTIONARY };
    }
}

// Tính năng bấm sửa trực tiếp phòng trường hợp có món mới cập nhật
function renameItem(id) {
    const currentName = customDict[id] || `Mã: ${id}`;
    const newName = prompt(`Nhập tên tiếng Việt chuẩn trong game cho [${id}]:`, currentName);
    if (newName !== null && newName.trim() !== "") {
        customDict[id] = newName.trim();
        localStorage.setItem('coc_custom_names', JSON.stringify(customDict));
        renderDashboard();
    }
}

// Hàm thông minh: Tìm tên theo ID hoặc chuỗi text gốc trong file JSON
function getItemName(itemData) {
    if (!itemData) return "Vật phẩm ẩn";
    // Ép kiểu về chuỗi để kiểm tra dữ liệu dễ hơn
    const searchKey = String(itemData).trim();
    return customDict[searchKey] || searchKey;
}

function calculateTimeLeft(targetTime) {
    const now = Math.floor(Date.now() / 1000);
    const diff = targetTime - now;

    if (diff <= 0) return "Hoàn thành! ✔";

    const d = Math.floor(diff / (24 * 3600));
    const h = Math.floor((diff % (24 * 3600)) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${d > 0 ? d + 'ng ' : ''}${h > 0 || d > 0 ? h + 'giờ ' : ''}${m}ph ${s}gi`;
}

function startClock() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        document.querySelectorAll('.countdown').forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            element.textContent = calculateTimeLeft(target);
            if (element.textContent.includes("Hoàn thành")) {
                element.style.color = "var(--success)";
                element.style.background = "rgba(46, 213, 115, 0.1)";
                element.style.borderColor = "rgba(46, 213, 115, 0.2)";
            }
        });
    }, 1000);
}

function renderCategory(arrayData, timestamp, containerId) {
    const box = document.getElementById(containerId);
    box.innerHTML = "";

    const upgrades = arrayData ? arrayData.filter(i => i.timer !== undefined) : [];

    if (upgrades.length === 0) {
        box.innerHTML = "<div class='empty-state'>Tất cả đang rảnh rỗi</div>";
        return;
    }

    upgrades.forEach(item => {
        const finishTimestamp = timestamp + item.timer;
        const row = document.createElement('div');
        row.className = 'item-row';

        row.innerHTML = `
            <div class="item-meta">
                <div class="item-name-box">
                    <span class="item-name">${getItemName(item.data)}</span>
                    <button class="btn-edit" onclick="renameItem('${item.data}')">✏ Sửa</button>
                </div>
                <div><span class="badge-lvl">Cấp ${item.lvl}</span></div>
            </div>
            <div class="countdown" data-target="${finishTimestamp}">${calculateTimeLeft(finishTimestamp)}</div>
        `;
        box.appendChild(row);
    });
}

async function renderDashboard() {
    try {
        loadDictionary();
        let rawData = localStorage.getItem('coc_saved_json');
        
        if (!rawData) {
            const res = await fetch('data.json');
            rawData = await res.text();
        }

        const data = JSON.parse(rawData);
        if (data.tag) document.getElementById('player-tag').textContent = `Mã Clan/Acc: ${data.tag}`;
        
        const baseTime = data.timestamp;

        // Đổ dữ liệu ra các thẻ tương ứng
        renderCategory(data.buildings, baseTime, 'box-home-builders');
        const homeLab = [...(data.units || []), ...(data.spells || []), ...(data.siege_machines || [])];
        renderCategory(homeLab, baseTime, 'box-home-lab');
        renderCategory(data.pets, baseTime, 'box-home-pets');

        renderCategory(data.buildings2, baseTime, 'box-builder-builders');
        renderCategory(data.units2, baseTime, 'box-builder-lab');

        startClock();
    } catch (e) {
        console.error(e);
    }
}

function updateJsonData() {
    const text = document.getElementById('json-textarea').value.trim();
    if (!text) return alert("Vui lòng không để trống ô dữ liệu!");
    try {
        JSON.parse(text);
        localStorage.setItem('coc_saved_json', text);
        alert("Đã đồng bộ hóa dữ liệu JSON thành công!");
        renderDashboard();
    } catch (err) {
        alert("Chuỗi dữ liệu bị lỗi cú pháp JSON. Hãy kiểm tra lại!");
    }
}

function resetToDefault() {
    localStorage.removeItem('coc_saved_json');
    localStorage.removeItem('coc_custom_names');
    document.getElementById('json-textarea').value = "";
    alert("Đã đặt lại về dữ liệu mặc định!");
    renderDashboard();
}

window.onload = renderDashboard;

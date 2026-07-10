// Bộ từ điển mặc định (Bạn có thể sửa trực tiếp trên Web, nó sẽ đè lên cấu hình này)
const DEFAULT_DICTIONARY = {
    "1000003": "Đại Bác (Cannon)",
    "1000013": "Tháp Cung Thủ",
    "1000026": "Tháp Phù Thủy",
    "1000068": "Vũ Khí Nhà Chính",
    "4000110": "Học Viên Quản Giáo",
    "26000002": "Phép Cuồng Nhiệt",
    "73000007": "Linh Thú Phượng Hoàng",
    "1000039": "Phòng Thí Nghiệm Ngôi Sao",
    "1000058": "Chòi Thợ Xây O.T.T.O",
    "4000042": "Xe Lăn Đại Bác"
};

let customDict = {};
let timerInterval = null;

// Tải bộ từ điển từ bộ nhớ máy tính người dùng
function loadDictionary() {
    const savedDict = localStorage.getItem('coc_custom_names');
    if (savedDict) {
        customDict = JSON.parse(savedDict);
    } else {
        customDict = { ...DEFAULT_DICTIONARY };
    }
}

// Hàm kích hoạt khi người dùng bấm nút "Sửa" tên ngay trên giao diện web
function renameItem(id) {
    const currentName = customDict[id] || `Mã ID: ${id}`;
    const newName = prompt(`Nhập tên tiếng Việt chuẩn trong game cho ID [${id}]:`, currentName);
    if (newName !== null && newName.trim() !== "") {
        customDict[id] = newName.trim();
        localStorage.setItem('coc_custom_names', JSON.stringify(customDict));
        // Tải lại bảng điều khiển để áp dụng tên mới lập tức
        renderDashboard();
    }
}

function getItemName(id) {
    return customDict[id] || `Vật phẩm chưa đặt tên (ID: ${id})`;
}

function calculateTimeLeft(targetTime) {
    const now = Math.floor(Date.now() / 1000);
    const diff = targetTime - now;

    if (diff <= 0) return "Hoàn thành! ✔";

    const d = Math.floor(diff / (24 * 3600));
    const h = Math.floor((diff % (24 * 3600)) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    return `${d > 0 ? d + 'd ' : ''}${h > 0 || d > 0 ? h + 'h ' : ''}${m}m ${s}s`;
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
        box.innerHTML = "<div class='empty-state'>Tất cả thợ đang rảnh rỗi</div>";
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
                    <button class="btn-edit" onclick="renameItem('${item.data}')">✏ Sửa tên</button>
                </div>
                <div><span class="badge-lvl">Cấp ${item.lvl}</span></div>
            </div>
            <div class="countdown" data-target="${finishTimestamp}">${calculateTimeLeft(finishTimestamp)}</div>
        `;
        box.appendChild(row);
    });
}

// Hàm vẽ toàn bộ trang Dashboard
async function renderDashboard() {
    try {
        loadDictionary();
        let rawData = localStorage.getItem('coc_saved_json');
        
        if (rawData) {
            document.getElementById('json-textarea').value = rawData;
        } else {
            const res = await fetch('data.json');
            rawData = await res.text();
        }

        const data = JSON.parse(rawData);
        if (data.tag) document.getElementById('player-tag').textContent = `Mã Clan/Acc: ${data.tag}`;
        
        const baseTime = data.timestamp;

        renderCategory(data.buildings, baseTime, 'box-home-builders');
        const homeLab = [...(data.units || []), ...(data.spells || []), ...(data.siege_machines || [])];
        renderCategory(homeLab, baseTime, 'box-home-lab');
        renderCategory(data.pets, baseTime, 'box-home-pets');

        renderCategory(data.buildings2, baseTime, 'box-builder-builders');
        renderCategory(data.units2, baseTime, 'box-builder-lab');

        startClock();
    } catch (e) {
        console.error(e);
        alert("Lỗi tải cấu trúc JSON, hãy kiểm tra lại định dạng.");
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
    document.getElementById('json-textarea').value = "";
    alert("Đã đặt lại về dữ liệu mặc định!");
    renderDashboard();
}

window.onload = renderDashboard;

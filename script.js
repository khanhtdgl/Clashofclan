// Bộ từ điển dịch ID thô sang tên chuẩn 100% trong game Clash of Clans tiếng Việt
const DICTIONARY = {
    // Làng chính - Công trình (Buildings)
    "1000003": "Mỏ Vàng",
    "1000013": "Tháp Cung Thủ",
    "1000026": "Tháp Phù Thủy",
    "1000068": "Vũ Khí Nhà Chính (Giga Weapon)",
    
    // Làng chính - Nghiên cứu (Units / Spells)
    "4000110": "Học Viên Quản Giáo",
    "26000002": "Phép Cuồng Nhiệt",
    
    // Làng chính - Linh thú (Pets)
    "73000007": "Linh Thú Phượng Hoàng",

    // Làng thợ xây - Công trình & Lính (Builder Base)
    "1000039": "Phòng Thí Nghiệm Ngôi Sao",
    "1000058": "Chòi Thợ Xây O.T.T.O",
    "4000042": "Xe Lăn Đại Bác"
};

let globalInterval = null;

function fetchName(id, type) {
    return DICTIONARY[id] || `${type} (ID: ${id})`;
}

function formatCountdown(targetTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const distance = targetTimestamp - now;

    if (distance <= 0) return "Hoàn thành! ✔";

    const days = Math.floor(distance / (24 * 3600));
    const hours = Math.floor((distance % (24 * 3600)) / 3600);
    const minutes = Math.floor((distance % 3600) / 60);
    const seconds = distance % 60;

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m ${seconds}s`;
    
    return result;
}

function startGlobalTimer() {
    if (globalInterval) clearInterval(globalInterval);
    globalInterval = setInterval(() => {
        document.querySelectorAll('.item-time').forEach(timer => {
            const target = parseInt(timer.getAttribute('data-target'));
            timer.textContent = formatCountdown(target);
            if (timer.textContent.includes("Hoàn thành")) {
                timer.style.color = "var(--success)";
                timer.style.background = "rgba(16, 185, 129, 0.1)";
            }
        });
    }, 1000);
}

function buildListMarkup(arrayData, baseTimestamp, typeLabel, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";

    // Lọc các item đang thực sự nâng cấp (có thuộc tính 'timer')
    const activeItems = arrayData ? arrayData.filter(item => item.timer !== undefined) : [];

    if (activeItems.length === 0) {
        container.innerHTML = "<div class='status-empty'>Tất cả đang rảnh rỗi</div>";
        return;
    }

    activeItems.forEach(item => {
        const targetTimestamp = baseTimestamp + item.timer;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'list-item';

        let extraLabel = "";
        if (item.gear_up) extraLabel = " <span style='color:var(--gold); font-size:11px;'>[Cải Tiến]</span>";

        wrapper.innerHTML = `
            <div class="item-info">
                <span class="item-name">${fetchName(item.data, typeLabel)}${extraLabel}<span class="item-lvl">Cấp ${item.lvl}</span></span>
                <span class="item-time" data-target="${targetTimestamp}">${formatCountdown(targetTimestamp)}</span>
            </div>
        `;
        container.appendChild(wrapper);
    });
}

async function startDashboard() {
    try {
        let data;
        const localStore = localStorage.getItem('coc_custom_json');
        
        if (localStore) {
            data = JSON.parse(localStore);
            document.getElementById('json-input').value = localStore;
        } else {
            const response = await fetch('data.json');
            data = await response.json();
        }
        
        // Hiển thị mã Tag tài khoản lên Header
        if(data.tag) document.getElementById('account-tag').textContent = `Mã tài khoản: ${data.tag}`;
        
        const baseTime = data.timestamp;

        // Đổ dữ liệu ra các thẻ tương ứng
        buildListMarkup(data.buildings, baseTime, "Công trình", "home-builders");
        
        const combinedLab = [...(data.units || []), ...(data.spells || []), ...(data.siege_machines || [])];
        buildListMarkup(combinedLab, baseTime, "Nghiên cứu", "home-lab");
        
        buildListMarkup(data.pets, baseTime, "Linh thú", "home-pets");
        buildListMarkup(data.buildings2, baseTime, "Công trình BB", "builder-builders");
        buildListMarkup(data.units2, baseTime, "Lính BB", "builder-lab");

        startGlobalTimer();

    } catch (error) {
        console.error(error);
        alert("Lỗi phân tích cú pháp dữ liệu JSON!");
    }
}

function saveNewJson() {
    const stringInput = document.getElementById('json-input').value.trim();
    if (!stringInput) return alert("Vui lòng không để trống ô dán dữ liệu!");
    try {
        JSON.parse(stringInput);
        localStorage.setItem('coc_custom_json', stringInput);
        alert("Đã lưu dữ liệu mới và dịch chuẩn thuật ngữ!");
        startDashboard();
    } catch (e) {
        alert("Cú pháp JSON không hợp lệ, hãy kiểm tra lại dấu đóng mở ngoặc!");
    }
}

function clearLocalData() {
    localStorage.removeItem('coc_custom_json');
    document.getElementById('json-input').value = "";
    alert("Đã reset về file dữ liệu gốc trên GitHub!");
    startDashboard();
}

window.onload = startDashboard;

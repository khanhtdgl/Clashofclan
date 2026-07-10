const ID_DICTIONARY = {
    "1000003": "Mỏ Vàng / Hút Dầu",
    "1000026": "Tháp Phù Thủy",
    "1000068": "Tháp Giga / Vũ khí chính TH",
    "4000110": "Nâng cấp Siêu Cấp / Lính phòng thí nghiệm",
    "26000002": "Phép Cuồng Nhiệt (Rage Spell)",
    "73000007": "Phượng Hoàng (Phoenix)",
    "1000039": "Phòng Nghiên Cứu Thợ Xây (Lab BB)",
    "1000058": "Chòi Thợ Xây Ô Tô (O.T.T.O Hut)",
    "4000042": "Xe Lăn Ngờ Nghệch (Cannon Cart)"
};

let globalInterval = null; // Quản lý bộ đếm thời gian tránh bị trùng lặp

function getNameFromId(id, defaultType) {
    return ID_DICTIONARY[id] || `${defaultType} (ID: ${id})`;
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
    if (days > 0) result += `${days}ngày `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${minutes}m ${seconds}s`;
    
    return result;
}

function startGlobalTimer() {
    if (globalInterval) clearInterval(globalInterval); // Xóa bộ đếm cũ nếu có
    globalInterval = setInterval(() => {
        const timers = document.querySelectorAll('.timer');
        timers.forEach(timer => {
            const target = parseInt(timer.getAttribute('data-target'));
            timer.textContent = formatCountdown(target);
        });
    }, 1000);
}

function generateHtmlList(arrayData, baseTimestamp, idLabel, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const upgradingItems = arrayData ? arrayData.filter(item => item.timer !== undefined) : [];

    if (upgradingItems.length === 0) {
        container.innerHTML = "<div class='no-upgrade'>Tất cả đang rảnh rỗi</div>";
        return;
    }

    upgradingItems.forEach(item => {
        const targetTimestamp = baseTimestamp + item.timer;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';

        const nameSpan = document.createElement('span');
        nameSpan.innerHTML = `<strong>${getNameFromId(item.data, idLabel)}</strong> (Cấp ${item.lvl})`;

        const timerSpan = document.createElement('span');
        timerSpan.className = 'timer';
        timerSpan.setAttribute('data-target', targetTimestamp);
        timerSpan.textContent = formatCountdown(targetTimestamp);

        itemDiv.appendChild(nameSpan);
        itemDiv.appendChild(timerSpan);
        container.appendChild(itemDiv);
    });
}

// HÀM KHỞI CHẠY CHÍNH
async function initTracker() {
    try {
        let data;
        // Kiểm tra xem bộ nhớ trình duyệt có sẵn dữ liệu dán vào trước đó không
        const savedData = localStorage.getItem('coc_custom_json');
        
        if (savedData) {
            data = JSON.parse(savedData);
            document.getElementById('json-input').value = savedData; // Giữ lại text trong ô dán
        } else {
            // Nếu không có, tải file data.json mặc định từ GitHub
            const response = await fetch('data.json');
            data = await response.json();
        }
        
        const baseTime = data.timestamp;

        // Tiến hành vẽ giao diện
        generateHtmlList(data.buildings, baseTime, "Công trình", "home-builders");
        const labItems = [...(data.units || []), ...(data.spells || []), ...(data.siege_machines || [])];
        generateHtmlList(labItems, baseTime, "Nghiên cứu", "home-lab");
        generateHtmlList(data.pets, baseTime, "Linh thú", "home-pets");

        generateHtmlList(data.buildings2, baseTime, "Công trình BB", "builder-builders");
        generateHtmlList(data.units2, baseTime, "Lính BB", "builder-lab");

        startGlobalTimer();

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi khi đọc dữ liệu! Hãy kiểm tra lại mã định dạng JSON.");
    }
}

// HÀM XỬ LÝ KHI BẤM NÚT "CẬP NHẬT DỮ LIỆU"
function saveNewJson() {
    const rawInput = document.getElementById('json-input').value.trim();
    if (!rawInput) {
        alert("Vui lòng dán mã dữ liệu JSON vào ô trống!");
        return;
    }
    try {
        // Kiểm tra xem chuỗi nhập vào có đúng chuẩn cấu trúc JSON không
        JSON.parse(rawInput);
        // Lưu vào bộ nhớ máy
        localStorage.setItem('coc_custom_json', rawInput);
        alert("Đã cập nhật và lưu dữ liệu mới thành công!");
        initTracker(); // Tải lại bảng theo dõi ngay lập tức
    } catch (e) {
        alert("Mã JSON sai cú pháp hoặc bị thiếu dấu! Hãy kiểm tra lại.");
    }
}

// HÀM XỬ LÝ KHI BẤM NÚT ĐỂ QUAY VỀ MẶC ĐỊNH
function clearLocalData() {
    localStorage.removeItem('coc_custom_json');
    document.getElementById('json-input').value = "";
    alert("Đã xóa dữ liệu lưu tạm. Trang web sẽ dùng lại file data.json gốc trên GitHub!");
    initTracker();
}

window.onload = initTracker;

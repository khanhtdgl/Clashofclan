// =======================

// COC TIMER v2.0

// PHẦN 1

// =======================

const BUILDERS = [

    "Thợ 1",

    "Thợ 2",

    "Thợ 3",

    "Thợ 4",

    "Thợ 5",

    "Thợ 6",

    "Nghiên cứu",

    "Linh thú"

];

const STORAGE_KEY = "coc_timer_v2";

const cards = document.getElementById("cards");

const summary = document.getElementById("summaryList");

let timers = [];

// =======================

// LOAD / SAVE

// =======================

function loadData(){

    const data = localStorage.getItem(STORAGE_KEY);

    if(data){

        timers = JSON.parse(data);

    }else{

        timers = BUILDERS.map(name=>({

            name,

            end:0

        }));

    }

}

function saveData(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(timers)

    );

}

// =======================

// TẠO GIAO DIỆN

// =======================

function createCards(){

    cards.innerHTML="";

    timers.forEach((item,index)=>{

        const card=document.createElement("div");

        card.className="card";

        card.id="card-"+index;

        card.innerHTML=`

<h3>${item.name}</h3>

<div class="input-row">

<div class="input-group">

<label>Ngày</label>

<input id="d-${index}" type="number" min="0" value="0">

</div>

<div class="input-group">

<label>Giờ</label>

<input id="h-${index}" type="number" min="0" max="23" value="0">

</div>

<div class="input-group">

<label>Phút</label>

<input id="m-${index}" type="number" min="0" max="59" value="0">

</div>

</div>

<div class="button-row">

<button class="start" id="start-${index}">

▶

</button>

<button class="reset" id="reset-${index}">

✖

</button>

</div>

<div class="time" id="time-${index}"></div>

<div class="finish" id="finish-${index}"></div>

`;

        cards.appendChild(card);

        document

            .getElementById("start-"+index)

            .addEventListener("click",()=>{

                startTimer(index);

            });

        document

            .getElementById("reset-"+index)

            .addEventListener("click",()=>{

                resetTimer(index);

            });

    });

}// =======================

// BẮT ĐẦU ĐẾM

// =======================

function startTimer(index){

    const d = Number(

        document.getElementById("d-"+index).value

    ) || 0;

    const h = Number(

        document.getElementById("h-"+index).value

    ) || 0;

    const m = Number(

        document.getElementById("m-"+index).value

    ) || 0;

    const totalMinutes =

        d * 1440 +

        h * 60 +

        m;

    if(totalMinutes <= 0){

        alert("Hãy nhập thời gian!");

        return;

    }

    timers[index].end =

        Date.now() +

        totalMinutes * 60000;

    saveData();

    update();

}

// =======================

// XÓA BỘ ĐẾM

// =======================

function resetTimer(index){

    timers[index].end = 0;

    saveData();

    update();

}

// =======================

// ĐỊNH DẠNG THỜI GIAN

// =======================

function formatTime(ms){

    let total = Math.ceil(ms / 60000);

    const day = Math.floor(total / 1440);

    total %= 1440;

    const hour = Math.floor(total / 60);

    const minute = total % 60;

    if(day > 0){

        return `${day}d ${hour}h`;

    }

    if(hour > 0){

        return `${hour}h ${minute}m`;

    }

    return `${minute}m`;

}

// =======================

// GIỜ HOÀN THÀNH

// =======================

function finishTime(time){

    const d = new Date(time);

    const dd = String(

        d.getDate()

    ).padStart(2,"0");

    const mm = String(

        d.getMonth()+1

    ).padStart(2,"0");

    const hh = String(

        d.getHours()

    ).padStart(2,"0");

    const ii = String(

        d.getMinutes()

    ).padStart(2,"0");

    return `${dd}/${mm} ${hh}:${ii}`;

}// =======================

// CẬP NHẬT GIAO DIỆN

// =======================

function update(){

    let active=[];

    timers.forEach((item,index)=>{

        const card=document.getElementById("card-"+index);

        const time=document.getElementById("time-"+index);

        const finish=document.getElementById("finish-"+index);

        card.className="card";

        if(item.end===0){

            time.innerHTML="";

            finish.innerHTML="";

            return;

        }

        const remain=item.end-Date.now();

        if(remain<=0){

            time.innerHTML="<span class='done'>✅ Hoàn thành</span>";

            finish.innerHTML="";

            timers[index].end=0;

            saveData();

            return;

        }

        active.push({

            index:index,

            name:item.name,

            remain:remain

        });

        time.innerHTML="⏳ Còn: "+formatTime(remain);

        finish.innerHTML=

            "🕒 Hoàn thành: "+

            finishTime(item.end);

        if(remain<3600000){

            card.classList.add("danger");

            time.className="time red";

        }else if(remain<86400000){

            card.classList.add("warning");

            time.className="time orange";

        }else{

            card.classList.add("running");

            time.className="time green";

        }

    });

// =======================

// TỔNG QUAN

// =======================

    active.sort((a,b)=>a.remain-b.remain);

    summary.innerHTML="";

    if(active.length===0){

        summary.innerHTML="Chưa có bộ đếm nào.";

        return;

    }

    active.forEach((item,pos)=>{

        let medal="";

        if(pos===0){

            medal="🥇";

        }else if(pos===1){

            medal="🥈";

        }else if(pos===2){

            medal="🥉";

        }else{

            medal="📌";

        }

        summary.innerHTML+=`

<div class="summary-item"

onclick="document.getElementById('card-${item.index}')

.scrollIntoView({behavior:'smooth'})">

<span>${medal} ${item.name}</span>

<span>${formatTime(item.remain)}</span>

</div>

`;

    });

}// =======================

// KHỞI TẠO ỨNG DỤNG

// =======================

loadData();

createCards();

update();

// =======================

// TỰ CẬP NHẬT

// =======================

// Cập nhật mỗi 30 giây

setInterval(update,30000);

// =======================

// LƯU KHI THOÁT

// =======================

window.addEventListener("beforeunload",()=>{

    saveData();

});

// =======================

// CHO PHÉP NHẤN ENTER

// =======================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        update();

    }

});

// =======================

// KẾT THÚC FILE

// =======================
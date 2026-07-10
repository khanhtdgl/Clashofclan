// =============================

// COC TIMER - PHẦN 1

// =============================

const names = [

    "Thợ 1",

    "Thợ 2",

    "Thợ 3",

    "Thợ 4",

    "Thợ 5",

    "Thợ 6",

    "Nghiên cứu",

    "Linh thú"

];

const cards = document.getElementById("cards");

const summary = document.getElementById("summaryList");

let timers = [];

// Đọc dữ liệu đã lưu

function loadData(){

    const data = localStorage.getItem("cocTimers");

    if(data){

        timers = JSON.parse(data);

    }else{

        timers = names.map(name=>({

            name:name,

            end:0

        }));

    }

}

// Lưu dữ liệu

function saveData(){

    localStorage.setItem(

        "cocTimers",

        JSON.stringify(timers)

    );

}

loadData();

// =============================

// TẠO GIAO DIỆN

// =============================

function createCards(){

    cards.innerHTML="";

    timers.forEach((item,index)=>{

        const card=document.createElement("div");

        card.className="card";

        card.id="card"+index;

        card.innerHTML=`

            <h3>${item.name}</h3>

            <div class="input-row">

                <div class="input-group">

                    <label>Ngày</label>

                    <input

                        type="number"

                        min="0"

                        id="d${index}"

                    >

                </div>

                <div class="input-group">

                    <label>Giờ</label>

                    <input

                        type="number"

                        min="0"

                        max="23"

                        id="h${index}"

                    >

                </div>

                <div class="input-group">

                    <label>Phút</label>

                    <input

                        type="number"

                        min="0"

                        max="59"

                        id="m${index}"

                    >

                </div>

            </div>

            <div class="button-row">

                <button

                    class="start"

                    onclick="startTimer(${index})">

                    ▶

                </button>

                <button

                    class="reset"

                    onclick="resetTimer(${index})">

                    ✖

                </button>

            </div>

            <div

                class="time"

                id="time${index}">

            </div>

            <div

                class="finish"

                id="finish${index}">

            </div>

        `;

        cards.appendChild(card);

    });

}

createCards();

// =============================

// BẮT ĐẦU ĐẾM

// =============================

function startTimer(index){

    const d = parseInt(

        document.getElementById("d"+index).value

    ) || 0;

    const h = parseInt(

        document.getElementById("h"+index).value

    ) || 0;

    const m = parseInt(

        document.getElementById("m"+index).value

    ) || 0;

    const totalMinutes =

        d*1440 +

        h*60 +

        m;

    if(totalMinutes<=0){

        alert("Nhập thời gian!");

        return;

    }

    timers[index].end =

        Date.now() +

        totalMinutes*60000;

    saveData();

    update();

}

// =============================

// XÓA

// =============================

function resetTimer(index){

    timers[index].end=0;

    saveData();

    update();

}// =============================

// HÀM ĐỊNH DẠNG THỜI GIAN

// =============================

function formatTime(ms){

    let total=Math.ceil(ms/60000);

    let d=Math.floor(total/1440);

    total%=1440;

    let h=Math.floor(total/60);

    let m=total%60;

    if(d>0){

        return d+"d "+h+"h";

    }

    if(h>0){

        return h+"h "+m+"m";

    }

    return m+"m";

}

function finishTime(end){

    const date=new Date(end);

    const day=String(date.getDate()).padStart(2,"0");

    const month=String(date.getMonth()+1).padStart(2,"0");

    const hour=String(date.getHours()).padStart(2,"0");

    const minute=String(date.getMinutes()).padStart(2,"0");

    return day+"/"+month+" "+hour+":"+minute;

}

// =============================

// CẬP NHẬT GIAO DIỆN

// =============================

function update(){

    let active=[];

    timers.forEach((item,index)=>{

        const card=document.getElementById("card"+index);

        const time=document.getElementById("time"+index);

        const finish=document.getElementById("finish"+index);

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

        time.innerHTML="Còn: "+formatTime(remain);

        finish.innerHTML="Hoàn thành: "+finishTime(item.end);

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

    active.sort((a,b)=>a.remain-b.remain);

    summary.innerHTML="";

    if(active.length===0){

        summary.innerHTML="Chưa có bộ đếm nào.";

    }else{

        active.forEach((item,pos)=>{

            let medal="";

            if(pos===0) medal="🥇";

            else if(pos===1) medal="🥈";

            else if(pos===2) medal="🥉";

            summary.innerHTML+=`

            <div class="summary-item"

                 onclick="document.getElementById('card${item.index}').scrollIntoView({behavior:'smooth'})">

                <span>${medal} ${item.name}</span>

                <span>${formatTime(item.remain)}</span>

            </div>

            `;

        });

    }

}

update();

// Cập nhật mỗi phút

setInterval(update,60000);
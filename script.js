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

load();

createCards();

update();

setInterval(update,60000);

function load(){

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

function save(){

    localStorage.setItem(

        "cocTimers",

        JSON.stringify(timers)

    );

}

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

                <input type="number" id="d${index}" min="0">

            </div>

            <div class="input-group">

                <label>Giờ</label>

                <input type="number" id="h${index}" min="0" max="23">

            </div>

            <div class="input-group">

                <label>Phút</label>

                <input type="number" id="m${index}" min="0" max="59">

            </div>

        </div>

        <div class="button-row">

            <button class="start"

            onclick="startTimer(${index})">

            ▶

            </button>

            <button class="reset"

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

function startTimer(index){

    const d=parseInt(

        document.getElementById("d"+index).value

    )||0;

    const h=parseInt(

        document.getElementById("h"+index).value

    )||0;

    const m=parseInt(

        document.getElementById("m"+index).value

    )||0;

    const total=((d*24+h)*60+m)*60000;

    if(total<=0){

        return;

    }

    timers[index].end=Date.now()+total;

    save();

    update();

}

function resetTimer(index){

    timers[index].end=0;

    save();

    update();

}function formatTime(ms){

    let total=Math.floor(ms/60000);

    let d=Math.floor(total/1440);

    total%=1440;

    let h=Math.floor(total/60);

    let m=total%60;

    if(d>0) return d+"d "+h+"h";

    if(h>0) return h+"h "+m+"m";

    return m+"m";

}

function finishTime(time){

    const date=new Date(time);

    const day=String(date.getDate()).padStart(2,"0");

    const month=String(date.getMonth()+1).padStart(2,"0");

    const hour=String(date.getHours()).padStart(2,"0");

    const minute=String(date.getMinutes()).padStart(2,"0");

    return day+"/"+month+" "+hour+":"+minute;

}

function update(){

    let list=[];

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

        let remain=item.end-Date.now();

        if(remain<=0){

            time.innerHTML='<span class="done">✅ Hoàn thành</span>';

            finish.innerHTML="";

            timers[index].end=0;

            save();

            return;

        }

        list.push({

            name:item.name,

            remain:remain,

            index:index

        });

        time.innerHTML="Còn: "+formatTime(remain);

        finish.innerHTML="Hoàn thành lúc: "+finishTime(item.end);

        if(remain<3600000){

            card.classList.add("danger");

            time.className="time red";

        }

        else if(remain<86400000){

            card.classList.add("warning");

            time.className="time orange";

        }

        else{

            card.classList.add("running");

            time.className="time green";

        }

    });

    list.sort((a,b)=>a.remain-b.remain);

    summary.innerHTML="";

    if(list.length===0){

        summary.innerHTML="Chưa có bộ đếm nào.";

        return;

    }

    list.forEach((item,pos)=>{

        let icon="";

        if(pos===0) icon="🥇";

        else if(pos===1) icon="🥈";

        else if(pos===2) icon="🥉";

        summary.innerHTML+=`

        <div class="summary-item" onclick="document.getElementById('card${item.index}').scrollIntoView({behavior:'smooth'})">

            <span>${icon} ${item.name}</span>

            <span>${formatTime(item.remain)}</span>

        </div>

        `;

    });

}
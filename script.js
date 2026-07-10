
let items=JSON.parse(localStorage.getItem('items')||'[]');
function save(){localStorage.setItem('items',JSON.stringify(items));}
function render(){let d=document.getElementById('list');d.innerHTML='';items.forEach((x,i)=>{let rem=Math.max(0,x.end-Date.now());let e=document.createElement('div');e.className='item';e.textContent=x.name+' - '+Math.floor(rem/1000)+'s';d.appendChild(e);});}
function start(){let n=prompt('Tên nâng cấp');let m=+prompt('Số phút');if(!n||!m)return;items.push({name:n,end:Date.now()+m*60000});save();render();}
setInterval(render,1000);render();

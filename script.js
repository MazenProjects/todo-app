let tasks = JSON.parse(localStorage.getItem("tasks_v3")||"[]");

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const counters = document.getElementById("counters");
const searchInput = document.getElementById("search");
const filters = document.querySelectorAll(".filter");
const clearCompletedBtn = document.getElementById("clearCompleted");
const clearAllBtn = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");
const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");
const toastWrap = document.getElementById("toastWrap");

let deleteTarget = null;
let editTarget = null;
let filterState = "all";
let query = "";
let sortState = "new";

function save(){
  localStorage.setItem("tasks_v3", JSON.stringify(tasks));
}

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function showToast(msg, time=1800){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  toastWrap.appendChild(t);
  setTimeout(()=>{ t.remove(); }, time);
}

function updateCounters(){
  const total = tasks.length;
  const done = tasks.filter(t=>t.done).length;
  counters.textContent = `${total} مهام — ${done} مكتملة — ${total-done} متبقية`;
}

function render(){
  taskList.innerHTML = "";
  let list = tasks.slice();

  if(query) list = list.filter(t=> t.text.toLowerCase().includes(query.toLowerCase()));
  if(filterState==="active") list = list.filter(t=>!t.done);
  if(filterState==="completed") list = list.filter(t=>t.done);

  if(sortState==="new") list.sort((a,b)=>b.created-a.created);
  if(sortState==="old") list.sort((a,b)=>a.created-b.created);

  list.forEach(t=>{
    const el = document.createElement("div");
    el.className = "task enter";
    el.dataset.id = t.id;
    el.innerHTML = `
      <div class="left-side">
        <input type="checkbox" class="check" ${t.done?"checked":""}>
        <div class="text ${t.done?"done":""}">${escapeHtml(t.text)}</div>
      </div>
      <div class="actions">
        <button class="icon-btn edit" title="تعديل">✎</button>
        <button class="icon-btn delete" title="حذف">✕</button>
      </div>
    `;
    taskList.appendChild(el);
  });
  updateCounters();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}

addBtn.addEventListener("click", ()=>{
  const v = taskInput.value.trim();
  if(!v) return showToast("اكتب مهمة أولاً");
  tasks.unshift({id:uid(),text:v,done:false,created:Date.now()});
  save(); render(); taskInput.value=""; showToast("تمت الإضافة");
});

taskInput.addEventListener("keydown", e=>{ if(e.key==="Enter") addBtn.click(); });

taskList.addEventListener("click", e=>{
  const item = e.target.closest(".task");
  if(!item) return;
  const id = item.dataset.id;
  if(e.target.matches(".delete")){
    deleteTarget = id; deleteModal.classList.add("show");
  } else if(e.target.matches(".edit")){
    editTarget = id;
    const t = tasks.find(x=>x.id===id);
    editInput.value = t? t.text : "";
    editModal.classList.add("show");
  }
});

taskList.addEventListener("change", e=>{
  if(e.target.classList.contains("check")){
    const id = e.target.closest(".task").dataset.id;
    const t = tasks.find(x=>x.id===id);
    if(t){ t.done = e.target.checked; save(); render(); }
  }
});

confirmDelete.addEventListener("click", ()=>{
  tasks = tasks.filter(x=>x.id!==deleteTarget);
  save(); render(); deleteTarget=null; deleteModal.classList.remove("show"); showToast("تم الحذف");
});
cancelDelete.addEventListener("click", ()=>{ deleteModal.classList.remove("show"); });

saveEdit.addEventListener("click", ()=>{
  const v = editInput.value.trim();
  if(!v) return showToast("اكتب نص التعديل");
  const t = tasks.find(x=>x.id===editTarget);
  if(t){ t.text = v; save(); render(); showToast("تم التعديل"); }
  editModal.classList.remove("show");
});
cancelEdit.addEventListener("click", ()=> editModal.classList.remove("show"));

filters.forEach(b=>{
  b.addEventListener("click", ()=>{
    filters.forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    filterState = b.dataset.filter;
    render();
  });
});

searchInput.addEventListener("input", e=>{
  query = e.target.value.trim();
  render();
});

clearCompletedBtn.addEventListener("click", ()=>{
  tasks = tasks.filter(t=>!t.done);
  save(); render(); showToast("تم حذف المنجزة");
});
clearAllBtn.addEventListener("click", ()=>{
  tasks = []; save(); render(); showToast("تم حذف الكل");
});

themeToggle.addEventListener("click", ()=>{
  const dark = document.body.classList.toggle("dark");
  themeToggle.textContent = dark? "☀️":"🌙";
  localStorage.setItem("theme_v3", dark? "dark":"light");
});

window.addEventListener("load", ()=>{
  const saved = localStorage.getItem("theme_v3") || "light";
  if(saved==="dark"){ document.body.classList.add("dark"); themeToggle.textContent="☀️"; }
  render();
});

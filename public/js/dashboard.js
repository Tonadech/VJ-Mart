// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
// import { getAuth,signOut , onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
// import { getFirestore, collection, query, where, getDocs, doc, updateDoc ,getDoc ,setDoc} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyBcL-j2Em-8q0Wvg-flOTssxQT4XlWqXzE",
//   authDomain: "bill-for--vj-mart.firebaseapp.com",
//   projectId: "bill-for--vj-mart",
//   storageBucket: "bill-for--vj-mart.appspot.com",
//   messagingSenderId: "700824685931",
//   appId: "1:700824685931:web:856b3880c0496b5fd1902e"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);
// const currentUser = JSON.parse(localStorage.getItem("user"));
// const role = currentUser.role;
// const division = currentUser.division;
// const name = currentUser.name;

// const itemList = document.getElementById("item-list");
// const itemDetail = document.getElementById("item-detail");

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = "index.html";
//     return;
//   }

//   const userSnap = await getDoc(doc(db, "users", user.uid));
//   const currentUser = userSnap.data();

//   let q;
//   if (currentUser.role === "admin") {
//     // เห็นเฉพาะของตัวเอง
//     q = query(collection(db, "expenses"), where("uid", "==", currentUser.uid));
//   } else if (currentUser.role === "adminleader") {
//     // เห็นของตัวเอง และลูกน้อง admin ที่ adminleader เป็นตัวเอง และอยู่ในบริษัทเดียวกัน
//     q = query(
//       collection(db, "expenses"),
//       where("adminleader", "==", currentUser.name),
//       where("company", "==", currentUser.company)
//     );
//   } else if (currentUser.role === "accountor") {
//     // เห็นทั้งหมดใน division และบริษัทเดียวกัน
//     q = query(
//       collection(db, "expenses"),
//       where("division", "==", currentUser.division),
//       where("company", "==", currentUser.company)
//     );
//   } else {
//     alert("บทบาทไม่ถูกต้อง");
//     return;
//   }


//   const snapshot = await getDocs(q);

//   if (snapshot.empty) {
//     itemList.innerHTML = "<p>ไม่มีข้อมูล</p>";
//     return;
//   }
//   window.openLightbox = function (url) {
//     const box = document.getElementById("lightbox");
//     const img = document.getElementById("lightbox-img");
//     img.src = url;
//     box.classList.remove("d-none");
//   };

//   window.closeLightbox = function () {
//     document.getElementById("lightbox").classList.add("d-none");
//   };

//   itemList.innerHTML = "";
//   snapshot.forEach(docSnap => {
//     const data = docSnap.data();
//     const itemDiv = document.createElement("div");
//     itemDiv.className = "item";
//     itemDiv.textContent = `${data.item} - ${data.amount} บาท`;
//     // itemDiv.onclick = () => showDetail(docSnap.id, data);
//     itemDiv.onclick = () => showDetail(docSnap.id, data, currentUser); // ส่ง currentUser เข้าไป
//     itemList.appendChild(itemDiv);
//   });
// });


// async function getTeamNames(adminleaderName) {
//   const q = query(collection(db, "users"), where("adminleader", "==", adminleaderName));
//   const snapshot = await getDocs(q);
//   const names = snapshot.docs.map(doc => doc.data().name);
//   console.log("👥 ลูกน้องของ adminleader:", names);
//   return names;
// }
// console.log("🧑‍💼 กำลังโหลดข้อมูลสำหรับ role:", role);

// if (role === "admin") {
//   console.log("🔍 Query สำหรับ admin:", user.uid);
// } else if (role === "adminleader") {
//   const teamNames = await getTeamNames(userData.name);
//   console.log("🔍 Query สำหรับ adminleader:", teamNames);
// } else if (role === "accountor") {
//   console.log("🔍 Query สำหรับ accountor:", division);
// }
// document.querySelectorAll(".btn.approve").forEach(button => {
//   button.addEventListener("click", async () => {
//     const docId = button.dataset.id;
//     await approveItem(docId);
//   });
// });


// function showDetail(docId, data) {
//   window.approveItem = async function (docId) {
//     if (!confirm("คุณต้องการอนุมัติรายการนี้ใช่หรือไม่?")) return;

//     try {
//       // await setDoc(doc(db, "expenses", docId), {
//       //   status: "approved"
//       // }, { merge: true });

//       window.location.href = `form.html?docId=${docId}`;
//     } catch (err) {
//       console.error("❌ Approve Error:", err);
//       alert("เกิดข้อผิดพลาด: " + err.message);
//     }
//     };
//   window.checkItem = async function (docId) {
//     if (!confirm("คุณต้องการอนุมัติรายการนี้ใช่หรือไม่?")) return;

//     try {
//       // await setDoc(doc(db, "expenses", docId), {
//       //   status: "approved"
//       // }, { merge: true });

//       window.location.href = `checkForm.html?docId=${docId}`;
//     } catch (err) {
//       console.error("❌ Approve Error:", err);
//       alert("เกิดข้อผิดพลาด: " + err.message);
//     }
//   };
//   let approveBtn = "";
//   let checkBtn ="";

//   // ถ้า role คือ adminleader และ uid ไม่ตรงกับ currentUser → หมายถึงกำลังดูของลูกน้อง
//   // if (currentUser.role === "adminleader" && data.uid !== currentUser.uid )
//   if (currentUser.role === "adminleader" && data.uid !== currentUser.uid &&
  
//   (data.status === "รอทำเบิก" || data.status === "โอนชำระโดยพนักงาน")) 
//   {
  
//     approveBtn = `
//       <button class="btn delete mt-3" onclick="approveItem('${docId}')">
//         ✅ อนุมัติรายการนี้
//       </button>
//     `;
//   }
//   if (currentUser.role === "accountor" && data.uid !== currentUser.uid &&
//   (data.status === "หัวหน้าอนุมัติ" )) 
//   {
  
//     checkBtn = `
//       <button class="btn delete mt-3" onclick="checkItem('${docId}')">
//         ✅ ตรวจสอบรายการนี้
//       </button>
//     `;
//   }
  
//   itemDetail.innerHTML = `
//     <p><b>รายการ:</b> ${data.item}</p>
//     <p><b>วันที่:</b> ${data.date}</p>
//     <p><b>ยอดชำระ:</b> ${data.amount} บาท</p>
//     <p><b>ธนาคาร:</b> ${data.bank}</p>
//     <p><b>บัญชี:</b> ${data.accountName} (${data.accountNumber})</p>
//     <p><b>พนักงาน:</b> ${data.employee} (${data.role})</p>
//     <p><b>สถานะ:</b> ${data.status}</p>

//     ${data.invImgUrl ? `
//       <div>
//         <b>รูปภาพใบแจ้งหนี้:</b><br>
//         <img src="${data.invImgUrl}" alt="Invoice Image" style="max-width: 100%; max-height: 300px; border:1px solid #ccc; margin-top:10px;" onclick="openLightbox('${data.invImgUrl}')">
//       </div>` : ''}

//     ${data.invPdfUrl ? `
//       <div style="margin-top:10px;">
//         <b>ไฟล์ใบแจ้งหนี้ (PDF):</b><br>
//         <a href="${data.invPdfUrl}" target="_blank" class="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
//       </div>` : ''}

//     ${data.invImgEmployeeUrl ? `
//       <div>
//         <b>รูปภาพใบโอนชำระโดยพนักงาน:</b><br>
//         <img src="${data.invImgEmployeeUrl}" alt="Invoice Employee Image" style="max-width: 100%; max-height: 300px; border:1px solid #ccc; margin-top:10px;" onclick="openLightbox('${data.invImgEmployeeUrl}')">
//       </div>` : ''}

//     ${data.invPdfEmployeeUrl ? `
//       <div style="margin-top:10px;">
//         <b>ไฟล์ใบโอนชำระโดยพนักงาน (PDF):</b><br>
//         <a href="${data.invPdfEmployeeUrl}" target="_blank" class="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
//       </div>` : ''}
//     ${approveBtn}
//     ${checkBtn}
//     <button class="btn delete mt-3" onclick="cancelItem('${docId}')">🗑️ ยกเลิกรายการ</button>
//   `;
// }

// function displayItemCard(docId, data) {
//   const container = document.getElementById("expenseList");
//   const card = document.createElement("div");
//   card.className = "card mb-2 p-2";

//   card.innerHTML = `
//     <p><b>${data.item}</b> - ${data.amount} บาท</p>
//     <p>${data.employee} (${data.role})</p>
//     <button onclick="showDetail('${docId}', ${JSON.stringify(data).replace(/"/g, '&quot;')})" class="btn btn-sm btn-info">ดูรายละเอียด</button>
//   `;

//   container.appendChild(card);
// }




// window.cancelItem = async function (docId) {
//   if (confirm("ต้องการยกเลิกรายการนี้ใช่หรือไม่?")) {
//     await updateDoc(doc(db, "expenses", docId), {
//       status: "cancelled"
//     });
//     alert("✅ ยกเลิกรายการแล้ว");
//     location.reload();
//   }
// };

// // Logout
// window.logoutUser = async function () {
//   console.log("Logout function called");
//   try {
//     await signOut(auth);
//     localStorage.clear();
//     window.location.href = "index.html";
//   } catch (error) {
//     console.error("Logout failed", error);
//     alert("Logout failed");
//   }
// };

// document.getElementById("logoutBtn").addEventListener("click", () => {
//   window.logoutUser();
// });
// function renderItems(data) {
//   const type = entryTypeFilter?.value || "all";
//   itemList.innerHTML = "";

//   const filtered = type === "all"
//     ? data
//     : data.filter(d => (d.entryType || "expense") === type); // 🛠 default เป็น expense

//   if (filtered.length === 0) {
//     itemList.innerHTML = "<p>ไม่พบรายการ</p>";
//     return;
//   }

//   filtered.forEach(item => {
//     const itemDiv = document.createElement("div");
//     itemDiv.className = "item";
//     const typeIcon = item.entryType === "recurring" ? "🔁" : "📌";
//     itemDiv.textContent = `${typeIcon} ${item.item || "ไม่ระบุ"} - ${item.amount} บาท`;
//     itemDiv.onclick = () => showDetail(item.id, item);
//     itemList.appendChild(itemDiv);
//   });
// }
// document.getElementById("entryTypeFilter")?.addEventListener("change", async () => {
//   const type = entryTypeFilter.value;
//   if (type === "recurring") {
//     await loadRecurring();
//   } else {
//     await loadExpenses();
//   }
// });


// dashboard.js - Clean Full Version
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcL-j2Em-8q0Wvg-flOTssxQT4XlWqXzE",
  authDomain: "bill-for--vj-mart.firebaseapp.com",
  projectId: "bill-for--vj-mart",
  storageBucket: "bill-for--vj-mart.appspot.com",
  messagingSenderId: "700824685931",
  appId: "1:700824685931:web:856b3880c0496b5fd1902e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const itemList = document.getElementById("item-list");
const itemDetail = document.getElementById("item-detail");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists()) {
    alert("ไม่พบข้อมูลผู้ใช้");
    return;
  }

  currentUser = { uid: user.uid, ...userSnap.data() };
  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) {
    welcomeText.textContent = `สวัสดี ${currentUser.name} (${currentUser.division}, ${currentUser.company})`;
  }
  await loadExpenses();
});

async function loadExpenses() {
  let q;
  if (currentUser.role === "admin") {
    q = query(collection(db, "expenses"), where("uid", "==", currentUser.uid));
  } else if (currentUser.role === "adminleader") {
    q = query(collection(db, "expenses"),
      where("adminleader", "==", currentUser.name),
      where("company", "==", currentUser.company)
    );
  } else if (currentUser.role === "accountor") {
    q = query(collection(db, "expenses"),
      where("division", "==", currentUser.division),
      where("company", "==", currentUser.company)
    );
  }

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), entryType: "expense" }));
  renderItems(items);
  renderStatusSummary(items);
}

async function loadRecurring() {
  let q;
  if (currentUser.role === "admin") {
    q = query(collection(db, "recurring"), where("uid", "==", currentUser.uid));
  } else if (currentUser.role === "adminleader") {
    q = query(collection(db, "recurring"),
      where("adminleader", "==", currentUser.name),
      where("company", "==", currentUser.company)
    );
  } else if (currentUser.role === "accountor") {
    q = query(collection(db, "recurring"),
      where("division", "==", currentUser.division),
      where("company", "==", currentUser.company)
    );
  }

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), entryType: "recurring" }));
  renderItems(items);
  renderStatusSummary(items);
}

// function renderItems(data) {
//   const type = document.getElementById("entryTypeFilter")?.value || "all";
//   itemList.innerHTML = "";

//   const filtered = type === "all" ? data : data.filter(d => (d.entryType || "expense") === type);

//   if (filtered.length === 0) {
//     itemList.innerHTML = "<p>ไม่พบรายการ</p>";
//     return;
//   }

//   filtered.forEach(item => {
//     const itemDiv = document.createElement("div");
//     itemDiv.className = "item";

//     const typeIcon = item.entryType === "recurring" ? "🔁" : "📌";
//     const amount = parseFloat(item.amount || 0).toLocaleString();
    
//     const status = item.status || "ไม่ระบุ";
//     const statusSpan = document.createElement("span");
//     statusSpan.className = `status-label ${getStatusColorClass(status)}`;
//     statusSpan.textContent = status;

//     itemDiv.innerHTML = `${typeIcon} ${item.item || "ไม่ระบุ"} - ${amount} บาท `;
//     itemDiv.appendChild(statusSpan);
//     itemDiv.onclick = () => showDetail(item.id, item);
//     itemList.appendChild(itemDiv);
    
    
//   });
// }
function renderItems(data) {
  const type = document.getElementById("entryTypeFilter")?.value || "all";
  itemList.innerHTML = "";

  let filtered = type === "all"
    ? data
    : data.filter(d => (d.entryType || "expense") === type);

  if (selectedStatusFilter) {
    filtered = filtered.filter(d => (d.status || "อื่นๆ") === selectedStatusFilter);
  }

  if (filtered.length === 0) {
    itemList.innerHTML = "<p>ไม่พบรายการ</p>";
    return;
  }

  filtered.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";
    const typeIcon = item.entryType === "recurring" ? "🔁" : "📌";

    // เพิ่ม class สีของสถานะด้วย
    const statusColorClass = {
      "รอทำเบิก": "gray",
      "หัวหน้าอนุมัติ": "blue",
      "ตรวจสอบแล้ว": "green",
      "ไม่เรียบร้อย": "red",
      "ส่งให้ลูกค้าแล้ว": "green",
      "ยกเลิก": "red",
    }[item.status] || "default";

    itemDiv.innerHTML = `
      ${typeIcon} ${item.item || "ไม่ระบุ"} - ${item.amount} บาท
      <span class="status-label ${statusColorClass}">${item.status || "ไม่มีสถานะ"}</span>
    `;
    itemDiv.onclick = () => showDetail(item.id, item);
    itemList.appendChild(itemDiv);
  });
}

function getStatusColorClass(status) {
  switch (status) {
    case "รอทำเบิก":
      return "gray";
    case "หัวหน้าอนุมัติ":
      return "blue";
    case "ตรวจสอบแล้ว":
      return "green";
    case "ไม่เรียบร้อย":
      return "red";
    case "ยกเลิก":
    case "cancelled":
      return "red";
    default:
      return "default";
  }
}

function renderStatusSummary(data) {
  const summaryDiv = document.getElementById("status-summary");
  if (!summaryDiv) return;

  const count = {
    "รอทำเบิก": 0,
    "หัวหน้าอนุมัติ": 0,
    "ตรวจสอบแล้ว": 0,
    "ไม่เรียบร้อย": 0,
    "ส่งให้ลูกค้าแล้ว": 0,
    "ยกเลิก": 0,
    
  };

  data.forEach(item => {
    const status = item.status || "อื่นๆ";
    if (count[status] !== undefined) count[status]++;
    else count["อื่นๆ"]++;
  });

  summaryDiv.innerHTML = `
    <div class="status-box status-pending" data-status="รอทำเบิก">⏳ รอทำเบิก<br>${count["รอทำเบิก"]}</div>
    <div class="status-box status-approved" data-status="หัวหน้าอนุมัติ">✅ หัวหน้าอนุมัติ<br>${count["หัวหน้าอนุมัติ"]}</div>
    <div class="status-box status-checked" data-status="ตรวจสอบแล้ว">🔍 ตรวจสอบแล้ว<br>${count["ตรวจสอบแล้ว"]}</div>
    <div class="status-box status-reject" data-status="ไม่เรียบร้อย">❌ ไม่เรียบร้อย<br>${count["ไม่เรียบร้อย"]}</div>
    <div class="status-box status-sent" data-status="ส่งให้ลูกค้าแล้ว">✅ ส่งให้ลูกค้าแล้ว<br>${count["ส่งให้ลูกค้าแล้ว"]}</div>
    <div class="status-box status-cancelled" data-status="ยกเลิก">❌ ยกเลิก<br>${count["ยกเลิก"]}</div>
  `;

  // ✅ เพิ่ม Event Listener หลังสร้างกล่อง
  document.querySelectorAll(".status-box").forEach(box => {
    box.addEventListener("click", () => {
      const selectedStatus = box.dataset.status;
      filterByStatus(selectedStatus); // ฟังก์ชันใหม่
    });
  });
}
let selectedStatusFilter = null;

function filterByStatus(status) {
  selectedStatusFilter = status;
  loadExpenses(); // โหลดใหม่ทั้งหมด แล้ว filter ทีหลัง
}


document.getElementById("entryTypeFilter")?.addEventListener("change", async () => {
  const type = document.getElementById("entryTypeFilter").value;
  if (type === "recurring") await loadRecurring();
  else await loadExpenses();
});

function showDetail(docId, data) {
  window.approveItem = async function (docId) {
    if (!confirm("คุณต้องการอนุมัติรายการนี้ใช่หรือไม่?")) return;

    try {
      // await setDoc(doc(db, "expenses", docId), {
      //   status: "approved"
      // }, { merge: true });

      window.location.href = `form.html?docId=${docId}`;
    } catch (err) {
      console.error("❌ Approve Error:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
    };
  
  window.checkItem = async function (docId) {
  if (!confirm("ต้องการส่งรายการนี้หรือไม่?")) return;
  await updateDoc(doc(db, "expenses", docId), { status: "ส่งให้ลูกค้าแล้ว" });
  alert("✅ ส่งรายการแล้ว");
  location.reload();
};
  window.sendItem = async function (docId) {
    if (!confirm("คุณต้องการอนุมัติรายการนี้ใช่หรือไม่?")) return;

    try {
      await setDoc(doc(db, "expenses", docId), {
        status: "ส่งให้ลูกค้าแล้ว"
      }, { merge: true });

      // window.location.href = `checkForm.html?docId=${docId}`;
    } catch (err) {
      console.error("❌ send Error:", err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    }
  };
  let approveBtn = "";
  let checkBtn ="";
  let sendBtn ="";

  // ถ้า role คือ adminleader และ uid ไม่ตรงกับ currentUser → หมายถึงกำลังดูของลูกน้อง
  // if (currentUser.role === "adminleader" && data.uid !== currentUser.uid )
  if (currentUser.role === "adminleader" && data.uid !== currentUser.uid &&
  
  (data.status === "รอทำเบิก" || data.status === "โอนชำระโดยพนักงาน")) 
  {
  
    approveBtn = `
      <button class="btn delete mt-3" onclick="approveItem('${docId}')">
        ✅ อนุมัติรายการนี้
      </button>
    `;
  }
  if (currentUser.role === "accountor" && data.uid !== currentUser.uid &&
  (data.status === "หัวหน้าอนุมัติ" )) 
  {
  
    checkBtn = `
      <button class="btn delete mt-3" onclick="checkItem('${docId}')">
        ✅ ตรวจสอบรายการนี้
      </button>
    `;
  }
  if (currentUser.role === "accountor" && data.uid !== currentUser.uid &&
  (data.status === "ตรวจสอบแล้ว" )) 
  {
  
    sendBtn = `
      <button class="btn delete mt-3" onclick="sendItem('${docId}')">
        ✅ ส่งให้ลูกค้า
      </button>
    `;
  }
  
  itemDetail.innerHTML = `
  ${data.item ? `<p><b>รายการ:</b> ${data.item}</p>` : ""}
  ${data.date ? `<p><b>วันที่:</b> ${data.date}</p>` : ""}
  ${data.nextDate ? `<p><b>วันที่ถัดไป:</b> ${data.nextDate}</p>` : ""}
  ${data.amount ? `<p><b>ยอดชำระ:</b> ${data.amount} บาท</p>` : ""}
  ${data.bank ? `<p><b>ธนาคาร:</b> ${data.bank}</p>` : ""}
  ${data.accountNumber || data.accountName ? `<p><b>บัญชี:</b> ${data.accountName || ""} (${data.accountNumber || ""})</p>` : ""}
  ${data.employee || data.role ? `<p><b>พนักงาน:</b> ${data.employee || ""} (${data.role || ""})</p>` : ""}
  ${data.expenseType ? `<p><b>ประเภทค่าใช้จ่าย:</b> ${data.expenseType}</p>` : ""}
  ${data.status ? `<p><b>สถานะ:</b> ${data.status}</p>` : ""}
  ${data.note ? `<p><b>หมายเหตุ:</b> ${data.note}</p>` : ""}

    ${data.invImgUrl ? `
      <div>
        <b>รูปภาพใบแจ้งหนี้:</b><br>
        <img src="${data.invImgUrl}" alt="Invoice Image" style="max-width: 100%; max-height: 300px; border:1px solid #ccc; margin-top:10px;" onclick="openLightbox('${data.invImgUrl}')">
      </div>` : ''}

    ${data.invPdfUrl ? `
      <div style="margin-top:10px;">
        <b>ไฟล์ใบแจ้งหนี้ (PDF):</b><br>
        <a href="${data.invPdfUrl}" target="_blank" class="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
      </div>` : ''}

    ${data.invImgEmployeeUrl ? `
      <div>
        <b>รูปภาพใบโอนชำระโดยพนักงาน:</b><br>
        <img src="${data.invImgEmployeeUrl}" alt="Invoice Employee Image" style="max-width: 100%; max-height: 300px; border:1px solid #ccc; margin-top:10px;" onclick="openLightbox('${data.invImgEmployeeUrl}')">
      </div>` : ''}

    ${data.invPdfEmployeeUrl ? `
      <div style="margin-top:10px;">
        <b>ไฟล์ใบโอนชำระโดยพนักงาน (PDF):</b><br>
        <a href="${data.invPdfEmployeeUrl}" target="_blank" class="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
      </div>` : ''}
${data.checkimg ? `
      <div>
        <b>รูปภาพโอนชำระให้พนักงาน:</b><br>
        <img src="${data.checkimg}" alt="Invoice Employee Image" style="max-width: 100%; max-height: 300px; border:1px solid #ccc; margin-top:10px;" onclick="openLightbox('${data.invImgEmployeeUrl}')">
      </div>` : ''}

    ${data.checkpdfUrl ? `
      <div style="margin-top:10px;">
        <b>ไฟล์ใบโอนชำระให้พนักงาน (PDF):</b><br>
        <a href="${data.checkpdfUrl}" target="_blank" class="btn btn-outline-primary">📄 เปิดไฟล์ PDF</a>
      </div>` : ''}
    ${approveBtn}
    ${checkBtn}
    ${sendBtn}
    <button class="btn delete mt-3" onclick="cancelItem('${docId}')">🗑️ ยกเลิกรายการ</button>
  `;
}
window.cancelItem = async function (docId) {
  if (!confirm("ต้องการยกเลิกรายการนี้หรือไม่?")) return;
  await updateDoc(doc(db, "expenses", docId), { status: "cancelled" });
  alert("✅ ยกเลิกรายการแล้ว");
  location.reload();
};

window.logoutUser = async function () {
  try {
    await signOut(auth);
    localStorage.clear();
    window.location.href = "index.html";
  } catch (err) {
    alert("Logout failed: " + err.message);
  }
};

document.getElementById("logoutBtn")?.addEventListener("click", () => window.logoutUser());

window.openLightbox = function (url) {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = url;
  box.classList.remove("d-none");
};

window.closeLightbox = function () {
  document.getElementById("lightbox").classList.add("d-none");
};

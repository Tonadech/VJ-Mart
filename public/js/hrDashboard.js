// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, setDoc, doc, updateDoc, deleteDoc,
  query, where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcL-j2Em-8q0Wvg-flOTssxQT4XlWqXzE",
  authDomain: "bill-for--vj-mart.firebaseapp.com",
  projectId: "bill-for--vj-mart",
  storageBucket: "bill-for--vj-mart.appspot.com",
  messagingSenderId: "700824685931",
  appId: "1:700824685931:web:856b3880c0496b5fd1902e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const companySection = document.getElementById("companySection");
const companyForm = document.getElementById("companyForm");
const companyList = document.getElementById("companyList");
const deleteCompanyBtn = document.getElementById("deleteCompanyBtn");
const divisionForm = document.getElementById("divisionForm");
const divisionSelect = document.getElementById("divisionSelect");
const userForm = document.getElementById("userForm");
const userTable = document.querySelector("#userTable tbody");
const roleSelect = document.getElementById("role");
const adminLeaderGroup = document.getElementById("adminLeaderGroup");
const adminLeaderSelect = document.getElementById("adminLeaderSelect");
const filterInput = document.getElementById("filterInput");
const userCompanySelect = document.getElementById("userCompanySelect");
const divisionCompanyGroup = document.getElementById("divisionCompanyGroup");
const divisionCompanySelect = document.getElementById("divisionCompanySelect");
const userCompanyGroup = document.getElementById("userCompanyGroup");


let currentUser = null;
let currentCompany = "";
let divisions = [];
let users = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const snap = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));
  const data = snap.docs[0]?.data();
  currentUser = data;
  currentCompany = data?.company || "";
  console.log("🧠 currentUser (from auth):", currentUser); // ✅ Debug ตรงนี้
  console.log("🏢 currentCompany:", currentCompany);
  
  if (data?.role === "vj") {
    companySection.classList.remove("d-none");
    userCompanyGroup.classList.remove("d-none");
    divisionCompanyGroup?.classList.remove("d-none");
    // ✅ เพิ่ม listener ให้โหลดแผนกตามบริษัทที่เลือก
    
  } else {
    companySection.classList.add("d-none");
    userCompanyGroup.classList.add("d-none");
    divisionCompanyGroup?.classList.add("d-none");
  }

  await loadCompanies();
  await loadDivisions();
  await loadUsers();
  userCompanySelect.addEventListener("change", loadDivisions);
// MOCK LOGIN FUNCTION (for development)
window.mockLogin = async function (role) {
  if (role === 'vj') {
    currentUser = {
      role: 'vj',
      name: 'Owner VJ',
      email: 'vj@example.com'
    };
    currentCompany = ""; // VJ ไม่จำกัดบริษัท
  } else if (role === 'hr') {
    currentUser = {
      role: 'hr',
      name: 'HR Example',
      email: 'hr@example.com',
      company: 'Sam'
    };
    currentCompany = 'Sam';
  }

  // แสดง/ซ่อนส่วนของ VJ
  if (currentUser.role === "vj") {
    companySection.classList.remove("d-none");
    divisionCompanyGroup.classList.remove("d-none");
    userCompanyGroup.classList.remove("d-none");
  } else {
    companySection.classList.add("d-none");
  }

  await loadCompanies();
  await loadDivisions();
  await loadUsers();
  userCompanySelect.addEventListener("change", loadDivisions);
};

});

companyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = e.target.companyName.value.trim();
  if (name) {
    await addDoc(collection(db, "companies"), { name });
    await loadCompanies();
    alert("✅ เพิ่มบริษัทแล้ว");
    e.target.reset();
  }
});

deleteCompanyBtn.addEventListener("click", async () => {
  const name = companyList.value;
  if (!name) return alert("กรุณาเลือกบริษัทที่ต้องการลบ");
  const q = query(collection(db, "companies"), where("name", "==", name));
  const snap = await getDocs(q);
  snap.forEach(docSnap => deleteDoc(doc(db, "companies", docSnap.id)));
  await loadCompanies();
  alert("🗑️ ลบบริษัทสำเร็จ");
});

// async function loadCompanies() {
//   const snap = await getDocs(collection(db, "companies"));
//   companyList.innerHTML = `<option value="">-- เลือกบริษัท --</option>`;
//   userCompanySelect.innerHTML = `<option value="">-- เลือกบริษัท --</option>`;

//   snap.forEach(doc => {
//     const name = doc.data().name;
//     if (currentUser?.role === "vj" || name === currentCompany) {
//       const opt1 = document.createElement("option");
//       opt1.value = name;
//       opt1.textContent = name;
//       companyList.appendChild(opt1);

//       const opt2 = document.createElement("option");
//       opt2.value = name;
//       opt2.textContent = name;
//       userCompanySelect.appendChild(opt2);
//     }
//   });
// }

async function loadCompanies() {
  const snap = await getDocs(collection(db, "companies"));
  companyList.innerHTML = `<option value="">-- เลือกบริษัท --</option>`;
  userCompanySelect.innerHTML = `<option value="">-- เลือกบริษัท --</option>`;
  divisionCompanySelect.innerHTML = `<option value="">-- เลือกบริษัท --</option>`;

  snap.forEach(doc => {
    const name = doc.data().name;
    if (currentUser?.role === "vj" || name === currentCompany) {
      const opt = new Option(name, name);
      companyList.appendChild(opt.cloneNode(true));
      userCompanySelect.appendChild(opt.cloneNode(true));
      divisionCompanySelect.appendChild(opt.cloneNode(true));
    }
  });
}

// async function loadDivisions() {
//   const snap = await getDocs(collection(db, "divisions"));
//   divisions = snap.docs.map(d => d.data()).filter(d => {
//     return currentUser?.role === "vj" || d.company === currentCompany;
//   });
//   divisionSelect.innerHTML = '<option value="">-- เลือกแผนก --</option>';
//   divisions.forEach(d => {
//     const opt = document.createElement("option");
//     opt.value = d.name;
//     opt.textContent = d.name;
//     divisionSelect.appendChild(opt);
//   });
// }
async function loadDivisions() {
  const snap = await getDocs(collection(db, "divisions"));
  const selectedCompany =
    currentUser?.role === "vj" ? userCompanySelect.value || currentCompany : currentCompany;

  divisions = snap.docs
    .map((d) => d.data())
    .filter((d) => d.company === selectedCompany);

  divisionSelect.innerHTML = '<option value="">-- เลือกแผนก --</option>';
  divisions.forEach((d) => {
    const opt = new Option(d.name, d.name);
    divisionSelect.appendChild(opt);
  });
}


async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));
  users = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  if (currentUser?.role !== "vj") {
    users = users.filter(u => u.company === currentCompany);
  }
  renderUsers(users);
}

function renderUsers(data) {
  userTable.innerHTML = "";
  data.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.uid}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.division}</td>
      <td>${u.role}</td>
      <td>${u.company || "-"}</td>
      <td>${u.role === "admin" ? (u.adminleader || "-") : "-"}</td>
    `;
    userTable.appendChild(tr);
  });
}

// userForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const formData = new FormData(e.target);
//   const data = Object.fromEntries(formData.entries());

//   const selectedCompany = (currentUser?.role === "vj")
//     ? userCompanySelect.value
//     : currentCompany;

//   if (!selectedCompany) {
//     alert("❗ กรุณาเลือกบริษัท");
//     return;
//   }

//   try {
//     const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
//     await setDoc(doc(db, "users", cred.user.uid), {
//       name: data.name,
//       email: data.email,
//       division: data.division,
//       role: data.role,
//       adminleader: data.adminleader || "",
//       company: selectedCompany,
//     });

//     alert("✅ สร้างบัญชีผู้ใช้สำเร็จ");
//     e.target.reset();
//     loadUsers();
//   } catch (error) {
//     console.error("❌ Error creating user:", error);
//     alert("❌ เกิดข้อผิดพลาดในการสร้างบัญชี: " + error.message);
//   }
// });
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  const selectedCompany = (currentUser?.role === "vj")
    ? userCompanySelect.value
    : currentCompany;

  if (!selectedCompany) {
    alert("❗ กรุณาเลือกบริษัท");
    return;
  }

  try {
    // ✅ 1) สร้าง Firebase App ใหม่ (Secondary App) สำหรับสร้าง user
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");

    // ✅ 2) ใช้ Secondary App ในการ auth และสร้าง user ใหม่
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      data.password
    );

    // ✅ 3) เพิ่มข้อมูล user ใหม่ใน Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      name: data.name,
      email: data.email,
      division: data.division,
      role: data.role,
      adminleader: data.adminleader || "",
      company: selectedCompany,
    });

    alert("✅ สร้างบัญชีผู้ใช้สำเร็จ");
    e.target.reset();
    loadUsers();
  } catch (error) {
    console.error("❌ Error creating user:", error);
    alert("❌ เกิดข้อผิดพลาดในการสร้างบัญชี: " + error.message);
  }
});
roleSelect.addEventListener("change", async () => {
  const role = roleSelect.value;
  if (role === "admin") {
    const division = divisionSelect.value;
    if (!division) return;

    // กำหนดบริษัทที่ต้องการกรอง adminleader ตาม role
    let targetCompany = currentCompany; // ค่า default คือบริษัทของ HR
    if (currentUser?.role === "vj") {
      // กรณี vj ให้ใช้บริษัทที่เลือกใน dropdown สำหรับเพิ่ม user
      targetCompany = userCompanySelect.value || currentCompany;
    }

    const q = query(
      collection(db, "users"),
      where("role", "==", "adminleader"),
      where("division", "==", division),
      where("company", "==", targetCompany)
    );

    const snap = await getDocs(q);
    adminLeaderSelect.innerHTML = '<option value="">-- เลือกหัวหน้า --</option>';
    snap.forEach(doc => {
      const u = doc.data();
      const opt = document.createElement("option");
      opt.value = u.name;
      opt.textContent = u.name;
      adminLeaderSelect.appendChild(opt);
    });
    adminLeaderGroup.classList.remove("d-none");
  } else {
    adminLeaderGroup.classList.add("d-none");
  }
});


filterInput.addEventListener("input", () => {
  const q = filterInput.value.toLowerCase();
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.division.toLowerCase().includes(q)
  );
  renderUsers(filtered);
});

divisionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get("divisionName").trim();
  const selectedCompany = formData.get("divisionCompany");

  const targetCompany = currentUser?.role === "vj" ? selectedCompany : currentCompany;

  if (name && targetCompany) {
    await addDoc(collection(db, "divisions"), { name, company: targetCompany });
    await loadDivisions();
    alert("✅ เพิ่มแผนกสำเร็จ");
    e.target.reset();
  } else {
    alert("❌ กรุณากรอกชื่อแผนกและเลือกบริษัท");
  }
});
window.logoutUser = async function () {
      try {
        await signOut(auth);
        localStorage.clear();
        window.location.href = "index.html";
      } catch (err) {
        alert("Logout failed: " + err.message);
      }
    };






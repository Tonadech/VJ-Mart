import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword ,createUserWithEmailAndPassword, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore, doc, getDoc, serverTimestamp,setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {  getStorage,  ref,  uploadBytes,  getDownloadURL} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
let currentUser = null;
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
const storage = getStorage(app);

window.login = async function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential || !userCredential.user) {
      throw new Error("ไม่สามารถเข้าสู่ระบบได้: userCredential ว่างเปล่า");
    }

    const uid = userCredential.user.uid;
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const role = data.role;
      const name = data.name;
      const adminleader = data.adminleader;
      const division = data.division;
      const company = data.company;

      console.log("🎉 เข้าสู่ระบบสำเร็จ");
      console.log("ชื่อ:", name);
      console.log("ตำแหน่ง:", role);
      console.log("แผนก:", division);
      console.log("adminleader:", adminleader);
      console.log("company:", company);

      // เก็บข้อมูลไว้ localStorage (ถ้าต้องการ)
      localStorage.setItem("user", JSON.stringify({ uid, name, role,adminleader, division,company }));
      // alert("ช้าก่อน");
      if (role === "vj" || role === "hr") {
        window.location.href = "test.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      alert("ไม่พบข้อมูลผู้ใช้ในระบบ");
    }

  } catch (error) {
    console.error("❌ Login Error:", error);
    alert("เข้าสู่ระบบล้มเหลว: " + error.message);
  }
};

window.register = async function (event) {
  event.preventDefault();

  // ดึงค่าจาก input
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const division = document.getElementById("division").value;
  const company = document.getElementById("company").value;

  // เรียก registerUser พร้อมข้อมูล
  await registerUser(email, password, name, role, division);
};

async function registerUser(email, password, name, role, division) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    await setDoc(doc(db, "users", uid), {
      email,
      name,
      role,
      division,
      createdAt: serverTimestamp()
    });

    alert("✅ สมัครสมาชิกสำเร็จ");
    window.location.href = "index.html"; // หรือเปลี่ยนหน้าอื่น
  } catch (error) {
    alert("❌ เกิดข้อผิดพลาด: " + error.message);
  }
}


// ✅ ฟังก์ชันสร้างผู้ใช้ตัวอย่าง
function goToAdd() {
      window.location.href = "form.html";
    }
window.goToAdd = goToAdd;    

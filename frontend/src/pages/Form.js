import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp, getDoc, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useLocation } from "react-router-dom";

const firebaseConfig = {
  apiKey: "AIzaSyBcL-j2Em-8q0Wvg-flOTssxQT4XlWqXzE",
  authDomain: "bill-for--vj-mart.firebaseapp.com",
  projectId: "bill-for--vj-mart",
  storageBucket: "bill-for--vj-mart.firebasestorage.app",
  messagingSenderId: "700824685931",
  appId: "1:700824685931:web:856b3880c0496b5fd1902e"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

function Form() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    entryType: "expense",
    item: "",
    date: "",
    employee: "",
    role: "",
    uid: "",
    adminleader: "",
    company: "",
    division: "",
    bank: "",
    accountNumber: "",
    accountName: "",
    amount: "",
    expenseType: "",
    status: "รอทำเบิก",
    nextDate: "",
    frequencyUnit: "days",
    frequency: ""
  });
  const [invPdf, setInvPdf] = useState(null);
  const [invImg, setInvImg] = useState(null);
  const [invPdfEmployee, setInvPdfEmployee] = useState(null);
  const [invImgEmployee, setInvImgEmployee] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Autofill user info from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user.uid) {
      alert("กรุณาเข้าสู่ระบบอีกครั้ง");
      window.location.href = "/";
      return;
    }
    setForm(f => ({
      ...f,
      employee: user.name || "",
      role: user.role || "",
      division: user.division || "",
      company: user.company || "",
      uid: user.uid || "",
      adminleader: user.adminleader || user.name || ""
    }));
    // Check for edit mode
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (id) {
      setEditId(id);
      // Load expense data
      getDoc(doc(db, "expenses", id)).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm(f => ({ ...f, ...data, date: data.date && data.date.toDate ? data.date.toDate().toISOString().slice(0,10) : "" }));
        }
      });
    }
  }, [location.search]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === "entryType") {
      setShowRecurring(value === "recurring");
    }
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (name === "invPdf") setInvPdf(files[0]);
    if (name === "invImg") setInvImg(files[0]);
    if (name === "invPdfEmployee") setInvPdfEmployee(files[0]);
    if (name === "invImgEmployee") setInvImgEmployee(files[0]);
  };

  const uploadFile = async (file, path) => {
    if (!file) return "";
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const invPdfUrl = await uploadFile(invPdf, "inv-pdf");
      const invImgUrl = await uploadFile(invImg, "inv-img");
      const invPdfEmployeeUrl = await uploadFile(invPdfEmployee, "inv-employee-pdf");
      const invImgEmployeeUrl = await uploadFile(invImgEmployee, "inv-employee-img");
      let status = form.status;
      if (
        user.role === "admin" &&
        (invPdfEmployee || invImgEmployee)
      ) {
        status = "โอนชำระโดยพนักงาน";
      }
      // If editing and adminleader, set status to 'หัวหน้าอนุมัติ'
      if (editId && user.role === "adminleader") {
        // เตรียมข้อมูลที่จะอัปเดต
        const updatePayload = {
          ...form,
          invPdfUrl: invPdfUrl || form.invPdfUrl,
          invImgUrl: invImgUrl || form.invImgUrl,
          invPdfEmployeeUrl: invPdfEmployeeUrl || form.invPdfEmployeeUrl,
          invImgEmployeeUrl: invImgEmployeeUrl || form.invImgEmployeeUrl,
          status: "หัวหน้าอนุมัติ",
          date: form.date ? Timestamp.fromDate(new Date(form.date)) : "",
          nextDate: form.nextDate ? Timestamp.fromDate(new Date(form.nextDate)) : "",
        };
        // ลบ field ที่เป็น undefined ออกจาก updatePayload
        Object.keys(updatePayload).forEach(key => {
          if (updatePayload[key] === undefined) delete updatePayload[key];
        });
        await updateDoc(doc(db, "expenses", editId), updatePayload);
        setSuccess("อัปเดตรายการสำเร็จ!");
        setTimeout(() => navigate('/dashboard'), 1000);
        setLoading(false);
        return;
      }
      // Add new document as before
      const data = {
        ...form,
        uid: user.uid,
        adminleader: user.adminleader || user.name || "",
        company: user.company,
        division: user.division,
        employee: user.name,
        role: user.role,
        date: form.date ? Timestamp.fromDate(new Date(form.date)) : "",
        nextDate: form.nextDate ? Timestamp.fromDate(new Date(form.nextDate)) : "",
        invPdfUrl,
        invImgUrl,
        invPdfEmployeeUrl,
        invImgEmployeeUrl,
        status,
        createdAt: Timestamp.now()
      };
      await addDoc(collection(db, "expenses"), data);
      setSuccess("บันทึกข้อมูลสำเร็จ!");
      setForm(f => ({ ...f, item: "", date: "", bank: "", accountNumber: "", accountName: "", amount: "", expenseType: "", nextDate: "", frequency: "" }));
      setInvPdf(null); setInvImg(null); setInvPdfEmployee(null); setInvImgEmployee(null);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-3">📋 กรอกรายการค่าใช้จ่าย</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label">ประเภท:</label>
          <select className="form-select" name="entryType" value={form.entryType} onChange={handleChange}>
            <option value="expense">รายการปกติ</option>
            <option value="recurring">Recurring</option>
          </select>
        </div>
        {showRecurring && (
          <div className="row g-3">
            <div className="col-md-4">
              <label>วันที่ถัดไป</label>
              <input type="date" name="nextDate" className="form-control" value={form.nextDate} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label>หน่วยความถี่</label>
              <select name="frequencyUnit" className="form-select" value={form.frequencyUnit} onChange={handleChange} required>
                <option value="days">วัน</option>
                <option value="weeks">สัปดาห์</option>
                <option value="months">เดือน</option>
                <option value="years">ปี</option>
              </select>
            </div>
            <div className="col-md-4">
              <label>ความถี่ (วัน)</label>
              <input type="number" name="frequency" className="form-control" value={form.frequency} onChange={handleChange} />
            </div>
          </div>
        )}
        <div className="col-md-3"><label>รายการ</label><input type="text" name="item" className="form-control" value={form.item} onChange={handleChange} /></div>
        <div className="col-md-3"><label>วันที่</label><input type="date" name="date" className="form-control" value={form.date} onChange={handleChange} required /></div>
        <div className="col-md-3"><label>ธนาคาร</label><input type="text" name="bank" className="form-control" value={form.bank} onChange={handleChange} /></div>
        <div className="col-md-3"><label>เลขบัญชี</label><input type="text" name="accountNumber" className="form-control" value={form.accountNumber} onChange={handleChange} /></div>
        <div className="col-md-3"><label>ชื่อบัญชี</label><input type="text" name="accountName" className="form-control" value={form.accountName} onChange={handleChange} /></div>
        <div className="col-md-3"><label>ยอดชำระ</label><input type="number" name="amount" className="form-control" value={form.amount} onChange={handleChange} /></div>
        <div className="col-md-3">
          <label>ประเภทค่าใช้จ่าย</label>
          <select name="expenseType" className="form-select" value={form.expenseType} onChange={handleChange}>
            <option value="">-- เลือกประเภท --</option>
            <option value="ค่าสินค้า">ค่าสินค้า</option>
            <option value="PO">PO</option>
            <option value="ค่าใช้จ่ายทั่วไป">ค่าใช้จ่ายทั่วไป</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>
        <div className="col-12">
          <label>ไฟล์ INV PDF</label>
          <input type="file" name="invPdf" className="form-control" accept=".pdf" onChange={handleFileChange} />
        </div>
        <div className="col-12">
          <label>รูปภาพ INV</label>
          <input type="file" name="invImg" className="form-control" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="col-12">
          <label>ไฟล์ PDF บิลสำรองจ่ายโดยพนักงาน</label>
          <input type="file" name="invPdfEmployee" className="form-control" accept=".pdf" onChange={handleFileChange} />
        </div>
        <div className="col-12">
          <label>รูปภาพ บิลสำรองจ่ายโดยพนักงาน</label>
          <input type="file" name="invImgEmployee" className="form-control" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success" disabled={loading}>{loading ? "กำลังบันทึก..." : "💾 บันทึก"}</button>
        </div>
      </form>
    </div>
  );
}

export default Form; 
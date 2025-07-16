import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

function CheckForm() {
  const [completeness, setCompleteness] = useState("");
  const [checkpdf, setCheckpdf] = useState(null);
  const [checkimg, setCheckimg] = useState(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [docId, setDocId] = useState("");

  useEffect(() => {
    // Get docId from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("docId");
    setDocId(id);
    if (id) {
      loadExpenseData(id);
    }
  }, []);

  const loadExpenseData = async (id) => {
    try {
      const docRef = doc(db, "expenses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompleteness(data.completeness || "");
        setNote(data.note || "");
        setStatus(data.status || "");
      }
    } catch (err) {
      setError("โหลดข้อมูลไม่สำเร็จ: " + err.message);
    }
  };

  const handleCompletenessChange = (e) => {
    setCompleteness(e.target.value);
    setStatus(e.target.value === "เรียบร้อย" ? "ตรวจสอบแล้ว" : "ไม่เรียบร้อย");
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "checkpdf") setCheckpdf(files[0]);
    if (name === "checkimg") setCheckimg(files[0]);
  };

  const uploadFile = async (file, path) => {
    if (!file) return "";
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let checkpdfUrl = "";
      let checkimgUrl = "";
      if (completeness === "เรียบร้อย") {
        checkpdfUrl = await uploadFile(checkpdf, "check-pdf");
        checkimgUrl = await uploadFile(checkimg, "check-img");
      }
      const updateData = {
        completeness,
        status,
        note: completeness === "ไม่เรียบร้อย" ? note : "",
        checkpdfUrl,
        checkimgUrl,
        checkedAt: Timestamp.now()
      };
      await updateDoc(doc(db, "expenses", docId), updateData);
      setSuccess("บันทึกข้อมูลสำเร็จ!");
      setCheckpdf(null); setCheckimg(null); setNote("");
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h3 className="text-center mb-4"><i className="bi bi-clipboard-check-fill text-success"></i> ตรวจสอบความเรียบร้อย</h3>
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label"><i className="bi bi-question-circle-fill"></i> สถานะความเรียบร้อย:</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="completeness" id="complete" value="เรียบร้อย" checked={completeness === "เรียบร้อย"} onChange={handleCompletenessChange} />
                  <label className="form-check-label" htmlFor="complete"><i className="bi bi-check-circle-fill text-success"></i> เรียบร้อย</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="completeness" id="incomplete" value="ไม่เรียบร้อย" checked={completeness === "ไม่เรียบร้อย"} onChange={handleCompletenessChange} />
                  <label className="form-check-label" htmlFor="incomplete"><i className="bi bi-x-circle-fill text-danger"></i> ไม่เรียบร้อย</label>
                </div>
              </div>
              {completeness === "เรียบร้อย" && (
                <div className="mb-4">
                  <label className="form-label"><i className="bi bi-file-earmark-pdf-fill"></i> แนบไฟล์ PDF:</label>
                  <input type="file" name="checkpdf" className="form-control mb-3" accept=".pdf" onChange={handleFileChange} />
                  <label className="form-label"><i className="bi bi-image-fill"></i> แนบรูปภาพ:</label>
                  <input type="file" name="checkimg" className="form-control" accept="image/*" onChange={handleFileChange} />
                </div>
              )}
              {completeness === "ไม่เรียบร้อย" && (
                <div className="mb-4">
                  <label className="form-label"><i className="bi bi-pencil-square"></i> หมายเหตุ:</label>
                  <textarea name="note" className="form-control" rows="3" placeholder="ระบุรายละเอียดเหตุผลที่พบ..." value={note} onChange={e => setNote(e.target.value)}></textarea>
                </div>
              )}
              <div className="text-end">
                <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                  <i className="bi bi-save2-fill"></i> {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckForm; 
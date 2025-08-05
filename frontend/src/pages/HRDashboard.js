import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, deleteDoc, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

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
const auth = getAuth(app);

function HRDashboard() {
  const [companies, setCompanies] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [divisionName, setDivisionName] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", userCompany: "", division: "", role: "", adminleader: "" });
  const [ setAdminLeaders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDivisionCompany, setSelectedDivisionCompany] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // โหลด user ปัจจุบันจาก localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    loadCompanies();
    loadDivisions();
    loadUsers();
  }, []);

  useEffect(() => {
    if (userForm.role === "hr" && userForm.division) {
      setUserForm(f => ({ ...f, division: "" }));
    }
  }, [userForm.role, userForm.division]);

  // Auto-hide messages
  useEffect(() => {
    let successTimer, errorTimer;
    
    if (success) {
      console.log("Success message detected, setting timer for 2 seconds");
      successTimer = setTimeout(() => {
        console.log("Auto-clearing success message");
        setSuccess("");
      }, 2000);
    }
    
    if (error) {
      console.log("Error message detected, setting timer for 3 seconds");
      errorTimer = setTimeout(() => {
        console.log("Auto-clearing error message");
        setError("");
      }, 3000);
    }
    
    return () => {
      if (successTimer) clearTimeout(successTimer);
      if (errorTimer) clearTimeout(errorTimer);
    };
  }, [success, error]);

  const loadCompanies = async () => {
    const snap = await getDocs(collection(db, "companies"));
    setCompanies(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };
  const loadDivisions = async () => {
    const snap = await getDocs(collection(db, "divisions"));
    setDivisions(snap.docs.map(doc => ({ name: doc.data().name, company: doc.data().company })));
  };
  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
  };
  const loadAdminLeadersByDivision = async (division) => {
    // Load adminleaders for the selected division, including company
    const q = query(collection(db, "users"), where("role", "==", "adminleader"), where("division", "==", division));
    const querySnapshot = await getDocs(q);
    setAdminLeaders(querySnapshot.docs.map(doc => ({ name: doc.data().name, company: doc.data().company, division: doc.data().division })));
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "companies"), { name: companyName });
      setCompanyName("");
      setSuccess("เพิ่มบริษัทสำเร็จ");
      loadCompanies();
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCompany = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, "companies", id));
      setSuccess("ลบบริษัทสำเร็จ");
      loadCompanies();
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDivisionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const companyToSave = currentUser?.role === 'hr' ? currentUser.company : selectedDivisionCompany;
      await addDoc(collection(db, "divisions"), { name: divisionName, company: companyToSave });
      setDivisionName("");
      setSelectedDivisionCompany("");
      setSuccess("เพิ่มแผนกสำเร็จ");
      loadDivisions();
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleUserFormChange = e => {
    const { name, value } = e.target;
    setUserForm(f => ({ ...f, [name]: value }));
    if (name === "division") loadAdminLeadersByDivision(value);
  };
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userForm.email, userForm.password);
      const uid = userCredential.user.uid;
      // Add user to Firestore
      await setDoc(doc(db, "users", uid), {
        name: userForm.name,
        email: userForm.email,
        company: currentUser?.role === 'hr' ? currentUser.company : userForm.userCompany,
        division: userForm.division,
        role: userForm.role,
        adminleader: userForm.adminleader || ""
      });
      setUserForm({ name: "", email: "", password: "", userCompany: "", division: "", role: "", adminleader: "" });
      setSuccess("สร้างบัญชีผู้ใช้สำเร็จ");
      loadUsers();
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  // Filter users for HR
  const filteredUsers = users.filter(u =>
    (currentUser?.role === 'hr' ? u.company === currentUser.company : true) &&
    (
      u.name?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email?.toLowerCase().includes(filter.toLowerCase()) ||
      u.division?.toLowerCase().includes(filter.toLowerCase()) ||
      u.company?.toLowerCase().includes(filter.toLowerCase()) ||
      u.role?.toLowerCase().includes(filter.toLowerCase()) ||
      u.adminleader?.toLowerCase().includes(filter.toLowerCase()) ||
      u.uid?.toLowerCase().includes(filter.toLowerCase())
    )
  );
  // Filter divisions for selected company

  // Filter adminLeaders for the selected company and division
  // const filteredAdminLeaders = adminLeaders.filter(a => a.company === userForm.userCompany && a.division === userForm.division);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed");
    }
  };

  const handleDeleteUser = async (uid, userName, userEmail) => {
    if (!window.confirm(`ยืนยันการลบบัญชีของ ${userName}?\n\nหมายเหตุ: การลบนี้จะลบบัญชีออกจากระบบทั้งหมดและไม่สามารถกู้คืนได้`)) {
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // ลบจาก Firestore
      await deleteDoc(doc(db, "users", uid));
      
      // ลบจาก Firebase Authentication (ต้องใช้ Admin SDK หรือ Cloud Functions)
      // เนื่องจาก deleteUser ต้องใช้ user object ที่ authenticated
      // เราจะใช้ Cloud Functions หรือ Admin SDK แทน
      console.log(`ลบบัญชี ${userName} (${userEmail}) จาก Firestore สำเร็จ`);
      console.log(`หมายเหตุ: การลบบัญชีจาก Authentication ต้องใช้ Admin SDK หรือ Cloud Functions`);
      
      setSuccess(`ลบบัญชี ${userName} สำเร็จ (ลบจาก Firestore แล้ว)`);
      loadUsers();
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการลบบัญชี: " + err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <h3 className="mb-4" style={{ fontWeight: 900, color: '#1565c0', letterSpacing: 2 }}><i className="bi bi-person-gear"></i> HR Dashboard</h3>
      <button id="logoutBtn" className="btn btn-danger mb-4 float-end" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</button>
      {success && <div className="alert alert-success shadow-sm">{success}</div>}
      {error && <div className="alert alert-danger shadow-sm">{error}</div>}
      {/* Company Section (VJ only) */}
      {currentUser?.role !== 'hr' && (
        <div id="companySection" className="card p-3 mb-4">
          <h5>สร้างบริษัท</h5>
          <form id="companyForm" className="row g-2" onSubmit={handleCompanySubmit}>
            <div className="col-md-8">
              <input name="companyName" className="form-control" placeholder="ชื่อบริษัท" required value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex">
              <button className="btn btn-dark w-100" disabled={loading}><i className="bi bi-plus-circle"></i> เพิ่มบริษัท</button>
            </div>
          </form>
          <div className="mt-2 row">
            <div className="col-md-8">
              <select id="companyList" className="form-select">
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              {companies.length > 0 && (
                <button id="deleteCompanyBtn" className="btn btn-outline-danger w-100" onClick={() => handleDeleteCompany(companies[0].id)} disabled={loading}>
                  <i className="bi bi-trash"></i> ลบบริษัทแรก
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Division Section */}
      <div className="card shadow-sm p-4 mb-4 border-0">
        <h5 className="mb-3" style={{ color: '#1976d2', fontWeight: 700 }}><i className="bi bi-diagram-3"></i> เพิ่มแผนก</h5>
        <form id="divisionForm" className="row g-3 align-items-end" onSubmit={handleDivisionSubmit}>
          <div className="col-md-4">
            {currentUser?.role === 'hr' ? (
              <input className="form-control" value={currentUser.company} disabled placeholder="บริษัท" required />
            ) : (
              <select className="form-select" value={selectedDivisionCompany} onChange={e => setSelectedDivisionCompany(e.target.value)} required>
                <option value="">-- เลือกบริษัท --</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}
          </div>
          <div className="col-md-4">
            <input name="divisionName" className="form-control" placeholder="ชื่อแผนก" required value={divisionName} onChange={e => setDivisionName(e.target.value)} />
          </div>
          <div className="col-md-4 d-grid">
            <button className="btn btn-success" style={{ fontWeight: 600 }} disabled={loading}><i className="bi bi-plus-lg"></i> เพิ่มแผนก</button>
          </div>
        </form>
      </div>
      {/* User Form */}
      <div className="card shadow-sm p-4 mb-4 border-0">
        <h5 className="mb-3" style={{ color: '#1976d2', fontWeight: 700 }}><i className="bi bi-person-plus"></i> เพิ่มผู้ใช้งาน</h5>
        <form id="userForm" className="row g-3 align-items-end" onSubmit={handleUserSubmit}>
          <div className="col-md-4"><input name="name" className="form-control" placeholder="ชื่อพนักงาน" required value={userForm.name} onChange={handleUserFormChange} /></div>
          <div className="col-md-4"><input name="email" type="email" className="form-control" placeholder="อีเมล" required value={userForm.email} onChange={handleUserFormChange} /></div>
          <div className="col-md-4"><input name="password" type="password" className="form-control" placeholder="รหัสผ่าน(ต้องมีมากกว่าหรือเท่ากับ 6 ตัวอักษร)" required value={userForm.password} onChange={handleUserFormChange} /></div>
          <div className="col-md-4">
            {currentUser?.role === 'hr' ? (
              <input name="userCompany" className="form-control" required value={currentUser.company} disabled placeholder="บริษัท" />
            ) : (
              <select name="userCompany" id="userCompanySelect" className="form-select" value={userForm.userCompany} onChange={handleUserFormChange} required>
                <option value="">-- เลือกบริษัท --</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}
          </div>
          <div className="col-md-4">
            <select
              name="division"
              id="divisionSelect"
              className="form-select"
              required={userForm.role !== "hr"}
              value={userForm.division}
              onChange={handleUserFormChange}
              disabled={userForm.role === "hr"}
            >
              <option value="">-- เลือกแผนก --</option>
              {divisions.filter(d => (currentUser?.role === 'hr' ? d.company === currentUser.company : d.company === userForm.userCompany)).map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select name="role" id="role" className="form-select" required value={userForm.role} onChange={handleUserFormChange}>
              <option value="">-- เลือกบทบาท --</option>
              {currentUser?.role === 'hr' ? (
                <>
                  <option value="admin">Admin</option>
                  <option value="adminleader">Admin Leader</option>
                  <option value="accountor">Accountor</option>
                </>
              ) : (
                <>
                  <option value="admin">Admin</option>
                  <option value="adminleader">Admin Leader</option>
                  <option value="accountor">Accountor</option>
                  <option value="hr">HR</option>
                </>
              )}
            </select>
          </div>
          {userForm.role === "admin" && (
            <div className="col-md-12">
              <select
                name="adminleader"
                id="adminLeaderSelect"
                className="form-select"
                value={userForm.adminleader}
                onChange={handleUserFormChange}
                required
              >
                <option value="">-- เลือกหัวหน้า --</option>
                {users.filter(u => u.role === 'adminleader' &&
                  u.division === userForm.division &&
                  (currentUser?.role === 'hr' ? u.company === currentUser.company : u.company === userForm.userCompany)
                ).map(a => (
                  <option key={a.uid} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-md-12 d-grid">
            <button className="btn btn-primary" style={{ fontWeight: 600 }} disabled={loading}><i className="bi bi-person-plus"></i> เพิ่มผู้ใช้งาน</button>
          </div>
        </form>
      </div>
      {/* Filter */}
      <div className="input-group mb-3 shadow-sm">
        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        <input id="filterInput" className="form-control" placeholder="ค้นหาชื่อ/อีเมล/แผนก/บริษัท/บทบาท/หัวหน้า/UID" value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      {/* User Table */}
      <div className="card shadow-sm p-4 border-0">
        <h5 className="mb-3" style={{ color: '#1976d2', fontWeight: 700 }}><i className="bi bi-people"></i> รายชื่อผู้ใช้งาน</h5>
        <div className="table-responsive">
          <table className="table table-bordered align-middle" id="userTable" style={{ background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <thead className="table-light">
              <tr style={{ textAlign: 'center', fontWeight: 700 }}>
                <th>UID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>แผนก</th>
                <th>บทบาท</th>
                <th>บริษัท</th>
                <th>AdminLeader</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.uid} style={{ textAlign: 'center', background: '#f9fafd', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='#e3f2fd'} onMouseOut={e => e.currentTarget.style.background='#f9fafd'}>
                  <td style={{ fontSize: 13 }}>{u.uid}</td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.division}</td>
                  <td><span className="badge bg-info text-dark" style={{ fontSize: 13 }}>{u.role}</span></td>
                  <td>{u.company}</td>
                  <td>{u.role === "admin" ? (u.adminleader || "-") : "-"}</td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteUser(u.uid, u.name, u.email)}
                      disabled={loading}
                      title="ลบบัญชี"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mock Login Buttons */}
      <div className="mb-3 mt-4 d-flex gap-2">
      </div>
    </div>
  );
}

export default HRDashboard; 
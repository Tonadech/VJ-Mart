import React, { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
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

function Test() {
  const [companies, setCompanies] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [divisionName, setDivisionName] = useState("");
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", userCompany: "", division: "", role: "", adminleader: "" });
  const [adminLeaders, setAdminLeaders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDivisionCompany, setSelectedDivisionCompany] = useState("");

  useEffect(() => {
    loadCompanies();
    loadDivisions();
    loadUsers();
  }, []);

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
      await addDoc(collection(db, "divisions"), { name: divisionName, company: selectedDivisionCompany });
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
        company: userForm.userCompany,
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
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase()) ||
    u.division?.toLowerCase().includes(filter.toLowerCase())
  );
  // Filter divisions for selected company
  const filteredDivisions = divisions.filter(d => d.company === userForm.userCompany);
  // Filter adminLeaders for the selected company and division
  const filteredAdminLeaders = adminLeaders.filter(a => a.company === userForm.userCompany && a.division === userForm.division);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      alert("Logout failed");
    }
  };
  // Mock login handlers (for demonstration)
  const mockLogin = (role) => {
    alert(`Mock login as ${role}`);
  };

  return (
    <div className="container py-4">
      <h3><i className="bi bi-person-gear"></i> HR Dashboard</h3>
      <button id="logoutBtn" className="btn delete" onClick={handleLogout}>Logout</button>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Company Section (VJ only) */}
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
      {/* Division Section */}
      <div className="card p-3 mb-4">
        <h5>เพิ่มแผนก</h5>
        <form id="divisionForm" className="row g-2" onSubmit={handleDivisionSubmit}>
          <div className="col-md-4">
            <select className="form-select" value={selectedDivisionCompany} onChange={e => setSelectedDivisionCompany(e.target.value)} required>
              <option value="">-- เลือกบริษัท --</option>
              {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <input name="divisionName" className="form-control" placeholder="ชื่อแผนก" required value={divisionName} onChange={e => setDivisionName(e.target.value)} />
          </div>
          <div className="col-md-4">
            <button className="btn btn-success w-100" disabled={loading}><i className="bi bi-plus-lg"></i> เพิ่มแผนก</button>
          </div>
        </form>
      </div>
      {/* User Form */}
      <div className="card p-3 mb-4">
        <h5>เพิ่มผู้ใช้งาน</h5>
        <form id="userForm" className="row g-2" onSubmit={handleUserSubmit}>
          <div className="col-md-4"><input name="name" className="form-control" placeholder="ชื่อพนักงาน" required value={userForm.name} onChange={handleUserFormChange} /></div>
          <div className="col-md-4"><input name="email" type="email" className="form-control" placeholder="อีเมล" required value={userForm.email} onChange={handleUserFormChange} /></div>
          <div className="col-md-4"><input name="password" type="password" className="form-control" placeholder="รหัสผ่าน" required value={userForm.password} onChange={handleUserFormChange} /></div>
          <div className="col-md-4">
            <select name="userCompany" id="userCompanySelect" className="form-select" value={userForm.userCompany} onChange={handleUserFormChange} required>
              <option value="">-- เลือกบริษัท --</option>
              {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <select name="division" id="divisionSelect" className="form-select" required value={userForm.division} onChange={handleUserFormChange}>
              <option value="">-- เลือกแผนก --</option>
              {filteredDivisions.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <select name="role" id="role" className="form-select" required value={userForm.role} onChange={handleUserFormChange}>
              <option value="">-- เลือกบทบาท --</option>
              <option value="admin">Admin</option>
              <option value="adminleader">Admin Leader</option>
              <option value="accountor">Accountor</option>
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
                {filteredAdminLeaders.map(a => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="col-md-12">
            <button className="btn btn-primary w-100" disabled={loading}><i className="bi bi-person-plus"></i> เพิ่มผู้ใช้งาน</button>
          </div>
        </form>
      </div>
      {/* Filter */}
      <div className="input-group mb-3">
        <span className="input-group-text"><i className="bi bi-search"></i></span>
        <input id="filterInput" className="form-control" placeholder="ค้นหาชื่อ/อีเมล/แผนก" value={filter} onChange={e => setFilter(e.target.value)} />
      </div>
      {/* User Table */}
      <div className="card p-3">
        <h5>รายชื่อผู้ใช้งาน</h5>
        <div className="table-responsive">
          <table className="table table-bordered" id="userTable">
            <thead className="table-light">
              <tr>
                <th>UID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>แผนก</th>
                <th>บทบาท</th>
                <th>บริษัท</th>
                <th>AdminLeader</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.uid}>
                  <td>{u.uid}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.division}</td>
                  <td>{u.role}</td>
                  <td>{u.company}</td>
                  <td>{u.role === "admin" ? (u.adminleader || "-") : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mock Login Buttons */}
      <div className="mb-3">
        <button className="btn btn-outline-primary me-2" onClick={() => mockLogin('vj')}>🔐 Mock Login as VJ</button>
        <button className="btn btn-outline-secondary" onClick={() => mockLogin('hr')}>🔐 Mock Login as HR</button>
      </div>
    </div>
  );
}

export default Test; 
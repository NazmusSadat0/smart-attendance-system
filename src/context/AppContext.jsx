import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const INITIAL_DATA = {
  selectedDept: "Computer Science and Engineering (CSE)",
  context: { session: "24-25", term: "3.1", section: "A" },
  courses: [
    { code: "CSE-1102", title: "Structured Programming Lab", teacherId: "T-101", semester: "Level 1, Term 1", totalClasses: 26, password: "se1102@pass" },
    { code: "CSE-3101", title: "Software Engineering", teacherId: "T-101", semester: "Level 3, Term 1", totalClasses: 28, password: "se3101@pass" },
    { code: "CSE-3103", title: "Database Management Systems", teacherId: "T-102", semester: "Level 3, Term 1", totalClasses: 30, password: "dbms@2026" },
    { code: "CSE-3105", title: "Computer Networks", teacherId: null, semester: "Level 3, Term 1", totalClasses: 24, password: "net3105#pass" },
  ],
  teachers: [
    { id: "T-101", name: "Dr. Mahmudul Hasan", email: "mahmud@kuet.ac.bd", password: "tPass101" },
    { id: "T-102", name: "Prof. Farhana Yasmin", email: "farhana@kuet.ac.bd", password: "tPass102" },
    { id: "T001", name: "Demo Teacher", email: "teacher@kuet.ac.bd", password: "teacher123" },
  ],
  students: [
    {
      roll: "2307001",
      name: "Sample Student",
      dept: "CSE",
      session: "2023–24",
      email: "2307001@stud.kuet.ac.bd",
      password: "12345678",
      enrolledCourses: ["CSE-1102", "CSE-3101", "CSE-3103"],
      attendance: { "CSE-1102": 24, "CSE-3101": 21, "CSE-3103": 22 },
      comments: { "CSE-1102": "Keep submitting lab reports on time.", "CSE-3101": "Please meet me about missed classes." },
    },
    {
      roll: "2107001",
      name: "Nazmus Sadat",
      dept: "CSE",
      session: "2021–22",
      email: "2107001@stud.kuet.ac.bd",
      password: "stu001@pass",
      enrolledCourses: ["CSE-3101", "CSE-3103", "CSE-3105"],
      attendance: { "CSE-3101": 26, "CSE-3103": 27, "CSE-3105": 20 },
      comments: { "CSE-3101": "Excellent attendance." },
    },
    {
      roll: "2107002",
      name: "Ayesha Siddiqua",
      dept: "CSE",
      session: "2021–22",
      email: "2107002@stud.kuet.ac.bd",
      password: "stu002@pass",
      enrolledCourses: ["CSE-3101", "CSE-3103"],
      attendance: { "CSE-3101": 21, "CSE-3103": 24 },
      comments: {},
    },
  ],
  adminProfile: {
    name: "Md. Tariqul Islam",
    empId: "EMP-2026-009",
    email: "admin.cse@kuet.ac.bd",
    contact: "+880 1711-000000",
    superAdminPassword: "SuperAdmin@2026",
  },
  sessions: {}, // Stores teacher attendance sessions per course
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("kuetSmartAttendanceV1");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [auth, setAuth] = useState(() => {
    const savedAuth = sessionStorage.getItem("kuetAuth");
    return savedAuth ? JSON.parse(savedAuth) : { role: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem("kuetSmartAttendanceV1", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    sessionStorage.setItem("kuetAuth", JSON.stringify(auth));
  }, [auth]);

  const logout = () => setAuth({ role: null, user: null });

  return (
    <AppContext.Provider value={{ state, setState, auth, setAuth, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
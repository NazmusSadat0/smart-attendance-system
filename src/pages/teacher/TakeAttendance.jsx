import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "../../styles/teacher.css";

export default function TakeAttendance() {
  const { code } = useParams();
  const decodedCode = decodeURIComponent(code || "");
  const { state, setState, auth } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.role !== "teacher") navigate("/teacher/login");
  }, [auth, navigate]);

  const course = state.courses.find((c) => c.code === decodedCode);
  const enrolledStudents = state.students.filter((s) => s.enrolledCourses.includes(decodedCode));

  const courseSessions = state.sessions[decodedCode] || [];
  const existingUnfinished = courseSessions.find((s) => s.completed === false);

  const [mode, setMode] = useState(() => (existingUnfinished ? "choice" : "active"));
  const [activeSessionId, setActiveSessionId] = useState(() => (existingUnfinished ? existingUnfinished.id : null));

  // Auto-create a session if none exists and mode is active
  useEffect(() => {
    if (!course || enrolledStudents.length === 0) return;
    if (mode === "active" && !activeSessionId) {
      createSession(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, activeSessionId, course]);

  const finalizeSessionInContext = (sessionObj) => {
    setState((prev) => {
      const updatedSessions = (prev.sessions[decodedCode] || []).map((s) =>
        s.id === sessionObj.id ? { ...sessionObj, completed: true, completedAt: new Date().toISOString() } : s
      );

      // Increment totalClasses on course & present counts on students
      const updatedCourses = prev.courses.map((c) =>
        c.code === decodedCode ? { ...c, totalClasses: c.totalClasses + 1 } : c
      );

      const updatedStudents = prev.students.map((stu) => {
        if (!stu.enrolledCourses.includes(decodedCode)) return stu;
        const wasPresent = sessionObj.statuses[stu.roll] === "Present";
        return {
          ...stu,
          attendance: {
            ...stu.attendance,
            [decodedCode]: (stu.attendance[decodedCode] || 0) + (wasPresent ? 1 : 0),
          },
        };
      });

      return {
        ...prev,
        courses: updatedCourses,
        students: updatedStudents,
        sessions: { ...prev.sessions, [decodedCode]: updatedSessions },
      };
    });
  };

  const createSession = (closePrevious) => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      date: new Date().toISOString(),
      students: enrolledStudents.map((s) => ({ name: s.name, roll: s.roll })),
      statuses: {},
      completed: false,
    };

    if (closePrevious && existingUnfinished) {
      const filledStatuses = { ...existingUnfinished.statuses };
      existingUnfinished.students.forEach((st) => {
        if (!filledStatuses[st.roll]) filledStatuses[st.roll] = "Absent";
      });
      finalizeSessionInContext({ ...existingUnfinished, statuses: filledStatuses });
    }

    setState((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [decodedCode]: [...(prev.sessions[decodedCode] || []), newSession],
      },
    }));

    setActiveSessionId(newId);
    setMode("active");
  };

  const currentSession = (state.sessions[decodedCode] || []).find((s) => s.id === activeSessionId);

  const handleMark = (status) => {
    if (!currentSession) return;
    const unmarked = currentSession.students.find((s) => !currentSession.statuses[s.roll]);
    if (!unmarked) return;

    const nextStatuses = { ...currentSession.statuses, [unmarked.roll]: status };
    const nextSession = { ...currentSession, statuses: nextStatuses };

    const allDone = nextSession.students.every((s) => Boolean(nextStatuses[s.roll]));

    if (allDone) {
      finalizeSessionInContext(nextSession);
      setMode("completed");
    } else {
      setState((prev) => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [decodedCode]: (prev.sessions[decodedCode] || []).map((s) =>
            s.id === currentSession.id ? nextSession : s
          ),
        },
      }));
    }
  };

  if (!course) return null;

  const sessionStudents = currentSession?.students || [];
  const markedCount = currentSession ? Object.keys(currentSession.statuses).length : 0;
  const totalStudents = sessionStudents.length;
  const progressPct = totalStudents > 0 ? Math.round((markedCount / totalStudents) * 100) : 0;
  const currentStudent = sessionStudents.find((s) => !currentSession?.statuses[s.roll]);

  return (
    <div className="teacher-shell">
      <div className="attendance-container">
        <header className="attendance-header">
          <div>
            <h1>Take Attendance</h1>
            <p>{course.code}</p>
            <h2>{course.title}</h2>
          </div>
          <button
            className="secondary-btn"
            onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}`)}
          >
            Back to Course
          </button>
        </header>

        <main className="attendance-main">
          {enrolledStudents.length === 0 ? (
            <div className="completed-area">
              <h2>No Enrolled Students</h2>
              <p>Ask the Admin to enroll students in {course.code} before taking attendance.</p>
              <button
                className="primary-btn"
                onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}`)}
              >
                Back to Course
              </button>
            </div>
          ) : mode === "choice" && existingUnfinished ? (
            <section className="session-choice">
              <h2>Previous Attendance Session Found</h2>
              <p>You have an unfinished attendance session for this course. What would you like to do?</p>
              <div className="session-choice-btns">
                <button
                  className="primary-btn"
                  onClick={() => {
                    setActiveSessionId(existingUnfinished.id);
                    setMode("active");
                  }}
                >
                  Continue Previous Session
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    if (confirm("Starting a new session will mark all unmarked students in the previous session as Absent. Continue?")) {
                      createSession(true);
                    }
                  }}
                >
                  Start New Session
                </button>
              </div>
            </section>
          ) : mode === "completed" ? (
            <section className="completed-area">
              <h2>Attendance Completed!</h2>
              <p>All students have been marked and synced for {course.code}.</p>
              <button
                className="primary-btn"
                onClick={() => navigate(`/teacher/course/${encodeURIComponent(course.code)}`)}
              >
                Back to Course
              </button>
            </section>
          ) : (
            currentStudent && (
              <section>
                <div className="attendance-progress">
                  <p>Marked {markedCount} of {totalStudents} students ({progressPct}%)</p>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${progressPct}%` }}></div>
                  </div>
                </div>

                <div className="student-card" key={currentStudent.roll}>
                  <p className="student-label">CURRENT STUDENT</p>
                  <h2>{currentStudent.name}</h2>
                  <p className="student-roll-text">Roll: {currentStudent.roll}</p>

                  <div className="attendance-buttons">
                    <button className="present-btn" onClick={() => handleMark("Present")}>
                      ✓ Present
                    </button>
                    <button className="absent-btn" onClick={() => handleMark("Absent")}>
                      ✕ Absent
                    </button>
                  </div>
                </div>

                <button
                  className="stop-btn"
                  onClick={() => {
                    alert("Attendance saved. You can continue this session later.");
                    navigate(`/teacher/course/${encodeURIComponent(course.code)}`);
                  }}
                >
                  Stop & Save Progress
                </button>
              </section>
            )
          )}
        </main>
      </div>
    </div>
  );
}
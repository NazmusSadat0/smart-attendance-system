
// SAMPLE DATA FOR UI PREVIEW ONLY
// Later, we will connect this to the C backend.

var S = {
    name: "Sample Student",
    roll: "2307001",
    dept: "CSE",
    session: "2023–24",
    email: "student@example.edu"
};

var C = [
    {
        code: "CSE-1102",
        name: "Structured Programming",
        teacher: "Teacher A",
        att: 24,
        tot: 26,
        note: "Keep submitting lab reports on time."
    },
    {
        code: "MATH-1111",
        name: "Calculus I",
        teacher: "Teacher B",
        att: 19,
        tot: 26,
        note: "Please meet me about missed classes."
    },
    {
        code: "PHY-1101",
        name: "Physics I",
        teacher: "Teacher C",
        att: 14,
        tot: 22,
        note: ""
    },
    {
        code: "EEE-1121",
        name: "Basic Electrical Engineering",
        teacher: "Teacher D",
        att: 20,
        tot: 24,
        note: "Good participation."
    }
];

var N = [
    {
        t: "warn",
        m: "Low attendance in PHY-1101 (64%). Minimum required is 75%.",
        d: "Today"
    },
    {
        t: "info",
        m: "Teacher comment added for MATH-1111.",
        d: "Yesterday"
    },
    {
        t: "info",
        m: "Attendance updated for CSE-1102.",
        d: "2 days ago"
    }
];

var MIN = 75;
var WARN = 80;

function pct(c) {
    return c.tot ? Math.round(c.att * 1000 / c.tot) / 10 : 0;
}

function st(p) {
    return p >= WARN
        ? ["Good Standing", "ok", "var(--ok)"]
        : p >= MIN
        ? ["Warning", "warn", "var(--warn)"]
        : ["Low Attendance", "bad", "var(--bad)"];
}

function bar(p) {
    return '<div class="bar" role="progressbar" aria-valuenow="' +
        p + '" aria-valuemin="0" aria-valuemax="100">' +
        '<i style="width:' + p + '%;background:' +
        st(p)[2] + '"></i></div>';
}

var A = C.reduce(function(a, c) {
    return a + c.att;
}, 0);

var T = C.reduce(function(a, c) {
    return a + c.tot;
}, 0);

var OP = T ? Math.round(A * 1000 / T) / 10 : 0;

var pages = [
    ["dashboard", "Dashboard", "▦"],
    ["attendance", "My Attendance", "✓"],
    ["courses", "My Courses", "▤"],
    ["history", "Attendance History", "◷"],
    ["notifications", "Notifications", "●"],
    ["profile", "My Profile", "☺"]
];

var $ = function(i) {
    return document.getElementById(i);
};

function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}

function ring(p) {
    var r = 44;
    var c = 2 * Math.PI * r;

    return '<svg class="ring" width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="Overall attendance ' + p + ' percent">' +
        '<circle cx="55" cy="55" r="' + r + '" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="10"/>' +
        '<circle cx="55" cy="55" r="' + r + '" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (c * p / 100) + ' ' + c + '" transform="rotate(-90 55 55)"/>' +
        '<text x="55" y="61" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">' + p + '%</text>' +
        '</svg>';
}

function nav(cur) {
    $("nav").innerHTML = pages.map(function(p) {
        return '<button class="nav' +
            (p[0] === cur ? ' on' : '') +
            '" data-p="' + p[0] + '">' +
            '<span>' + p[2] + '</span>' +
            '<span class="t">' + p[1] + '</span>' +
            (p[0] === "notifications"
                ? '<span class="badge">' + N.length + '</span>'
                : '') +
            '</button>';
    }).join("");
}

function head(t, s) {
    return '<h2>' + t + '</h2><p class="sub">' + s + '</p>';
}

function table(rows, link) {
    return '<div class="scroll"><table><thead><tr>' +
        '<th>Course</th><th>Attended</th><th>Total</th>' +
        '<th>Attendance</th><th>Status</th>' +
        (link ? '' : '<th>Teacher comment</th>') +
        '</tr></thead><tbody>' +

        rows.map(function(c, i) {
            var p = pct(c);
            var s = st(p);

            return '<tr class="row" data-c="' + i + '">' +
                '<td><b>' + c.code + '</b><br>' +
                '<span style="color:var(--mute)">' + c.name + '</span></td>' +
                '<td>' + c.att + '</td>' +
                '<td>' + c.tot + '</td>' +
                '<td style="min-width:140px">' + p + '%' + bar(p) + '</td>' +
                '<td><span class="pill ' + s[1] + '">' + s[0] + '</span></td>' +
                (link ? '' : '<td>' +
                    (c.note
                        ? esc(c.note)
                        : '<span style="color:var(--mute)">No comment</span>') +
                    '</td>') +
                '</tr>';
        }).join("") +

        '</tbody></table></div>';
}

var V = {

    dashboard: function() {
        var low = C.filter(function(c) {
            return pct(c) < MIN;
        });

        return head(
            "Welcome back, " + esc(S.name),
            S.roll + " · " + S.dept + " · Session " + S.session
        ) +

        '<div class="card hero"><div>' + ring(OP) +
        '</div><div><h2>Overall attendance</h2>' +
        '<p>You attended ' + A + ' of ' + T +
        ' classes across ' + C.length + ' courses.</p></div></div>' +

        '<div class="grid g4" style="margin:16px 0">' +

        '<div class="card stat"><b>' + C.length +
        '</b><span>Registered courses</span></div>' +

        '<div class="card stat"><b>' + A +
        '</b><span>Classes attended</span></div>' +

        '<div class="card stat"><b>' + T +
        '</b><span>Classes held</span></div>' +

        '<div class="card stat"><b>' + low.length +
        '</b><span>Courses below ' + MIN + '%</span></div>' +

        '</div>' +

        '<div class="grid g2">' +

        '<div class="card"><h3>Course attendance</h3>' +

        C.map(function(c) {
            var p = pct(c);

            return '<div style="margin-bottom:14px">' +
                '<div style="display:flex;justify-content:space-between">' +
                '<b>' + c.code + '</b><span>' + p + '%</span></div>' +
                bar(p) + '</div>';
        }).join("") +

        '</div>' +

        '<div class="card"><h3>Warnings</h3>' +

        (low.length
            ? low.map(function(c) {
                return '<div class="alert" style="background:var(--bad-bg);color:var(--bad)">' +
                    '<span>⚠</span><span><b>' + c.code +
                    '</b> is at ' + pct(c) +
                    '%. Attend the next ' +
                    Math.ceil((MIN / 100 * c.tot - c.att) / (1 - MIN / 100)) +
                    ' classes in a row to reach ' + MIN + '%.</span></div>';
            }).join("")
            : '<div class="empty">No warnings. Keep it up.</div>') +

        '</div></div>';
    },

    attendance: function() {
        return head(
            "My Attendance",
            "Course-wise record. Select a row for details."
        ) +
        '<div class="card">' + table(C) + '</div>';
    },

    courses: function() {
        return head(
            "My Courses",
            "Courses you are registered in."
        ) +

        '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">' +

        C.map(function(c, i) {
            var p = pct(c);
            var s = st(p);

            return '<div class="card row" tabindex="0" role="button" data-c="' + i + '" style="cursor:pointer">' +
                '<span class="pill ' + s[1] + '">' + s[0] + '</span>' +
                '<h3 style="margin:10px 0 2px">' + c.code + '</h3>' +
                '<div style="color:var(--mute);margin-bottom:12px">' + c.name + '</div>' +
                bar(p) +
                '<div style="margin-top:6px;font-size:13px">' +
                c.att + ' / ' + c.tot + ' classes · ' + p + '%</div>' +
                '</div>';
        }).join("") +

        '</div>';
    },

    course: function(i) {
        var c = C[i];
        var p = pct(c);
        var s = st(p);

        return '<button class="back" data-p="courses">← Back to courses</button>' +

            head(c.code + " · " + c.name, "Teacher: " + c.teacher) +

            '<div class="grid g2">' +

            '<div class="card"><h3>Attendance</h3>' +
            '<div style="font-size:34px;font-weight:700">' + p + '%</div>' +
            bar(p) +
            '<p style="margin:12px 0 0"><span class="pill ' + s[1] + '">' +
            s[0] + '</span> &nbsp;' + c.att + ' attended of ' +
            c.tot + ' held</p></div>' +

            '<div class="card"><h3>Teacher comment</h3>' +
            (c.note
                ? '<p style="margin:0">' + esc(c.note) + '</p>'
                : '<p style="margin:0;color:var(--mute)">No comment yet.</p>') +
            '</div></div>';
    },

    history: function() {
        return head(
            "Attendance History",
            "Date-wise Present and Absent record."
        ) +

        '<div class="card">' +
        '<span class="tag">Needs backend change</span>' +
        '<div class="empty" style="padding-top:18px">' +
        'This page stays empty until the C backend stores a date with each attendance entry. ' +
        'If it only keeps totals, we add a date field first. No dates are made up here.' +
        '</div></div>';
    },

    notifications: function() {
        return head(
            "Notifications",
            "Alerts and updates for your account."
        ) +

        N.map(function(n) {
            var w = n.t === "warn";

            return '<div class="alert" style="background:' +
                (w
                    ? 'var(--warn-bg);color:var(--warn)'
                    : 'var(--brand-2);color:var(--ink)') +
                '">' +
                '<span>' + (w ? '⚠' : 'ℹ') + '</span>' +
                '<span style="flex:1">' + esc(n.m) + '</span>' +
                '<small>' + n.d + '</small></div>';
        }).join("");
    },

    profile: function() {
        return head(
            "My Profile",
            "Your registered details. Read-only."
        ) +

        '<div class="card"><dl class="kv">' +
        '<dt>Full name</dt><dd>' + esc(S.name) + '</dd>' +
        '<dt>Roll number</dt><dd>' + S.roll + '</dd>' +
        '<dt>Department</dt><dd>' + S.dept + '</dd>' +
        '<dt>Academic session</dt><dd>' + S.session + '</dd>' +
        '<dt>Email</dt><dd>' + esc(S.email) + '</dd>' +
        '</dl></div>';
    }
};

function go(p, arg) {
    $("view").innerHTML =
        p === "course" ? V.course(arg) : V[p]();

    nav(p === "course" ? "courses" : p);
    window.scrollTo(0, 0);
}

// LOGIN FORM
$("lf").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!$("roll").value.trim() || !$("pw").value) {
        $("lerr").classList.remove("hide");
        return;
    }

    $("lerr").classList.add("hide");
    $("login").classList.add("hide");
    $("app").classList.remove("hide");

    go("dashboard");
});

// LOGOUT BUTTON
$("out").addEventListener("click", function() {
    $("app").classList.add("hide");
    $("login").classList.remove("hide");
    $("pw").value = "";
    $("view").innerHTML = "";
});

// SIDEBAR NAVIGATION AND COURSE SELECTION
document.addEventListener("click", function(e) {
    var c = e.target.closest("[data-c]");

    if (c) {
        go("course", +c.dataset.c);
        return;
    }

    var n = e.target.closest("[data-p]");

    if (n) {
        go(n.dataset.p);
    }
});

// KEYBOARD ACCESS FOR COURSE CARDS
document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        var c = e.target.closest &&
            e.target.closest("[data-c]");

        if (c) {
            go("course", +c.dataset.c);
        }
    }
});

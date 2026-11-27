
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


// PROFILE SETTINGS

var profilePhoto = localStorage.getItem("studentProfilePhoto") || "";
var pendingPhoto = "";
var profileEditing = false;
var passwordEditing = false;
if (localStorage.getItem("studentPasswordResetDone") !== "yes") {
    localStorage.setItem("studentPassword", "12345678");
    localStorage.setItem("studentPasswordResetDone", "yes");
}

var studentPassword = localStorage.getItem("studentPassword") || "";

// Load saved profile information

var savedProfile = localStorage.getItem("studentProfile");

if (savedProfile) {
    try {
        var savedData = JSON.parse(savedProfile);

        S.name = savedData.name || S.name;
        S.email = savedData.email || S.email;

    } catch (e) {
        console.log("Could not load saved profile.");
    }
}


// ATTENDANCE FUNCTIONS

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


// NAVIGATION
// Dashboard removed from the student navigation.

var pages = [
    ["attendance", "My Attendance", "✓"],
    ["courses", "My Courses", "▤"],
    ["history", "Attendance History", "◷"],
    ["notifications", "Notifications", "●"],
    ["profile", "My Profile", "☺"]
];

var $ = function(i) {
    return document.getElementById(i);
};


// TEXT SAFETY

function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
}


// PROFILE SIDEBAR PHOTO

function updateSidebarPhoto() {
    var avatar = $("sideAvatar");
    var studentInfo = $("sideStudentInfo");

    if (!avatar || !studentInfo) return;

    if (profilePhoto) {
        avatar.innerHTML =
            '<img src="' + profilePhoto + '" alt="Profile picture">';
    } else {
        avatar.textContent = "SS";
    }

    studentInfo.innerHTML =
        esc(S.name) +
        '<small>Roll ' + esc(S.roll) + '</small>';
}


// ATTENDANCE RING

function ring(p) {
    var r = 44;
    var c = 2 * Math.PI * r;

    return '<svg class="ring" width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="Overall attendance ' + p + ' percent">' +
        '<circle cx="55" cy="55" r="' + r + '" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="10"/>' +
        '<circle cx="55" cy="55" r="' + r + '" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (c * p / 100) + ' ' + c + '" transform="rotate(-90 55 55)"/>' +
        '<text x="55" y="61" text-anchor="middle" fill="#fff" font-size="20" font-weight="700">' + p + '%</text>' +
        '</svg>';
}


// SIDEBAR NAVIGATION

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


// PAGE HEADING

function head(t, s) {
    return '<h2>' + t + '</h2><p class="sub">' + s + '</p>';
}


// ATTENDANCE TABLE

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


// ALL PAGES

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


    // MY ATTENDANCE

    attendance: function() {
        return head(
            "My Attendance",
            "Course-wise record. Select a row for details."
        ) +
        '<div class="card">' + table(C) + '</div>';
    },


    // MY COURSES

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


    // COURSE DETAILS

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


    // ATTENDANCE HISTORY

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


    // NOTIFICATIONS

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


    // MY PROFILE

    profile: function() {

        var photo = pendingPhoto || profilePhoto;

        var photoHTML = photo
            ? '<img class="profile-photo" src="' + photo + '" alt="Profile picture">'
            : '<div class="profile-photo-placeholder">SS</div>';


        // EDIT MODE

        var fields = profileEditing

            ? '<div class="profile-form">' +

                '<label for="editName">Full name</label>' +
                '<input id="editName" type="text" value="' + esc(S.name) + '">' +

                '<label for="editEmail">Email</label>' +
                '<input id="editEmail" type="email" value="' + esc(S.email) + '">' +

                '<p><b>Roll number:</b> ' + esc(S.roll) + '</p>' +
                '<p><b>Department:</b> ' + esc(S.dept) + '</p>' +
                '<p><b>Academic session:</b> ' + esc(S.session) + '</p>' +

                '<div class="profile-buttons">' +
                    '<button class="btn" type="button" data-profile-action="save">Save</button>' +
                    '<button class="btn" type="button" data-profile-action="cancel">Cancel</button>' +
                '</div>' +

              '</div>'

            // VIEW MODE

            : '<dl class="kv">' +

                '<dt>Full name</dt><dd>' + esc(S.name) + '</dd>' +
                '<dt>Roll number</dt><dd>' + esc(S.roll) + '</dd>' +
                '<dt>Department</dt><dd>' + esc(S.dept) + '</dd>' +
                '<dt>Academic session</dt><dd>' + esc(S.session) + '</dd>' +
                '<dt>Email</dt><dd>' + esc(S.email) + '</dd>' +

              '</dl>' +

              '<button class="btn" type="button" data-profile-action="edit">Edit Profile</button>';


        // PASSWORD SECTION

        var passwordSection = passwordEditing

            ? '<div class="profile-form password-form">' +
                '<h3>Change Password</h3>' +
                '<label for="currentPassword">Current password</label>' +
                '<input id="currentPassword" type="password" autocomplete="current-password" placeholder="Enter current password">' +
                '<label for="newPassword">New password</label>' +
                '<input id="newPassword" type="password" autocomplete="new-password" placeholder="At least 8 characters">' +
                '<label for="confirmPassword">Confirm new password</label>' +
                '<input id="confirmPassword" type="password" autocomplete="new-password" placeholder="Re-enter new password">' +
                '<p id="passwordError" class="profile-message" style="color:var(--bad)"></p>' +
                '<div class="profile-buttons">' +
                    '<button class="btn" type="button" data-profile-action="save-password">Save Password</button>' +
                    '<button class="btn" type="button" data-profile-action="cancel-password">Cancel</button>' +
                '</div>' +
              '</div>'

            : '<div class="password-summary">' +
                '<h3>Password</h3>' +
                '<p>••••••••</p>' +
                '<button class="btn" type="button" data-profile-action="change-password">Change Password</button>' +
              '</div>';


        return head(
            "My Profile",
            "View and manage your registered details."
        ) +

        '<div class="card">' +

            // PROFILE PICTURE

            '<div class="profile-photo-area">' +

                photoHTML +

                '<div>' +

                    '<h3>' + esc(S.name) + '</h3>' +

                    '<div class="profile-actions">' +

                        '<button class="btn" type="button" data-profile-action="upload">' +
                        'Upload / Change Photo</button>' +

                        (profilePhoto || pendingPhoto
                            ? '<button class="btn" type="button" data-profile-action="remove">Remove Photo</button>'
                            : '') +

                    '</div>' +

                    (pendingPhoto

                        ? '<p>Preview selected. Save your photo below.</p>' +

                          '<button class="btn" type="button" data-profile-action="save-photo">Save Photo</button>' +

                          '<button class="btn" type="button" data-profile-action="cancel-photo">Cancel Photo</button>'

                        : '') +

                '</div>' +

            '</div>' +

            // HIDDEN PHOTO INPUT

            '<input type="file" id="photoInput" accept="image/jpeg,image/png,image/webp" hidden>' +

            // PROFILE INFORMATION

            fields +

            '<hr>' +

            // PASSWORD SETTINGS

            passwordSection +

        '</div>';
    }

};


// PAGE NAVIGATION

function go(p, arg) {

    $("view").innerHTML =
        p === "course" ? V.course(arg) : V[p]();

    nav(p === "course" ? "courses" : p);

    window.scrollTo(0, 0);
}


// LOGIN FORM

$("lf").addEventListener("submit", function(e) {

    e.preventDefault();

    var roll = $("roll").value.trim();
    var enteredPassword = $("pw").value;

    if (!/^[0-9]+$/.test(roll)) {
        $("lerr").textContent = "Roll number must contain numbers only.";
        $("lerr").classList.remove("hide");
        return;
    }

    if (!enteredPassword) {
        $("lerr").textContent = "Please enter your password.";
        $("lerr").classList.remove("hide");
        return;
    }

    // PREVIEW-ONLY PASSWORD CHECK.
    // The first login sets the initial demo password.
    if (!studentPassword) {
        studentPassword = enteredPassword;
        localStorage.setItem("studentPassword", studentPassword);
    } else if (enteredPassword !== studentPassword) {
        $("lerr").textContent = "Incorrect password.";
        $("lerr").classList.remove("hide");
        return;
    }

    $("lerr").classList.add("hide");

    $("login").classList.add("hide");
    $("app").classList.remove("hide");

    // Student opens My Attendance after login.

    updateSidebarPhoto();
    go("attendance");

});


// LOGOUT BUTTON

$("out").addEventListener("click", function() {

    $("app").classList.add("hide");
    $("login").classList.remove("hide");

    $("pw").value = "";
    $("view").innerHTML = "";

    profileEditing = false;
    passwordEditing = false;
    pendingPhoto = "";

});


// PROFILE BUTTONS

document.addEventListener("click", function(e) {

    var button = e.target.closest("[data-profile-action]");

    if (!button) return;

    var action = button.dataset.profileAction;


    // EDIT PROFILE

    if (action === "edit") {

        profileEditing = true;
        go("profile");

    }


    // CANCEL PROFILE EDITING

    if (action === "cancel") {

        profileEditing = false;
        go("profile");

    }


    // SAVE PROFILE INFORMATION

    if (action === "save") {

        var name = $("editName").value.trim();
        var email = $("editEmail").value.trim();

        if (!name || !email) {

            alert("Please fill in your name and email.");
            return;

        }

        if (!$("editEmail").checkValidity()) {

            alert("Please enter a valid email address.");
            return;

        }

        S.name = name;
        S.email = email;

        localStorage.setItem("studentProfile", JSON.stringify({

            name: S.name,
            email: S.email

        }));

        profileEditing = false;

        updateSidebarPhoto();
        go("profile");

        alert("Profile updated successfully!");

    }


    // OPEN PHOTO UPLOAD

    if (action === "upload") {

        $("photoInput").click();

    }


    // REMOVE PROFILE PHOTO

    if (action === "remove") {

        if (confirm("Are you sure you want to remove your profile picture?")) {

            profilePhoto = "";
            pendingPhoto = "";

            localStorage.removeItem("studentProfilePhoto");

            updateSidebarPhoto();
            go("profile");

        }

    }


    // SAVE PROFILE PHOTO

    if (action === "save-photo") {

        if (pendingPhoto) {

            try {

                localStorage.setItem("studentProfilePhoto", pendingPhoto);

                profilePhoto = pendingPhoto;
                pendingPhoto = "";

                updateSidebarPhoto();
                go("profile");

                alert("Profile picture saved successfully!");

            } catch (error) {

                alert("Could not save the picture. Please choose a smaller image.");

            }

        }

    }


    // CANCEL PHOTO PREVIEW

    if (action === "cancel-photo") {

        pendingPhoto = "";
        go("profile");

    }


    // OPEN CHANGE PASSWORD FORM

    if (action === "change-password") {

        passwordEditing = true;
        go("profile");

    }


    // CANCEL CHANGE PASSWORD

    if (action === "cancel-password") {

        passwordEditing = false;
        go("profile");

    }


    // SAVE NEW PASSWORD

    if (action === "save-password") {

        var currentPassword = $("currentPassword").value;
        var newPassword = $("newPassword").value;
        var confirmPassword = $("confirmPassword").value;
        var passwordError = $("passwordError");

        if (currentPassword !== studentPassword) {
            passwordError.textContent = "Your current password is incorrect.";
            return;
        }

        if (newPassword.length < 8) {
            passwordError.textContent = "Your new password must be at least 8 characters.";
            return;
        }

        if (newPassword !== confirmPassword) {
            passwordError.textContent = "The new passwords do not match.";
            return;
        }

        if (newPassword === currentPassword) {
            passwordError.textContent = "Choose a password different from your current password.";
            return;
        }

        studentPassword = newPassword;
        localStorage.setItem("studentPassword", studentPassword);

        passwordEditing = false;
        go("profile");

        alert("Password changed successfully. Use your new password next time you log in.");

    }

});


// PROFILE PHOTO SELECTION

document.addEventListener("change", function(e) {

    if (e.target.id !== "photoInput") return;

    var file = e.target.files[0];

    if (!file) return;

    var allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Please select a JPG, PNG, or WebP image.");

        e.target.value = "";
        return;

    }

    if (file.size > 2 * 1024 * 1024) {

        alert("Image size must be 2 MB or less.");

        e.target.value = "";
        return;

    }

    var reader = new FileReader();

    reader.onload = function(event) {

        pendingPhoto = event.target.result;

        go("profile");

    };

    reader.onerror = function() {

        alert("Could not read the selected image.");

    };

    reader.readAsDataURL(file);

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


// LOAD PROFILE PHOTO IN SIDEBAR WHEN PAGE OPENS

updateSidebarPhoto();

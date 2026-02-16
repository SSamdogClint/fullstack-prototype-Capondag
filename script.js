// Simulated user data
let isLoggedIn = true;       // true or false
let username = "Juan Dela Cruz";
let role = "admin";        // "admin" or "user"

// Select elements
const notLoggedInLinks = document.querySelectorAll(".not-logged-in");
const loggedInLinks = document.querySelectorAll(".logged-in");
const adminLinks = document.querySelectorAll(".role-admin");

// Handle NOT logged in
if (!isLoggedIn) {
    notLoggedInLinks.forEach(el => el.style.display = "block");
    loggedInLinks.forEach(el => el.style.display = "none");
    adminLinks.forEach(el => el.style.display = "none");
} 
// Handle logged in
else {
    notLoggedInLinks.forEach(el => el.style.display = "none");
    loggedInLinks.forEach(el => el.style.display = "block");

    // Show username
    document.getElementById("usernameDisplay").textContent = username;

    // Admin role check
    if (role === "admin") {
        adminLinks.forEach(el => el.style.display = "block");
    } else {
        adminLinks.forEach(el => el.style.display = "none");
    }
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");
}

function handleRegister(event) {
    event.preventDefault(); // prevent page reload

    // get form values
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // save user in localStorage for demo purposes
    localStorage.setItem("user", JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        role: "user"
    }));

    // update the email displayed in verification page
    document.getElementById("verifyEmail").textContent = email;

    // show verification page
    showPage("verify");
}

function simulateVerification() {
    const user = JSON.parse(localStorage.getItem("user")) || { role: "user" };

    // auto login after verification
    login(user.role);

    // optionally hide verification page
    showPage('profile-section');
}

function login(role) {
    document.body.classList.remove("not-authenticated");
    document.body.classList.add("authenticated");

    if(role === "admin") {
        document.body.classList.add("is-admin");
    } else {
        document.body.classList.remove("is-admin");
    }

    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.getElementById("profile-section").classList.add("active");

    if(role === "admin") {
        document.getElementById("employees-section").classList.add("active");
    }

    const user = JSON.parse(localStorage.getItem("user")) || {};
    document.getElementById("usernameDisplay").textContent = user.firstName + " " + user.lastName;
}
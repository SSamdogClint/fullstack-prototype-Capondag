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
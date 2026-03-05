// Stores the currently logged in user
let currentUser = null;

// Key used to store database in localStorage
const STORAGE_KEY = "ipt_demo_v1";

// Routes that require login
const login_hash = ['#/userProfile', '#/request'];

// Routes that require admin role
const admin_hash = ['#/accounts', '#/employees', '#/departments'];

// ===============================
// LOCAL STORAGE DATABASE
// ===============================
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
}

// Retrieve saved data from localStorage
function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            window.db = JSON.parse(data);
        } else {
            throw new Error("No data");
        }
    } catch (e) {
        window.db = {
            accounts: [
                {
                    // default admin account
                    email: "admin@example.com",
                    password: "Password123!",
                    verified: true,
                    role: "admin",
                    Fname: "Admin",
                    Lname: "123"
                }
            ],
            departments: [
                { id: 1, name: "Engineering", description: "software team" },
                { id: 2, name: "HR", description: "Human resources" }
            ],
            employees: [],
            requests: []
        };
        saveToStorage();
    }
}
loadFromStorage();

// Change the URL hash to navigate to a different page/section
function navigateTo(hash) {
    window.location.hash = hash;
}

// Display the current user's profile information when the profile page is opened
function renderProfile() {
    const NameDisplay = document.getElementById('usernameDisplay');
    const profileClass = document.getElementById('profile-class');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileRole = document.getElementById('profile-role');

    // Check if the element exists before updating the profile data
    if (NameDisplay) {
        NameDisplay.innerText = currentUser.Fname; // Display user's first name in the navigation bar
        profileClass.innerText = currentUser.role; // Show the user's role/class
        profileName.innerText = currentUser.Fname + " " + currentUser.Lname; // Display full name
        profileEmail.innerText = currentUser.email; // Display user email address
        profileRole.innerText = currentUser.role; // Display the role assigned to the user
    }

}


// Update the authentication state of the application (logged in user or admin)
function setAuthState(user) {
    currentUser = user;
    const body = document.body;
    body.classList.remove('not-authenticated', 'authenticated', 'is-admin');


    // if user log in
    if (currentUser) {
        // Add class indicating that the user is authenticated
        body.classList.add('authenticated');
        renderProfile(); // Display the logged-in user's profile information
        
        // If the logged-in user has an admin role, apply admin styling/access
        if (currentUser.role === 'admin') {
            body.classList.add('is-admin')
        }
    } else { 
        // If no user is logged in, mark the page as not authenticated
        body.classList.add('not-authenticated');
        localStorage.removeItem('auth_token'); // Remove stored authentication token from localStorage
    }

    handleRouting(); // Update the visible page based on the current route
}













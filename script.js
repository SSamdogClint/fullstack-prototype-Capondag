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

function handleRouting() {
    const hash = window.location.hash || '#/';
    console.log("location:" + hash);

    // cant access other pages without login
    if ((login_hash.includes(hash) || admin_hash.includes(hash)) && !currentUser) {
        navigateTo('#/');
        return;
    }

    // cant acces admin pages if not admin role
    if (admin_hash.includes(hash) && currentUser.role !== 'admin') {
        navigateTo('#/userProfile');
        return;
    }


    // select pages
    const pages = document.querySelectorAll(".page");
    // select the alert class
    const verifyAlert = document.getElementById("verified-alert") // only show when email is verified

    // hide pages
    pages.forEach(page => page.classList.remove('active'));

    // switch between section id
    let sectionId;
    if (hash === '#/' || hash === '') {
        sectionId = "homePage";
    } else if (hash === '#/register') {
        sectionId = "registerPage";
    } else if (hash.includes('#/login')) {
        sectionId = 'loginPage';
    } else if (hash === '#/verify') {
        sectionId = 'verifyPage';
    } else if (hash === '#/userProfile') {
        sectionId = 'profilePage';
    } else if (hash === '#/employees') {
        sectionId = 'employeesPage';
        renderEmployees();
        populateDeptDropdown();
    } else if (hash === '#/departments') {
        sectionId = 'departments';
        renderDepartments();
    } else if (hash === '#/accounts') {
        sectionId = 'accounts';
        renderAccounts();
    } else if (hash === '#/request') {
        sectionId = 'requests';
        renderRequests();
    }

    // show only when done with email verification
    // check if the hash includes a query string before displaying the alert
    if (verifyAlert) {
        if (hash.includes('verified=true')) {
            verifyAlert.style.display = 'block';
        } else {
            verifyAlert.style.display = 'none';
        }
    }

    // show page
    const activePage = document.getElementById(sectionId);
    if (activePage) {
        activePage.classList.add('active'); // add active to the class
    }
}
// to stop being loged out incase of refresh
window.addEventListener('load', () => {
    const token = localStorage.getItem('auth_token');
    let found = null;

    if (token) {
        found = window.db.accounts.find(acc => acc.email === token);
    }

    if (!window.location.hash || window.location.hash === "#") {
        window.location.replace("#/");
    }

    setAuthState(found);
});
window.addEventListener('hashchange', handleRouting);

// Authentication
function registration(event) {
    event.preventDefault();
    // get input data
    const inputFname = document.getElementById('fname').value;
    const inputLname = document.getElementById('lname').value;
    const inputEmail = document.getElementById('email').value;
    const inputPassword = document.getElementById('password').value;
    const regForm = document.getElementById('regFrom');

    // check if email already exist in window.db.accounts
    const emailExist = window.db.accounts.some(acc => acc.email === inputEmail);
    // check if email already exists || password must be >= 6
    if (emailExist) {
        alert("Email already Exists!");
    } else if (inputPassword.length < 6) {
        alert("Password Must be 6 or more characters!");
    } else {
        // save new account 
        const newAccount = {
            Fname: inputFname,
            Lname: inputLname,
            email: inputEmail,
            password: inputPassword,
            verified: false,
            role: "user" // default
        };

        console.log("account pushed:" + inputEmail);
        window.db.accounts.push(newAccount);
        regForm.reset(); // reset form
        //save to local storage
        saveToStorage();
        localStorage.setItem('unverified_email', inputEmail);

        let userEmail = document.getElementById('email').value;
        document.getElementById('showEmail').innerText = inputEmail;
        navigateTo('#/verify');
    }
}

// adding account via admin account page 
function addAccount(event) {
    //event.preventDefault();
    const accFname = document.getElementById('accFname').value;
    const accLname = document.getElementById('accLname').value;
    const accEmail = document.getElementById('accEmail').value;
    const accPassword = document.getElementById('accPassword').value;
    const accRole = document.getElementById('accRole').value;
    const isVerified = document.getElementById('isVerified').checked;

    // check if email already exist in window.db.accounts
    const emailExist = window.db.accounts.some(acc => acc.email === accEmail);
    // check if email already exists || password must be >= 6
    if (emailExist) {
        alert("Email already Exists!");
    } else if (accPassword.length < 6) {
        alert("Password Must be 6 or more characters!");
    } else {
        // save new account 
        const newAccount = {
            Fname: accFname,
            Lname: accLname,
            email: accEmail,
            password: accPassword,
            verified: isVerified,
            role: accRole // default
        };

        console.log("account pushed:" + accEmail);
        window.db.accounts.push(newAccount);

        //save to local storage
        if (!isVerified) {
            saveToStorage();
            localStorage.setItem('unverified_email', accEmail);
        } else {
            isVerified.verified = true;
            saveToStorage();
        }
        renderAccounts();
        const modalEl = document.getElementById('account-modal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        document.getElementById('accountForm').reset();
    }
}

// verify email
function verifyEmail() {
    const findEmail = localStorage.getItem('unverified_email');
    const user = window.db.accounts.find(acc => acc.email === findEmail);

    // set the email verified to true
    if (user) {
        user.verified = true;

        // save to local storage
        saveToStorage();
        localStorage.removeItem("unverified_email"); // remove the temp unvrified email
        console.log("Account verified:" + findEmail);

        navigateTo('#/login?verified=true');
    }
}

// toast message for succesful login
function showLoginToast() {
    const loginToast = document.getElementById('login-toast');
    const showToast = new bootstrap.Toast(loginToast, {
        autohide: true,
        delay: 1000
    });
    showToast.show();
    console.log("show toast");
}

// login account
function login(event) {
    event.preventDefault();
    // get user input
    const userEmail = document.getElementById('loginEmail').value;
    const userPassword = document.getElementById('loginPassword').value;
    const loginForm = document.getElementById('loginForm');

    // find email + password and verified in the storage and compare
    const findAccount = window.db.accounts.find(acc =>
        acc.email === userEmail &&
        acc.password === userPassword &&
        acc.verified === true
    );

    if (findAccount) {
        // Save auth_token = email in localStorage
        localStorage.setItem('auth_token', findAccount.email);
        showLoginToast(); // show login toast
        // Call `setAuthState(account) = true ,user
        setAuthState(findAccount);
        loginForm.reset(); // reset form
        navigateTo('#/userProfile');
        console.log("Login successful");
    } else {
        alert("Invalid Email and password!");
        loginForm.reset(); // reset form
    }
}

// logout function
function logout() {
    localStorage.removeItem('auth_token');
    setAuthState(null);
    navigateTo('#/');
}

// edit profile
function editProfile() {
    alert("changed to Edit profile page!");
}

// read department table
function renderDepartments() {
    const tableBody = document.getElementById('department-table-body');
    if (!tableBody) return;

    // Clear existing static rows
    tableBody.innerHTML = '';

    // Loop through window.db.departments
    window.db.departments.forEach((dept) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${dept.name}</td>
            <td>${dept.description || 'No description available'}</td>
            <td>
                <button type="button" class="btn btn-sm btn-primary" onclick="editDepartment(${dept.id})">Edit</button>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// render accounts
function renderAccounts() {
    const tableBody = document.getElementById('account-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    window.db.accounts.forEach((acc, index) => {
        const isSelf = currentUser && acc.email === currentUser.email;
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${acc.Fname} ${acc.Lname}<br><small class="text-muted">${acc.email}</small></td>
            <td><span class="badge bg-secondary">${acc.role}</span></td>
            <td>${acc.verified ? '<span class="text-success">&#9989;</span>' : '<span class="text-danger">&#x2715;</span>'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" data-bs-toggle="modal"
                        data-bs-target="#account-modal")" onclick="openEditAccount('${acc.email}')">Edit</button>
                    <button class="btn btn-outline-warning" onclick="resetPassword('${acc.email}')">Reset Password</button>
                    <button class="btn btn-outline-danger" ${isSelf ? 'disabled' : ''} onclick="deleteAccount('${acc.email}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// edit & and populate account
let editingEmail = null;

window.openEditAccount = function (email) {
    const acc = window.db.accounts.find(a => a.email === email);
    if (!acc) return;

    editingEmail = email; // Mark as editing

    // Fill inputs using IDs from your HTML
    document.getElementById('accFname').value = acc.Fname;
    document.getElementById('accLname').value = acc.Lname;
    document.getElementById('accEmail').value = acc.email;
    document.getElementById('accEmail').readOnly = true; // Email is the unique key
    document.getElementById('accPassword').value = acc.password;
    document.getElementById('accRole').value = acc.role;
    document.getElementById('isVerified').checked = !!acc.verified;

    // Change Modal UI
    document.querySelector('#account-modal .modal-title').innerText = "Edit Account";

    // Show Modal manually (stop hanging)
    const modalEl = document.getElementById('account-modal');
    const modalInst = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInst.show();
};

// password reset(account)
window.resetPassword = function (email) {
    // Ask for the new password
    const newPw = prompt(`Enter new password for ${email} (Minimum 6 characters):`);

    // If user clicks "Cancel", newPw will be null
    if (newPw === null) return;

    // Validation
    if (newPw.trim().length < 6) {
        alert("Error: Password is too short! It must be at least 6 characters.");
    } else {
        // 4. Find account and update
        const acc = window.db.accounts.find(a => a.email === email);
        if (acc) {
            acc.password = newPw;
            saveToStorage(); // Sync with localStorage
            alert("Password updated successfully!");
        }
    }
};

// delete account (account)
window.deleteAccount = function (email) {
    // 1. Prevent self-deletion (Double Check)
    if (currentUser && email === currentUser.email) {
        alert("You cannot delete your own account while logged in.");
        return;
    }

    // Confirm action
    const confirmed = confirm(`Are you sure you want to permanently delete the account: ${email}?`);

    if (confirmed) {
        //  Filter out the account
        window.db.accounts = window.db.accounts.filter(acc => acc.email !== email);

        //  Save and Update
        saveToStorage();
        renderAccounts();
        alert("Account deleted.");
    }
};

// render employees
function renderEmployees() {
    const tableBody = document.getElementById('employee-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    window.db.employees.forEach(emp => {
        // Join data from accounts and departments
        const account = window.db.accounts.find(a => a.email === emp.userEmail);
        const dept = window.db.departments.find(d => d.id == emp.deptId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.employeeId}</td>
            <td>
                <b>${account ? account.Fname + ' ' + account.Lname : 'Unknown'}</b><br>
                <small class="text-muted">${emp.userEmail}</small>
            </td>
            <td>${emp.position}</td>
            <td>${dept ? dept.name : 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${emp.employeeId}')">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// populate Department dropwdown
function populateDeptDropdown() {
    const deptSelect = document.getElementById('employeeDepartment');
    if (!deptSelect) return;
    // loop through the departments db to get departments
    window.db.departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.name;
        deptSelect.appendChild(opt);
    });
}








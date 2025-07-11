# tracko-mern-stack
Tracko - MERN stack project with user/admin roles, to track the output of employee on the bahlf of daily basis.

# How to start project

1. Open Tracko-mern-stack repository in terminal.
2. To run the server use following commands : 
    A. cd server 
    B. npm run start || npm run dev
    <!-- optional to run the build -->
    C. npm run build 
3. To run the client use these follwing commands: 
    A. cd client
    B. npm run dev 
    <!-- optional to run the build -->
    C. npm run build 

# Tracko Documentation

Admin:
1. Authentication
Login – Secure admin login with credentials.
Google Login – OAuth-based login using Google.
Forgot Password – Reset password via email.
Logout – Secure logout from admin session.

2. Admin Profile Management
View Profile – Display admin information.
Edit Profile – Update personal/admin details.
Change Password – Change current password securely.

3. Dashboard
User Statistics – Graphical representation of registered users and activity.
Counts & Summaries – Total users, sheets submitted, teams created, etc.
List Management – Quick view lists for employees, teams, and sheets.

4. CMS Management
Manage dynamic content shown on the website:
Privacy Policy
Terms and Conditions
About Us
Contact Us
FAQs

5. Timing Sheets Management
View Submitted Sheets – List of all timing sheets.
Approve/Reject Sheets – Admin can verify and take action on sheets.

6. Employee Management
Employee List – View and manage all employee accounts.
Timing Sheet Access – View associated sheets of each employee.
Team Management (CRUD) – Create, update, or delete teams.
Teams are assigned to employees and selected during sheet submission.

Website:
1. Authentication
Login / Logout – Standard email/password login and logout.
Google Login – Login using Google account.
Forgot Password – Recover access via email link.

2. User Profile
View Profile – Access basic user information.
Edit Profile – Update profile details.
Change Password – Option to change login password.

3. Welcome Page
User Dashboard – Initial screen after login showing basic instructions or stats.

4. Add Timing Sheets
Sheet Submission Form:
Team Selection – Dropdown of teams (fetched from Admin-defined list).
Task Description
Project Name
Time Spent
Leave Toggle:
If enabled, form is disabled.
Required to select:
Leave Type (e.g., Sick Leave, Paid Leave, etc.)
Leave Reason

5. View Sheets
List View – Display all submitted sheets.
Filter Options:
Daily View
Weekly View

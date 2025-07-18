# FeedbackFlow: Full Stack Feedback Platform

FeedbackFlow is a modern, full-stack web application designed to simplify the process of collecting and analyzing user feedback. Built with the MERN stack and a top-notch, animated user interface, this platform allows businesses (Admins) to create custom forms, share them with customers, and visualize the responses in a clean, intuitive dashboard.

---

## **Key Features**

* **Admin Authentication:** Secure JWT-based registration and login for business users.
* **Dynamic Form Builder:** 
    * Create forms with a custom title.
    * Add multiple, re-orderable questions.
    * **Multiple Question Types:** Supports Text, Paragraph, Multiple Choice, Checkboxes, Dropdown, and 1-5 Star Rating scales.
    * **Required Questions:** Mark any question as mandatory for submission.
* **Form Management:**
    * Edit & Delete: Edit forms that have no responses, and delete forms at any time.
    * Open/Closed Status: Easily toggle a form's status to accept or block new submissions.
    * Shareable Links: Instantly copy a unique, public URL for each form.
* **Public Form Submission:**
    * Clean, user-friendly, and responsive public page for customers to submit feedback.
    * No login required for customers.
    * Smart validation for required fields.
* Advanced Responses Dashboard:
    * **Tabular View:** See all raw responses in a clear, sortable table.
    * **Summary View:** Automatically generated bar charts and visualizations for multiple-choice questions.
    * **CSV Export:** Download all form responses as a CSV file with a single click.
* **Top-Notch UI/UX:**
    * Custom, modern theme with a professional color palette.
    * Smooth page and component animations using Framer Motion.
    * Engaging skeleton loaders, empty states, and user feedback with toast notifications.
    
## Tech Stack

* **Frontend:** React, Material-UI (MUI), Framer Motion, Recharts, React Hot Toast, Axios, React Router
* **Backend:** Node.js, Express.js, Mongoose
* **Database:** MongoDB (with MongoDB Atlas)
* **Auth:** JSON Web Tokens (JWT), bcrypt.js

## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
* Node.js (v18 or later recommended)
* npm or yarn
* MongoDB (either a local instance or a free cluster from MongoDB Atlas)

### Installation & Setup

1. Clone the repository:
```
git clone https://github.com/your-username/feedback-platform.git
cd feedback-platform
```

2. Setup the Backend (server):
```
cd server
npm install
```
* Create a .env file in the server directory and add the following environment variables:
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_super_secret_jwt_key>
PORT=5001
```

3. Setup the Frontend (client):
```
cd ../client
npm install
```

### Running the Application

1. Start the Backend Server:

* From the server directory, run:
``` 
npm run dev
```
The backend API will be running on http://localhost:5001.

2. Start the Frontend Development Server:
* From the client directory, run:
```
npm start
```
The React application will open in your browser at http://localhost:3000.

## API Endpoints

All private routes require a Bearer <token> in the Authorization header.

1. **POST- /api/auth/register : (Public)** Register a new admin.

2. **POST- /api/auth/login : (Public)** Login an admin and get a JWT.

3. **GET- /api/auth/me : (Private)** Get the logged-in admin's data.

4. **POST- /api/forms : (Private)** Create a new form.

5. **GET- /api/forms : (Private)** Get all forms for the logged-in admin.

6. **GET- /api/forms/:id : (Private)** Get a single form by ID.

7. **PUT- /api/forms/:id : (Private)** Update a form (content or status).

8. **DELETE- /api/forms/:id : (Private)** Delete a form.

9. **GET- /api/forms/public/:url : (Public)** Get a form's data for public viewing.

10. **POST- /api/responses/:formId : (Public)** Submit a response to a form.

11. **GET- /api/responses/:formId : (Private)** Get all responses for a form.

10. **GET- /api/responses/:formId/export : (Private)** Export form responses to CSV.



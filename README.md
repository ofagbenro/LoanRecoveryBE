 Loan Management System - Complete Deployment Guide
📋 Overview
This guide will help you deploy a full-stack loan management system with:

Frontend: React app hosted on Netlify (free)
Backend: Node.js/Express API hosted on Render (free)
Database: MongoDB Atlas (free tier)


┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐    MongoDB     ┌─────────────────┐
│                 │ ───────────────►  │                 │ ────────────► │                 │
│  React Frontend │                   │ Node.js Backend │               │ MongoDB Atlas   │
│   (Netlify)     │ ◄─────────────────│   (Render)      │ ◄──────────── │   (Cloud DB)    │
└─────────────────┘     API Calls     └─────────────────┘    Queries     └─────────────────┘

Project Structure
loan-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Loan.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── loans.js
│   │   └── dashboard.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── .env
│   └── package.json
└── README.md


# LoanRecoveryBE
Step 1: Setup MongoDB Atlas
1.1 Create MongoDB Atlas Account

Go to MongoDB Atlas
Sign up for a free account
Create a new project called "Loan Management"

1.2 Create Database Cluster

Click "Build a Database"
Choose "M0 Sandbox" (Free tier)
Select your preferred cloud provider and region
Name your cluster loan-management-cluster

1.3 Configure Database Access

Go to "Database Access" in the left sidebar
Click "Add New Database User"
Create a user with username and password (save these!)
Set permissions to "Read and write to any database"

1.4 Configure Network Access

Go to "Network Access" in the left sidebar
Click "Add IP Address"
Choose "Allow access from anywhere" (0.0.0.0/0)
Click "Confirm"

1.5 Get Connection String

Go to "Database" in the left sidebar
Click "Connect" on your cluster
Choose "Connect your application"
Copy the connection string
Replace <password> with your database user password

🛠️ Step 2: Setup Backend on Render
2.1 Prepare Backend Code

Create a new folder backend/
Copy the backend code from the artifacts above
Create package.json with the dependencies shown in the config

2.2 Create Environment Variables File
Create .env file in backend folder:
envNODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/loan_management
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app-name.netlify.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
2.3 Deploy to Render

Push your backend code to GitHub
Go to Render and sign up
Click "New +" → "Web Service"
Connect your GitHub repository
Configure the service:

Name: loan-management-api
Environment: Node
Build Command: npm install
Start Command: npm start



2.4 Add Environment Variables in Render
In your Render dashboard:

Go to your service → "Environment"
Add all the environment variables from your .env file
Generate a strong JWT_SECRET (32+ characters)

2.5 Deploy and Test

Click "Deploy Latest Commit"
Wait for deployment to complete
Test API endpoint: https://your-app-name.onrender.com/api/health
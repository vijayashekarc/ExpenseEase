# Expenseease

A web application for managing personal expenses with Google authentication and Supabase integration.

## Features

- Google Authentication
- Add and manage expenses
- Real-time expense tracking
- On-screen calculator
- Edit existing expenses
- Responsive design

## Setup Instructions

1. Clone the repository
2. Set up Supabase project and add your credentials in `config.js`
3. Enable Google Authentication in your Supabase project
4. Open `index.html` in your browser

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Supabase
- Google Authentication

## Project Structure

```
expenseease/
├── index.html          # Login page
├── home.html          # Home page with dashboard
├── add-expense.html   # Add new expense page
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── auth.js        # Authentication logic
│   ├── expenses.js    # Expense management
│   ├── calculator.js  # Calculator functionality
│   └── config.js      # Configuration and API keys
└── README.md
``` 
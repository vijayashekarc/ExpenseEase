// Load expenses
async function loadExpenses() {
    try {
        const response = await fetch(`${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.GET_ALL}`);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        
        const expenses = await response.json();
        
        // Update expense list
        const expensesList = document.getElementById('expensesList');
        if (expensesList) {
            expensesList.innerHTML = expenses.map(expense => `
                <div class="expense-item" data-id="${expense.id}">
                    <div class="expense-details">
                        <h3>${expense.expense_name}</h3>
                        <p>Amount: ₹${expense.amount}</p>
                        <p>Job Role: ${expense.job_role}</p>
                        <p>Payment Method: ${expense.payment_method}</p>
                    </div>
                    <div class="expense-actions">
                        <button onclick="editExpense('${expense.id}')" class="secondary-btn">Edit</button>
                        <button onclick="deleteExpense('${expense.id}')" class="error-btn">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        
        // Update summary statistics
        updateExpenseSummary(expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        alert('Error loading expenses. Please try again.');
    }
}

// Update expense summary
function updateExpenseSummary(expenses) {
    // Update total count
    const totalCountElement = document.getElementById('totalExpenseCount');
    if (totalCountElement) {
        totalCountElement.textContent = expenses.length;
    }
    
    // Update total amount
    const totalAmountElement = document.getElementById('totalExpenseAmount');
    if (totalAmountElement) {
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
    }
}

// Add new expense
document.getElementById('expenseForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData(e.target);
        const expense = {
            expense_name: formData.get('expenseName'),
            amount: parseFloat(formData.get('amount')),
            job_role: formData.get('jobRole'),
            payment_method: formData.get('paymentMethod')
        };

        const response = await fetch(`${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.CREATE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) throw new Error('Failed to add expense');
        
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Error adding expense. Please try again.');
    }
});

// Edit expense
async function editExpense(id) {
    try {
        const response = await fetch(`${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.GET_ALL}`);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        
        const expenses = await response.json();
        const expense = expenses.find(exp => exp.id === id);
        
        if (!expense) throw new Error('Expense not found');

        // Populate form with expense data
        document.getElementById('expenseName').value = expense.expense_name;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('jobRole').value = expense.job_role;
        document.getElementById('paymentMethod').value = expense.payment_method;

        // Change form submit handler for update
        const form = document.getElementById('expenseForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData(form);
                const updatedExpense = {
                    expense_name: formData.get('expenseName'),
                    amount: parseFloat(formData.get('amount')),
                    job_role: formData.get('jobRole'),
                    payment_method: formData.get('paymentMethod')
                };
                
                const updateResponse = await fetch(
                    `${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.UPDATE(id)}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedExpense)
                    }
                );

                if (!updateResponse.ok) throw new Error('Failed to update expense');
                
                window.location.href = 'home.html';
            } catch (error) {
                console.error('Error updating expense:', error);
                alert('Error updating expense. Please try again.');
            }
        };
    } catch (error) {
        console.error('Error loading expense:', error);
        alert('Error loading expense. Please try again.');
    }
}

// Delete expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        const response = await fetch(
            `${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.DELETE(id)}`,
            {
                method: 'DELETE'
            }
        );

        if (!response.ok) throw new Error('Failed to delete expense');
        
        loadExpenses();
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
    }
}

// Add expense button handler
document.getElementById('addExpenseBtn')?.addEventListener('click', () => {
    window.location.href = 'add-expense.html';
});

// Load expenses when on home page
if (window.location.pathname.includes('home.html')) {
    loadExpenses();
} 
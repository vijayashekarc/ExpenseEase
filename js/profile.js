// Load user profile data
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch user information
        const userResponse = await fetch('/api/user-info', {
            credentials: 'include'
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user information');
        }
        
        const userData = await userResponse.json();
        
        // Update profile information
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userEmail').textContent = userData.email;
        
        if (userData.avatar_url) {
            document.getElementById('userAvatar').src = userData.avatar_url;
        } else {
            // Set a default avatar if none is provided
            document.getElementById('userAvatar').src = 'https://via.placeholder.com/150';
        }
        
        // Format account creation date
        if (userData.created_at) {
            const createdDate = new Date(userData.created_at);
            document.getElementById('accountCreated').textContent = createdDate.toLocaleDateString();
        } else {
            document.getElementById('accountCreated').textContent = 'N/A';
        }
        
        // Fetch user's expenses for statistics
        const expensesResponse = await fetch(`${ExpenseeaseConfig.API_BASE_URL}${ExpenseeaseConfig.EXPENSE_ENDPOINTS.GET_ALL}`, {
            credentials: 'include'
        });
        
        if (expensesResponse.ok) {
            const expenses = await expensesResponse.json();
            
            // Update statistics
            document.getElementById('totalExpenses').textContent = expenses.length;
            
            const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            document.getElementById('totalAmount').textContent = `₹${totalAmount.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile information. Please try again.');
    }
}); 
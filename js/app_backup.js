// Personal Finance App - Complete Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
        return;
    }

    // Set current user
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.querySelector('.logout-button').textContent = user.email;

    // Initialize month selector
    const monthSelect = document.getElementById('monthSelect');
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    monthSelect.value = currentMonth;

    // Set up event listeners
    monthSelect.addEventListener('change', loadMonthData);
    document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
    document.getElementById('searchBtn').addEventListener('click', searchTransactions);
    document.querySelector('.logout-button').addEventListener('click', function() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });

    // Load initial data
    loadMonthData();
});

// [Rest of the implementation functions...]

function checkBudgetWarning(monthData) {
    const warningContainer = document.getElementById('budgetWarning');
    warningContainer.innerHTML = '';
    
    if (monthData.remaining < 0) {
        warningContainer.innerHTML = `<p>⚠️ Cảnh báo: Bạn đã vượt quá ngân sách tháng này!</p>`;
    }
    
    // Check category warnings
    for (const [name, data] of Object.entries(monthData.categories)) {
        if (data.spent > data.limit) {
            const warning = document.createElement('p');
            warning.textContent = `⚠️ Danh mục ${name} đã vượt giới hạn!`;
            warningContainer.appendChild(warning);
        }
    }
}
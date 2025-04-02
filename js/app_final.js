// Finance App Core - Initial Setup
document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.querySelector('.logout-button').textContent = currentUser.email;
    
    // Set current month
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthSelect').value = currentMonth;

    // Basic event listeners
    document.getElementById('monthSelect').addEventListener('change', loadMonthData);
    document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
    document.querySelector('.logout-button').addEventListener('click', logout);

    // Load initial data
    loadMonthData();
});

function loadMonthData() {
    const month = document.getElementById('monthSelect').value;
    const financeData = getFinanceData();
    
    if (!financeData[month]) {
        financeData[month] = {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };
        saveFinanceData(financeData);
    }

    const monthData = financeData[month];
    
    // Update UI
    document.getElementById('budgetInput').value = monthData.budget;
    document.getElementById('remainingAmount').textContent = formatCurrency(monthData.remaining);
    checkBudgetWarning(monthData);
}

function saveBudget() {
    const month = document.getElementById('monthSelect').value;
    const budget = parseFloat(document.getElementById('budgetInput').value);
    
    if (isNaN(budget) || budget <= 0) {
        alert('Vui lòng nhập ngân sách hợp lệ');
        return;
    }

    const financeData = getFinanceData();
    financeData[month].budget = budget;
    financeData[month].remaining = budget;
    saveFinanceData(financeData);
    
    loadMonthData();
}

// Helper functions
function getFinanceData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allData = JSON.parse(localStorage.getItem('financeData')) || {};
    return allData[currentUser.email] || {};
}

function saveFinanceData(data) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allData = JSON.parse(localStorage.getItem('financeData')) || {};
    allData[currentUser.email] = data;
    localStorage.setItem('financeData', JSON.stringify(allData));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function checkBudgetWarning(monthData) {
    const warningContainer = document.getElementById('budgetWarning');
    warningContainer.innerHTML = '';
    
    if (monthData.budget === 0) {
        warningContainer.innerHTML = '<p>⚠️ Cảnh báo: Bạn chưa nhập ngân sách tháng này!</p>';
    }
}

function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}
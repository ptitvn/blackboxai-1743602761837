// Personal Finance App - Core Functionality
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

function loadMonthData() {
    const month = document.getElementById('monthSelect').value;
    const userData = getUserData();
    
    if (!userData.months[month]) {
        userData.months[month] = {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };
        saveUserData(userData);
    }

    const monthData = userData.months[month];
    
    // Update UI
    document.getElementById('budgetInput').value = monthData.budget;
    document.getElementById('remainingAmount').textContent = formatCurrency(monthData.remaining);
    
    renderCategories(monthData.categories);
    renderTransactions(monthData.transactions);
    checkBudgetWarning(monthData);
}

function saveBudget() {
    const month = document.getElementById('monthSelect').value;
    const budget = parseFloat(document.getElementById('budgetInput').value);
    
    if (isNaN(budget) || budget <= 0) {
        alert('Vui lòng nhập ngân sách hợp lệ');
        return;
    }

    const userData = getUserData();
    userData.months[month].budget = budget;
    userData.months[month].remaining = budget - calculateTotalSpent(userData.months[month]);
    saveUserData(userData);
    
    loadMonthData();
}

function addCategory() {
    const name = document.getElementById('categoryName').value.trim();
    const limit = parseFloat(document.getElementById('categoryLimit').value);
    const month = document.getElementById('monthSelect').value;

    if (!name || isNaN(limit) || limit <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin danh mục');
        return;
    }

    const userData = getUserData();
    userData.months[month].categories[name] = {
        limit: limit,
        spent: 0
    };
    saveUserData(userData);
    
    // Clear inputs
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryLimit').value = '';
    
    loadMonthData();
}

function addExpense() {
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const note = document.getElementById('expenseNote').value.trim();
    const month = document.getElementById('monthSelect').value;
    
    if (isNaN(amount) || amount <= 0 || !note) {
        alert('Vui lòng nhập đầy đủ thông tin giao dịch');
        return;
    }

    const userData = getUserData();
    const monthData = userData.months[month];
    
    // Add transaction
    const transaction = {
        id: Date.now(),
        amount: -amount,
        note: note,
        date: new Date().toISOString()
    };
    monthData.transactions.push(transaction);
    
    // Update remaining budget
    monthData.remaining -= amount;
    
    saveUserData(userData);
    
    // Clear inputs
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNote').value = '';
    
    loadMonthData();
}

// Helper functions
function getUserData() {
    const email = JSON.parse(localStorage.getItem('currentUser')).email;
    const allData = JSON.parse(localStorage.getItem('financeData')) || {};
    return allData[email] || { months: {} };
}

function saveUserData(userData) {
    const email = JSON.parse(localStorage.getItem('currentUser')).email;
    const allData = JSON.parse(localStorage.getItem('financeData')) || {};
    allData[email] = userData;
    localStorage.setItem('financeData', JSON.stringify(allData));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function calculateTotalSpent(monthData) {
    return monthData.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function renderMonthlyStats(months) {
    const container = document.getElementById('monthlyStats');
    container.innerHTML = '';
    
    // Sort months in descending order
    const sortedMonths = Object.keys(months).sort().reverse();
    
    for (const month of sortedMonths) {
        const data = months[month];
        const totalSpent = calculateTotalSpent(data);
        const status = totalSpent <= data.budget ? 'Đạt' : 'Vượt';
        
        const statElement = document.createElement('div');
        statElement.className = 'item';
        statElement.innerHTML = `
            <span>${month}</span>
            <span>${formatCurrency(totalSpent)}</span>
            <span>${formatCurrency(data.budget)}</span>
            <span class="${status === 'Đạt' ? 'success' : 'danger'}">${status}</span>
        `;
        container.appendChild(statElement);
    }
}

function checkBudgetWarning(monthData) {
    const warningContainer = document.getElementById('budgetWarning');
    warningContainer.innerHTML = '';
    
    if (monthData.remaining < 0) {
        warningContainer.innerHTML = `
            <p>⚠️ Cảnh báo: Bạn đã vượt quá ngân sách tháng này!</p>
        `;
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
        warningContainer.innerHTML = `
            <p>⚠️ Cảnh báo: Bạn đã vượt quá ngân sách tháng này!</p>
        `;
    }
}
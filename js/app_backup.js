// Main application logic for expense tracking
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
        return;
    }

    // Set current user email in account button
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.querySelector('.logout-button').textContent = user.email;

    // Initialize month selector with current month
    const monthSelect = document.getElementById('monthSelect');
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    monthSelect.value = currentMonth;

    // Load data for selected month
    monthSelect.addEventListener('change', loadMonthData);
    document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
    document.getElementById('searchBtn').addEventListener('click', searchTransactions);

    loadMonthData();
});

function loadMonthData() {
    const month = document.getElementById('monthSelect').value;
    const userData = getUserData();
    
    if (!userData.months[month]) {
        // Initialize new month
        userData.months[month] = {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };
        saveUserData(userData);
    }

    // Update UI
    document.getElementById('budgetInput').value = userData.months[month].budget;
    document.getElementById('remainingAmount').textContent = 
        formatCurrency(userData.months[month].remaining);
    
    renderCategories(userData.months[month].categories);
    renderTransactions(userData.months[month].transactions);
    renderMonthlyStats(userData.months);
    checkBudgetWarning(userData.months[month]);
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

function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    for (const [name, data] of Object.entries(categories)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'content2';
        categoryElement.innerHTML = `
            <span>${name}</span>
            <span>${formatCurrency(data.limit)}</span>
            <span>${formatCurrency(data.spent)}</span>
            <button class="delete-category" data-name="${name}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(categoryElement);
    }
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryName = this.dataset.name;
            deleteCategory(categoryName);
        });
    });
}

function deleteCategory(name) {
    const month = document.getElementById('monthSelect').value;
    const userData = getUserData();
    
    if (confirm(`Bạn có chắc muốn xóa danh mục ${name}?`)) {
        delete userData.months[month].categories[name];
        saveUserData(userData);
        loadMonthData();
    }
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
    monthData.transactions.push({
        amount: -amount, // Negative for expenses
        note: note,
        date: new Date().toISOString()
    });
    
    // Update remaining budget
    monthData.remaining -= amount;
    
    saveUserData(userData);
    
    // Clear inputs
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNote').value = '';
    
    loadMonthData();
}

function renderTransactions(transactions) {
    const container = document.getElementById('expensesHistory');
    container.innerHTML = '';
    
    transactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'content2';
        transactionElement.innerHTML = `
            <span>${new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
            <span>${transaction.note}</span>
            <span class="${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}">
                ${formatCurrency(transaction.amount)}
            </span>
            <button class="delete-transaction" data-id="${transaction.id}">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(transactionElement);
    });
}

function searchTransactions() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const month = document.getElementById('monthSelect').value;
    const userData = getUserData();
    
    const filtered = userData.months[month].transactions.filter(t => 
        t.note.toLowerCase().includes(searchTerm)
    );
    
    renderTransactions(filtered);
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

function calculateTotalSpent(monthData) {
    return monthData.transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function renderMonthlyStats(months) {
    const container = document.getElementById('monthlyStats');
    container.innerHTML = '';
    
    for (const [month, data] of Object.entries(months)) {
        const totalSpent = calculateTotalSpent(data);
        const status = totalSpent <= data.budget ? 'Đạt' : 'Không đạt';
        
        const statElement = document.createElement('div');
        statElement.className = 'item';
        statElement.innerHTML = `
            <span>${month}</span>
            <span>${formatCurrency(totalSpent)}</span>
            <span>${formatCurrency(data.budget)}</span>
            <span>${status}</span>
        `;
        container.appendChild(statElement);
    }
}

function getUserData() {
    const email = JSON.parse(localStorage.getItem('currentUser')).email;
    const allData = JSON.parse(localStorage.getItem('expenseData')) || {};
    return allData[email] || { months: {} };
}

function saveUserData(data) {
    const email = JSON.parse(localStorage.getItem('currentUser')).email;
    const allData = JSON.parse(localStorage.getItem('expenseData')) || {};
    allData[email] = data;
    localStorage.setItem('expenseData', JSON.stringify(allData));
}

function showMonthSelection() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Chọn tháng chi tiêu</h2>
            <div class="mb-4">
                <label for="month-select" class="block text-gray-700 mb-2">Tháng/Năm</label>
                <input type="month" id="month-select" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="budget" class="block text-gray-700 mb-2">Ngân sách (VND)</label>
                <input type="number" id="budget" class="w-full px-3 py-2 border rounded-lg" min="0">
            </div>
            <button id="save-month" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Lưu tháng
            </button>
        </div>
    `;

    document.getElementById('save-month').addEventListener('click', saveMonth);
}

function saveMonth() {
    const month = document.getElementById('month-select').value;
    const budget = parseFloat(document.getElementById('budget').value);

    if (!month || isNaN(budget) || budget <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin và ngân sách hợp lệ');
        return;
    }

    const userData = getUserData();
    if (!userData.months[month]) {
        userData.months[month] = {
            budget: budget,
            remaining: budget,
            categories: {},
            transactions: []
        };
    }
    userData.currentMonth = month;
    saveUserData(userData);
    showMonthView(month);
}

function showMonthView(month) {
    const userData = getUserData();
    const monthData = userData.months[month];
    
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Budget Summary -->
            <div class="bg-white p-6 rounded-lg shadow-md col-span-1">
                <h2 class="text-xl font-semibold mb-4">Tổng quan tháng ${month}</h2>
                <div class="mb-4">
                    <p class="text-gray-600">Ngân sách:</p>
                    <p class="text-2xl font-bold">${formatCurrency(monthData.budget)}</p>
                </div>
                <div class="mb-4">
                    <p class="text-gray-600">Còn lại:</p>
                    <p class="text-2xl font-bold ${monthData.remaining < 0 ? 'text-red-500' : 'text-green-500'}">
                        ${formatCurrency(monthData.remaining)}
                    </p>
                </div>
                <button id="add-category" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
                    Thêm danh mục
                </button>
            </div>

            <!-- Categories List -->
            <div class="bg-white p-6 rounded-lg shadow-md col-span-1">
                <h2 class="text-xl font-semibold mb-4">Danh mục chi tiêu</h2>
                <div id="categories-list">
                    ${renderCategories(monthData.categories)}
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="bg-white p-6 rounded-lg shadow-md col-span-1">
                <h2 class="text-xl font-semibold mb-4">Giao dịch gần đây</h2>
                <button id="add-transaction" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4 w-full">
                    Thêm giao dịch
                </button>
                <div id="transactions-list">
                    ${renderRecentTransactions(monthData.transactions)}
                </div>
            </div>
        </div>
    `;

    // Add event listeners
    document.getElementById('add-category').addEventListener('click', showAddCategoryForm);
    document.getElementById('add-transaction').addEventListener('click', showAddTransactionForm);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function renderCategories(categories) {
    if (Object.keys(categories).length === 0) {
        return '<p class="text-gray-500">Chưa có danh mục nào</p>';
    }

    let html = '';
    for (const [name, data] of Object.entries(categories)) {
        html += `
            <div class="border-b py-3">
                <div class="flex justify-between items-center">
                    <span class="font-medium">${name}</span>
                    <span>${formatCurrency(data.budget)}</span>
                </div>
                <div class="flex justify-between mt-1">
                    <span class="text-sm text-gray-500">Đã chi: ${formatCurrency(data.spent || 0)}</span>
                    <div class="flex space-x-2">
                        <button class="text-blue-500 hover:text-blue-700 edit-category" data-name="${name}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700 delete-category" data-name="${name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    return html;
}

function showAddCategoryForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML += `
        <div id="category-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Thêm danh mục mới</h3>
                <div class="mb-4">
                    <label for="category-name" class="block text-gray-700 mb-2">Tên danh mục</label>
                    <input type="text" id="category-name" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div class="mb-4">
                    <label for="category-budget" class="block text-gray-700 mb-2">Ngân sách (VND)</label>
                    <input type="number" id="category-budget" class="w-full px-3 py-2 border rounded-lg" min="0">
                </div>
                <div class="flex justify-end space-x-2">
                    <button id="cancel-category" class="px-4 py-2 border rounded-lg">Hủy</button>
                    <button id="save-category" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('cancel-category').addEventListener('click', () => {
        document.getElementById('category-modal').remove();
    });

    document.getElementById('save-category').addEventListener('click', saveCategory);
}

function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const budget = parseFloat(document.getElementById('category-budget').value);

    if (!name || isNaN(budget) || budget <= 0) {
        alert('Vui lòng nhập đầy đủ thông tin danh mục');
        return;
    }

    const userData = getUserData();
    const month = userData.currentMonth;
    
    if (!userData.months[month].categories[name]) {
        userData.months[month].categories[name] = { budget: budget, spent: 0 };
        saveUserData(userData);
        showMonthView(month);
    } else {
        alert('Danh mục đã tồn tại');
    }
}

function renderRecentTransactions(transactions) {
    if (transactions.length === 0) {
        return '<p class="text-gray-500">Chưa có giao dịch nào</p>';
    }

    let html = '';
    transactions.slice(0, 5).forEach(transaction => {
        html += `
            <div class="border-b py-3">
                <div class="flex justify-between">
                    <span class="font-medium">${transaction.category}</span>
                    <span class="${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}">
                        ${formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                    <span>${transaction.description || 'Không có mô tả'}</span>
                    <span>${new Date(transaction.date).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        `;
    });
    return html;
}

function showAddTransactionForm() {
    const userData = getUserData();
    const month = userData.currentMonth;
    const categories = Object.keys(userData.months[month].categories);

    if (categories.length === 0) {
        alert('Vui lòng tạo danh mục trước khi thêm giao dịch');
        return;
    }

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML += `
        <div id="transaction-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Thêm giao dịch mới</h3>
                <div class="mb-4">
                    <label for="transaction-category" class="block text-gray-700 mb-2">Danh mục</label>
                    <select id="transaction-category" class="w-full px-3 py-2 border rounded-lg">
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="mb-4">
                    <label for="transaction-amount" class="block text-gray-700 mb-2">Số tiền (VND)</label>
                    <input type="number" id="transaction-amount" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div class="mb-4">
                    <label for="transaction-description" class="block text-gray-700 mb-2">Mô tả</label>
                    <input type="text" id="transaction-description" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div class="mb-4">
                    <label for="transaction-date" class="block text-gray-700 mb-2">Ngày</label>
                    <input type="date" id="transaction-date" class="w-full px-3 py-2 border rounded-lg" 
                           value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="flex justify-end space-x-2">
                    <button id="cancel-transaction" class="px-4 py-2 border rounded-lg">Hủy</button>
                    <button id="save-transaction" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('cancel-transaction').addEventListener('click', () => {
        document.getElementById('transaction-modal').remove();
    });

    document.getElementById('save-transaction').addEventListener('click', saveTransaction);
}

function saveTransaction() {
    const category = document.getElementById('transaction-category').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const description = document.getElementById('transaction-description').value.trim();
    const date = document.getElementById('transaction-date').value;

    if (isNaN(amount) || amount === 0) {
        alert('Vui lòng nhập số tiền hợp lệ');
        return;
    }

    const userData = getUserData();
    const month = userData.currentMonth;
    
    // Add transaction
    userData.months[month].transactions.push({
        category,
        amount,
        description,
        date
    });

    // Update category spent
    userData.months[month].categories[category].spent = 
        (userData.months[month].categories[category].spent || 0) + Math.abs(amount);

    // Update remaining budget
    userData.months[month].remaining -= Math.abs(amount);

    saveUserData(userData);
    showMonthView(month);
}

// Add event delegation for dynamic elements
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-category')) {
        const categoryName = e.target.dataset.name;
        if (confirm(`Bạn có chắc muốn xóa danh mục ${categoryName}?`)) {
            const userData = getUserData();
            const month = userData.currentMonth;
            delete userData.months[month].categories[categoryName];
            saveUserData(userData);
            showMonthView(month);
        }
    }
    
    if (e.target.classList.contains('edit-category')) {
        const categoryName = e.target.dataset.name;
        showEditCategoryForm(categoryName);
    }
});

function showEditCategoryForm(categoryName) {
    const userData = getUserData();
    const month = userData.currentMonth;
    const category = userData.months[month].categories[categoryName];

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML += `
        <div id="edit-category-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Sửa danh mục</h3>
                <div class="mb-4">
                    <label for="edit-category-name" class="block text-gray-700 mb-2">Tên danh mục</label>
                    <input type="text" id="edit-category-name" class="w-full px-3 py-2 border rounded-lg" 
                           value="${categoryName}">
                </div>
                <div class="mb-4">
                    <label for="edit-category-budget" class="block text-gray-700 mb-2">Ngân sách (VND)</label>
                    <input type="number" id="edit-category-budget" class="w-full px-3 py-2 border rounded-lg" 
                           min="0" value="${category.budget}">
                </div>
                <div class="flex justify-end space-x-2">
                    <button id="cancel-edit-category" class="px-4 py-2 border rounded-lg">Hủy</button>
                    <button id="save-edit-category" class="bg-blue-600 text-white px-4 py-2 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('cancel-edit-category').addEventListener('click', () => {
        document.getElementById('edit-category-modal').remove();
    });

    document.getElementById('save-edit-category').addEventListener('click', () => {
        const newName = document.getElementById('edit-category-name').value.trim();
        const newBudget = parseFloat(document.getElementById('edit-category-budget').value);

        if (!newName || isNaN(newBudget) || newBudget <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin danh mục');
            return;
        }

        const userData = getUserData();
        const month = userData.currentMonth;
        
        // If name changed, create new category and delete old one
        if (newName !== categoryName) {
            userData.months[month].categories[newName] = {
                budget: newBudget,
                spent: userData.months[month].categories[categoryName].spent
            };
            delete userData.months[month].categories[categoryName];
        } else {
            // Just update budget
            userData.months[month].categories[categoryName].budget = newBudget;
        }

        saveUserData(userData);
        showMonthView(month);
    });
}

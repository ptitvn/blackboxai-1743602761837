// Finance App - Core Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
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

    // Load finance data
    let financeData = JSON.parse(localStorage.getItem('financeData')) || {};
    if (!financeData[currentUser.email]) {
        financeData[currentUser.email] = {};
    }

    // Initialize month data if not exists
    if (!financeData[currentUser.email][currentMonth]) {
        financeData[currentUser.email][currentMonth] = {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };
        localStorage.setItem('financeData', JSON.stringify(financeData));
    }

    // Event listeners
    document.getElementById('monthSelect').addEventListener('change', loadMonthData);
    document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
    document.getElementById('searchBtn').addEventListener('click', searchTransactions);
    document.querySelector('.logout-button').addEventListener('click', logout);

    // Load initial data
    loadMonthData();

    function loadMonthData() {
        const month = document.getElementById('monthSelect').value;
        const monthData = financeData[currentUser.email][month] || {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };

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

        financeData[currentUser.email][month].budget = budget;
        financeData[currentUser.email][month].remaining = budget;
        localStorage.setItem('financeData', JSON.stringify(financeData));
        
        loadMonthData();
    }

    function checkBudgetWarning(monthData) {
        const warningContainer = document.getElementById('budgetWarning');
        warningContainer.innerHTML = '';
        
        if (monthData.budget === 0) {
            warningContainer.innerHTML = '<p>⚠️ Cảnh báo: Bạn chưa nhập ngân sách tháng này!</p>';
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    }

    function renderCategories(categories) {
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';
        
        // Update category dropdown
        const categorySelect = document.querySelector('.container5 select');
        categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
        
        for (const [name, data] of Object.entries(categories)) {
            // Add to dropdown
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
            
            // Add to categories list
            const categoryElement = document.createElement('div');
            categoryElement.className = 'content2';
            categoryElement.innerHTML = `
                <span>${name}</span>
                <span>${formatCurrency(data.limit)}</span>
                <span>${formatCurrency(data.spent)}</span>
                <button class="delete-category" data-name="${name}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(categoryElement);
        }
        
        // Add delete event listeners
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryName = this.dataset.name;
                deleteCategory(categoryName);
            });
        });
    }

    function deleteCategory(name) {
        const month = document.getElementById('monthSelect').value;
        
        if (confirm(`Bạn có chắc muốn xóa danh mục ${name}?`)) {
            delete financeData[currentUser.email][month].categories[name];
            localStorage.setItem('financeData', JSON.stringify(financeData));
            loadMonthData();
        }
    }

    function addExpense() {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const note = document.getElementById('expenseNote').value.trim();
        const category = document.querySelector('.container5 select').value;
        const month = document.getElementById('monthSelect').value;
        
        if (isNaN(amount) || amount <= 0 || !note || !category) {
            alert('Vui lòng nhập đầy đủ thông tin giao dịch');
            return;
        }

        // Add transaction
        const transaction = {
            id: Date.now(),
            amount: -amount,
            note: note,
            category: category,
            date: new Date().toISOString()
        };
        financeData[currentUser.email][month].transactions.push(transaction);
        
        // Update category spent
        financeData[currentUser.email][month].categories[category].spent += amount;
        
        // Update remaining budget
        financeData[currentUser.email][month].remaining -= amount;
        
        localStorage.setItem('financeData', JSON.stringify(financeData));
        
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
                <span>${transaction.category}</span>
                <span>${transaction.note}</span>
                <span class="${transaction.amount < 0 ? 'expense' : 'income'}">
                    ${formatCurrency(transaction.amount)}
                </span>
                <button class="delete-transaction" data-id="${transaction.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(transactionElement);
        });
        
        // Add delete event listeners
        document.querySelectorAll('.delete-transaction').forEach(btn => {
            btn.addEventListener('click', function() {
                const transactionId = parseInt(this.dataset.id);
                deleteTransaction(transactionId);
            });
        });
    }

    function deleteTransaction(id) {
        const month = document.getElementById('monthSelect').value;
        const monthData = financeData[currentUser.email][month];
        
        const index = monthData.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            const transaction = monthData.transactions[index];
            
            // Update remaining budget
            monthData.remaining += Math.abs(transaction.amount);
            
            // Update category spent
            monthData.categories[transaction.category].spent -= Math.abs(transaction.amount);
            
            // Remove transaction
            monthData.transactions.splice(index, 1);
            
            localStorage.setItem('financeData', JSON.stringify(financeData));
            loadMonthData();
        }
    }

    function searchTransactions() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const month = document.getElementById('monthSelect').value;
        const transactions = financeData[currentUser.email][month].transactions;
        
        const filtered = transactions.filter(t => 
            t.note.toLowerCase().includes(searchTerm) || 
            t.category.toLowerCase().includes(searchTerm)
        );
        
        renderTransactions(filtered);
    }

    function logout() {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    }
});
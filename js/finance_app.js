// Finance App - Complete Implementation
class FinanceApp {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadMonthData();
    }

    checkAuth() {
        if (!localStorage.getItem('currentUser')) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        document.querySelector('.logout-button').textContent = this.currentUser.email;
    }

    setupEventListeners() {
        // Month selection
        document.getElementById('monthSelect').addEventListener('change', () => this.loadMonthData());
        
        // Budget management
        document.getElementById('saveBudgetBtn').addEventListener('click', () => this.saveBudget());
        
        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory());
        
        // Transaction management
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.addExpense());
        document.getElementById('searchBtn').addEventListener('click', () => this.searchTransactions());
        
        // Logout
        document.querySelector('.logout-button').addEventListener('click', () => this.logout());
    }

    loadMonthData() {
        const month = document.getElementById('monthSelect').value;
        this.currentMonth = month;
        
        if (!this.financeData[month]) {
            this.financeData[month] = this.createNewMonthData();
            this.saveData();
        }

        this.updateUI();
    }

    createNewMonthData() {
        return {
            budget: 0,
            remaining: 0,
            categories: {},
            transactions: []
        };
    }

    updateUI() {
        const monthData = this.financeData[this.currentMonth];
        
        // Budget info
        document.getElementById('budgetInput').value = monthData.budget;
        document.getElementById('remainingAmount').textContent = this.formatCurrency(monthData.remaining);
        
        // Categories
        this.renderCategories();
        
        // Transactions
        this.renderTransactions();
        
        // Warnings
        this.checkBudgetWarning();
    }

    // [Additional methods will be implemented in subsequent steps]
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinanceApp();
});
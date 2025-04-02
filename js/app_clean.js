// Personal Finance App - Clean Implementation
document.addEventListener('DOMContentLoaded', function() {
    // [Previous implementation remains the same until checkBudgetWarning]
});

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
class Calculator  {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    initializeElements() {
        // Input elements
        this.number1Input = document.getElementById('number1');
        this.number2Input = document.getElementById('number2');
        
        // Operation buttons
        this.operationButtons = document.querySelectorAll('.operation-btn');
        
        // Display elements
        this.resultDisplay = document.getElementById('result');
        this.historyList = document.getElementById('history');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // History storage
        this.history = [];
        this.maxHistoryItems = 10;
    }

    bindEvents() {
        // Bind operation buttons
        this.operationButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const operation = e.currentTarget.dataset.operation;
                this.performOperation(operation);
            });
        });

        // Bind clear history button
        this.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });

        // Bind input events for real-time validation
        [this.number1Input, this.number2Input].forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performOperation('sum'); // Default to sum on Enter
                }
            });
        });

        // Bind keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.performOperation('sum');
                        break;
                    case '2':
                        e.preventDefault();
                        this.performOperation('subtract');
                        break;
                    case '3':
                        e.preventDefault();
                        this.performOperation('multiply');
                        break;
                    case '4':
                        e.preventDefault();
                        this.performOperation('divide');
                        break;
                    case 'l':
                    case 'L':
                        e.preventDefault();
                        this.clearHistory();
                        break;
                }
            }
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        
        // Allow empty input, negative numbers, and decimals
        if (value === '' || value === '-') {
            input.classList.remove('error');
            return true;
        }
        
        // Check if it's a valid number (including negative and decimal)
        const isValid = /^-?\d*\.?\d*$/.test(value) && !isNaN(parseFloat(value));
        
        if (isValid) {
            input.classList.remove('error');
            return true;
        } else {
            input.classList.add('error');
            return false;
        }
    }

    getNumbers() {
        const num1 = this.number1Input.value.trim();
        const num2 = this.number2Input.value.trim();

        // Validate both inputs
        if (!this.validateInput(this.number1Input) || !this.validateInput(this.number2Input)) {
            this.showError('Пожалуйста, введите корректные числа');
            return null;
        }

        // Check if inputs are not empty
        if (num1 === '' || num2 === '') {
            this.showError('Пожалуйста, заполните оба поля');
            return null;
        }

        // Parse numbers
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);

        if (isNaN(number1) || isNaN(number2)) {
            this.showError('Введены некорректные числа');
            return null;
        }

        return { number1, number2 };
    }

    performOperation(operation) {
        const numbers = this.getNumbers();
        if (!numbers) return;

        const { number1, number2 } = numbers;
        let result;
        let expression;

        try {
            switch(operation) {
                case 'sum':
                    result = this.add(number1, number2);
                    expression = `${number1} + ${number2}`;
                    break;
                case 'subtract':
                    result = this.subtract(number1, number2);
                    expression = `${number1} - ${number2}`;
                    break;
                case 'multiply':
                    result = this.multiply(number1, number2);
                    expression = `${number1} × ${number2}`;
                    break;
                case 'divide':
                    result = this.divide(number1, number2);
                    expression = `${number1} ÷ ${number2}`;
                    break;
                default:
                    throw new Error('Неизвестная операция');
            }

            this.showResult(result, expression);
            this.addToHistory(expression, result);
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Mathematical operations
    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }

    multiply(a, b) {
        return a * b;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Деление на ноль невозможно');
        }
        return a / b;
    }

    showResult(result, expression) {
        // Format result to avoid floating point precision issues
        const formattedResult = this.formatNumber(result);
        
        this.resultDisplay.innerHTML = `
            <div class="result-value">${formattedResult}</div>
            <div class="result-expression">${expression} = ${formattedResult}</div>
        `;
        this.resultDisplay.className = 'result-display success pulse';
    }

    showError(message) {
        this.resultDisplay.innerHTML = `
            <div class="result-value">❌ ${message}</div>
        `;
        this.resultDisplay.className = 'result-display error pulse';
    }

    formatNumber(num) {
        // Handle very small numbers
        if (Math.abs(num) < 0.000001 && num !== 0) {
            return num.toExponential(6);
        }
        
        // Round to avoid floating point precision issues
        const rounded = Math.round(num * 1000000) / 1000000;
        
        // Check if the number is integer
        if (rounded % 1 === 0) {
            return rounded.toString();
        }
        
        return rounded.toString();
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: this.formatNumber(result),
            timestamp: new Date().toLocaleTimeString(),
            isError: false
        };

        this.history.unshift(historyItem);
        
        // Keep only last N items
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">Операции будут отображаться здесь</div>';
            return;
        }

        this.historyList.innerHTML = this.history.map(item => `
            <div class="history-item ${item.isError ? 'error' : ''}">
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">= ${item.result}</span>
            </div>
        `).join('');
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            try {
                this.history = JSON.parse(savedHistory);
                this.renderHistory();
            } catch (error) {
                console.error('Error loading history:', error);
                this.history = [];
            }
        }
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
        
        // Show confirmation message
        const originalText = this.clearHistoryBtn.textContent;
        this.clearHistoryBtn.textContent = 'История очищена!';
        
        setTimeout(() => {
            this.clearHistoryBtn.textContent = originalText;
        }, 2000);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Add some helpful console messages
    console.log('🧮 Калькулятор инициализирован!');
    console.log('Горячие клавиши:');
    console.log('Ctrl+1 - Сумма');
    console.log('Ctrl+2 - Разность');
    console.log('Ctrl+3 - Произведение');
    console.log('Ctrl+4 - Деление');
    console.log('Ctrl+L - Очистить историю');
});

class Calculator {
    constructor() {
        console.log('Calculator initialized');
        this.display = document.getElementById('calcDisplay');
        this.calculator = document.querySelector('.calculator');
        this.toggleButton = document.getElementById('toggleCalculator');
        this.closeButton = document.getElementById('closeCalculator');
        this.calculatorHeader = document.querySelector('.calculator-header');
        this.currentValue = '';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;

        this.initializeEventListeners();
        this.setupToggleListeners();
        this.setupDragListeners();
    }

    setupToggleListeners() {
        this.toggleButton.addEventListener('click', () => {
            this.calculator.style.display = 'block';
        });

        this.closeButton.addEventListener('click', () => {
            this.calculator.style.display = 'none';
        });
    }

    setupDragListeners() {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        this.calculatorHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = this.calculator.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            // Keep calculator within viewport bounds
            const maxX = window.innerWidth - this.calculator.offsetWidth;
            const maxY = window.innerHeight - this.calculator.offsetHeight;

            this.calculator.style.left = `${Math.min(Math.max(0, x), maxX)}px`;
            this.calculator.style.top = `${Math.min(Math.max(0, y), maxY)}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    initializeEventListeners() {
        console.log('Setting up event listeners');
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                console.log('Button clicked:', value);
                this.handleInput(value);
            });
        });
    }

    handleInput(value) {
        if (value >= '0' && value <= '9' || value === '.') {
            this.handleNumber(value);
        } else if (['+', '-', '*', '/'].includes(value)) {
            this.handleOperator(value);
        } else if (value === '=') {
            this.calculate();
        } else if (value === 'C') {
            this.clear();
        }
    }

    handleNumber(value) {
        if (this.shouldResetDisplay) {
            this.currentValue = value;
            this.shouldResetDisplay = false;
        } else {
            this.currentValue = this.currentValue === '0' ? value : this.currentValue + value;
        }
        this.updateDisplay();
    }

    handleOperator(operator) {
        if (this.currentValue === '') return;
        
        if (this.previousValue !== '') {
            this.calculate();
        }

        this.operation = operator;
        this.previousValue = this.currentValue;
        this.currentValue = '';
        this.shouldResetDisplay = true;
    }

    calculate() {
        if (this.previousValue === '' || this.currentValue === '') return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch (this.operation) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    alert('Cannot divide by zero');
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }

        this.currentValue = result.toString();
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    clear() {
        this.currentValue = '';
        this.previousValue = '';
        this.operation = null;
        this.shouldResetDisplay = false;
        this.updateDisplay();
    }

    updateDisplay() {
        console.log('Updating display:', this.currentValue || '0');
        this.display.value = this.currentValue || '0';
    }
}

// Initialize calculator when on home page
if (window.location.pathname.includes('home.html')) {
    console.log('Initializing calculator on home page');
    new Calculator();
} 
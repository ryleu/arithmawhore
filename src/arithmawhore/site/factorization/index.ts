let numerators: HTMLCollectionOf<Element>;
let denominators: HTMLCollectionOf<Element>;
let primeButtons: HTMLCollectionOf<Element>;

// array of prime numbers up through 13
let primes = [2, 3, 5, 7, 11];

let numeratorValues = {
    "numerator-1": 1,
    "numerator-2": 1,
    "numerator-3": 1,
}

let denominatorValues = {
    "denominator-1": 1,
    "denominator-2": 1,
    "denominator-3": 1,
}

// wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", () => {
    // get all numerators from DOM
    numerators = document.getElementsByClassName("numerator");

    // run selectNumerator() when a numerator is clicked
    for (let i = 0; i < numerators.length; i++) {
        numerators[i].addEventListener("click", () => {
            selectNumerator(numerators[i] as HTMLElement);
            checkForPrimeNumbers();
        });
    }

    // get all denominators from DOM
    denominators = document.getElementsByClassName("denominator");

    // run selectDenominator() when a denominator is clicked
    for (let i = 0; i < denominators.length; i++) {
        denominators[i].addEventListener("click", () => {
            selectDenominator(denominators[i] as HTMLElement);
            checkForPrimeNumbers();
        });
    }

    calculateNewPrimes();

    // when a prime number is clicked, check if it's in the list of values for both the numerator and denominator
    //  if it is, remove it from both lists
    primeButtons = document.getElementsByClassName("prime-button");
    for (let i = 0; i < primeButtons.length; i++) {
        let button = primeButtons[i];
        button.addEventListener("click", () => {
            let prime = parseInt(button.textContent);

            let numeratorIndex = numeratorValues[selectedNumerator.id] % prime;
            let denominatorIndex = denominatorValues[selectedDenominator.id] % prime;

            if (numeratorIndex === 0 && denominatorIndex === 0) {
                numeratorValues[selectedNumerator.id] /= prime;
                denominatorValues[selectedDenominator.id] /= prime;
            }

            applyPrimesToFractions();
        });
    }
});

let selectedNumerator = null;
let selectedDenominator = null;

// function that selects a numerator and deselects the previous one
function selectNumerator(numerator: HTMLElement) {
    if (selectedNumerator !== null) {
        selectedNumerator.classList.remove("selected");
    }

    selectedNumerator = numerator;
    selectedNumerator.classList.add("selected");
}

// function that selects a denominator and deselects the previous one
function selectDenominator(denominator: HTMLElement) {
    if (selectedDenominator !== null) {
        selectedDenominator.classList.remove("selected");
    }

    selectedDenominator = denominator;
    selectedDenominator.classList.add("selected");
}

// function that un-hides the prime-numbers div if both a numerator and denominator are selected
function checkForPrimeNumbers() {
    if (selectedNumerator !== null && selectedDenominator !== null) {
        document.getElementById("prime-numbers").classList.remove("hidden");
    } else {
        document.getElementById("prime-numbers").classList.add("hidden");
    }
}

function applyPrimesToFractions() {
    // apply the values to the DOM
    for (let i = 0; i < numerators.length; i++) {
        numerators[i].textContent = numeratorValues[numerators[i].id];
        denominators[i].textContent = denominatorValues[denominators[i].id];
    }
}

function calculateNewPrimes() {
    // multiply a random prime number by a random numerator value and a random denominator value
    let numberOfMultiplications = 6;
    for (let i = 0; i < numberOfMultiplications; i++) {
        let prime = primes[Math.floor(Math.random() * primes.length)];
        numeratorValues[`numerator-${Math.floor(Math.random() * 3) + 1}`] *= prime;
        denominatorValues[`denominator-${Math.floor(Math.random() * 3) + 1}`] *= prime;
    }

    applyPrimesToFractions();
}
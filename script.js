lucide.createIcons();

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function validateInputs() {
  let isValid = true;
  const inputs = [
    {
      id: "monthly-income",
      errorId: "income-error",
      name: "Renda mensal",
      min: 1,
      allowZero: false,
    },
    {
      id: "monthly-expenses",
      errorId: "expenses-error",
      name: "Gastos mensais",
      min: 1,
      allowZero: false,
    },
    {
      id: "current-savings",
      errorId: "savings-error",
      name: "Patrimônio atual",
      min: 0,
      allowZero: true,
    },
    {
      id: "monthly-investment",
      errorId: "investment-error",
      name: "Investimento mensal",
      min: 0,
      allowZero: false,
    },
    {
      id: "annual-return",
      errorId: "return-error",
      name: "Retorno anual",
      min: 0,
      allowZero: false,
    },
  ];

  // Clear previous errors
  inputs.forEach((input) => {
    const element = document.getElementById(input.id);
    const errorElement = document.getElementById(input.errorId);
    element.classList.remove("input-error");
    errorElement.innerHTML = "";
  });

  // Validate each input
  inputs.forEach((input) => {
    const element = document.getElementById(input.id);
    const errorElement = document.getElementById(input.errorId);
    const value = parseFloat(element.value);

    // Check if empty
    if (element.value.trim() === "") {
      element.classList.add("input-error");
      errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} é obrigatório`;
      isValid = false;
      return;
    }

    // Check if it's a valid number
    if (isNaN(value)) {
      element.classList.add("input-error");
      errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser um número válido`;
      isValid = false;
      return;
    }

    // Check if zero is allowed for this field
    if (!input.allowZero && value === 0) {
      element.classList.add("input-error");
      if (input.id === "monthly-income") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> Você deve ter uma renda para calcular a liberdade financeira`;
      } else if (input.id === "monthly-expenses") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> Você deve ter gastos mensais para calcular corretamente`;
      } else if (input.id === "monthly-investment") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser pelo menos R$ 1,00`;
      } else if (input.id === "annual-return") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser maior que 0%`;
      }
      isValid = false;
      return;
    }

    // Check minimum value
    if (value < input.min) {
      element.classList.add("input-error");
      if (input.id === "monthly-investment") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser pelo menos R$ 1,00`;
      } else if (input.id === "annual-return") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser pelo menos 0,1%`;
      } else if (input.id === "monthly-income") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser pelo menos R$ 1,00`;
      } else if (input.id === "monthly-expenses") {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser pelo menos R$ 1,00`;
      } else {
        errorElement.innerHTML = `<i data-lucide="alert-circle" size="16"></i> ${input.name} deve ser um valor válido`;
      }
      isValid = false;
    }
  });

  // Additional validations
  const income =
    parseFloat(document.getElementById("monthly-income").value) || 0;
  const expenses =
    parseFloat(document.getElementById("monthly-expenses").value) || 0;
  const investment =
    parseFloat(document.getElementById("monthly-investment").value) || 0;
  const surplus = income - expenses;

  if (income > 0 && expenses >= income) {
    document.getElementById("expenses-error").innerHTML =
      '<i data-lucide="alert-circle" size="16"></i> Gastos não podem ser maiores ou iguais à renda';
    document.getElementById("monthly-expenses").classList.add("input-error");
    isValid = false;
  }

  if (investment > surplus && surplus > 0) {
    document.getElementById(
      "investment-error"
    ).innerHTML = `<i data-lucide="alert-circle" size="16"></i> Investimento não pode ser maior que a sobra mensal (R$ ${surplus.toFixed(
      2
    )})`;
    document.getElementById("monthly-investment").classList.add("input-error");
    isValid = false;
  }

  // Re-initialize icons after updating error messages
  lucide.createIcons();

  return isValid;
}

function calculateMonthsToReach(
  target,
  currentSavings,
  monthlyInvestment,
  monthlyReturn
) {
  if (monthlyInvestment <= 0) return Infinity;

  if (currentSavings >= target) return 0;

  let months = 0;
  let accumulated = currentSavings;

  while (accumulated < target && months < 1200) {
    // max 100 years
    accumulated = accumulated * (1 + monthlyReturn) + monthlyInvestment;
    months++;
  }

  return months;
}

function calculateProgress(current, target) {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

function formatTime(months) {
  if (months === Infinity || months > 1200) return "∞";
  if (months <= 24) return `${Math.ceil(months)} meses`;
  return `${Math.ceil(months / 12)} anos`;
}

async function calculateFreedom() {
  // Validate inputs first
  if (!validateInputs()) {
    const warningElement = document.getElementById("warning-message");
    warningElement.querySelector("span").textContent =
      "Por favor, corrija os erros acima antes de calcular.";
    warningElement.style.display = "flex";
    return;
  }

  // Hide warning message and show loading state
  document.getElementById("warning-message").style.display = "none";

  const button = document.querySelector(".calculate-btn");
  const successMessage = document.getElementById("success-message");

  // Show loading state
  button.classList.add("loading");
  successMessage.style.display = "flex";

  // Simulate calculation delay for better UX
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Get input values
  const monthlyIncome =
    parseFloat(document.getElementById("monthly-income").value) || 0;
  const monthlyExpenses =
    parseFloat(document.getElementById("monthly-expenses").value) || 0;
  const currentSavings =
    parseFloat(document.getElementById("current-savings").value) || 0;
  const monthlyInvestment =
    parseFloat(document.getElementById("monthly-investment").value) || 0;
  const annualReturn =
    parseFloat(document.getElementById("annual-return").value) || 10;

  // Calculate derived values
  const monthlySurplus = monthlyIncome - monthlyExpenses;
  const annualExpenses = monthlyExpenses * 12;
  const monthlyReturn = annualReturn / 100 / 12;

  // Calculate the 3 levels
  const level1Target = monthlyExpenses * 6; // 6 months emergency fund
  const level2Target = annualExpenses * 25; // Financial independence
  const level3Target = annualExpenses * 40; // Total freedom

  // Calculate time to reach each level
  const monthsToLevel1 = calculateMonthsToReach(
    level1Target,
    currentSavings,
    monthlyInvestment,
    monthlyReturn
  );
  const monthsToLevel2 = calculateMonthsToReach(
    level2Target,
    currentSavings,
    monthlyInvestment,
    monthlyReturn
  );
  const monthsToLevel3 = calculateMonthsToReach(
    level3Target,
    currentSavings,
    monthlyInvestment,
    monthlyReturn
  );

  // Calculate progress
  const level1Progress = calculateProgress(currentSavings, level1Target);
  const level2Progress = calculateProgress(currentSavings, level2Target);
  const level3Progress = calculateProgress(currentSavings, level3Target);

  // Hide loading state
  button.classList.remove("loading");
  successMessage.style.display = "none";

  // Show results container with animation
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.classList.add("show");

  // Animate level cards
  setTimeout(() => {
    document.querySelectorAll(".level-card").forEach((card) => {
      card.classList.add("animate");
    });
  }, 300);

  // Animate summary card
  setTimeout(() => {
    document.querySelector(".summary-card").classList.add("animate");
  }, 1000);

  // Update values with delay for better animation
  setTimeout(() => {
    // Update Level 1
    document.getElementById("level1-value").textContent =
      formatCurrency(level1Target);
    document.getElementById("level1-progress").style.width =
      level1Progress + "%";
    document.getElementById("level1-percentage").textContent =
      level1Progress.toFixed(1) + "%";
    document.getElementById("level1-time").querySelector("span").textContent =
      formatTime(monthsToLevel1);
  }, 500);

  setTimeout(() => {
    // Update Level 2
    document.getElementById("level2-value").textContent =
      formatCurrency(level2Target);
    document.getElementById("level2-progress").style.width =
      level2Progress + "%";
    document.getElementById("level2-percentage").textContent =
      level2Progress.toFixed(1) + "%";
    document.getElementById("level2-time").querySelector("span").textContent =
      formatTime(monthsToLevel2);
  }, 700);

  setTimeout(() => {
    // Update Level 3
    document.getElementById("level3-value").textContent =
      formatCurrency(level3Target);
    document.getElementById("level3-progress").style.width =
      level3Progress + "%";
    document.getElementById("level3-percentage").textContent =
      level3Progress.toFixed(1) + "%";
    document.getElementById("level3-time").querySelector("span").textContent =
      formatTime(monthsToLevel3);
  }, 900);

  setTimeout(() => {
    // Update summary
    document.getElementById("monthly-surplus").textContent =
      formatCurrency(monthlySurplus);
    document.getElementById("annual-expenses").textContent =
      formatCurrency(annualExpenses);
    document.getElementById("freedom-income").textContent = formatCurrency(
      (level2Target * 0.04) / 12
    );
    document.getElementById("total-timeline").textContent =
      formatTime(monthsToLevel2);
  }, 1200);

  // Scroll to results
  setTimeout(() => {
    resultsContainer.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 1500);
}

// Add input event listeners to clear errors on typing
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      // Clear error state when user starts typing valid values
      const value = parseFloat(this.value);
      const allowZero = input.id === "current-savings"; // Only patrimônio atual allows zero

      if (!isNaN(value) && (allowZero ? value >= 0 : value > 0)) {
        this.classList.remove("input-error");
        const errorId = this.id.replace(/-/g, "-") + "-error";
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.innerHTML = "";
        }
      }
    });

    // Enhanced validation for specific inputs
    input.addEventListener("keydown", function (e) {
      // Prevent negative values and some problematic keys
      if (e.key === "-" || e.key === "e" || e.key === "E") {
        e.preventDefault();
      }
    });

    input.addEventListener("blur", function () {
      // Ensure minimum values based on field requirements
      const value = parseFloat(this.value);
      let minValue;

      switch (input.id) {
        case "monthly-income":
        case "monthly-expenses":
        case "monthly-investment":
          minValue = 0;
          break;
        case "annual-return":
          minValue = 0;
          break;
        case "current-savings":
          minValue = 0; // This can be zero
          break;
        default:
          minValue = 0;
      }

      if (!isNaN(value) && value < minValue && this.value !== "") {
        this.value = minValue;
      }
    });
  });

  // Initialize Lucide icons
  lucide.createIcons();
});

// script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tenantList = document.getElementById('tenant-list');
    const addTenantBtn = document.getElementById('add-tenant-btn');
    const tenantDashboard = document.getElementById('tenant-dashboard');
    const closeBtn = document.querySelector('.close-btn');
    const tenantNameHeading = document.getElementById('tenant-name');
    const oldReadingSpan = document.getElementById('old-reading');
    const newReadingInput = document.getElementById('new-reading');
    const monthSelect = document.getElementById('month-select');
    const calculateBtn = document.getElementById('calculate-btn');
    const billSection = document.getElementById('bill-section');
    const shareBtn = document.getElementById('share-btn');
    const historyBtn = document.getElementById('history-btn');
    const historySection = document.getElementById('history-section');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.querySelector('.close-settings-btn');
    const rateInput = document.getElementById('rate');
    const saveRateBtn = document.getElementById('save-rate-btn');

    let tenants = JSON.parse(localStorage.getItem('tenants')) || [];
    let currentTenantIndex = null;
    let electricityRate = localStorage.getItem('electricityRate') || 0;

    // Populate Month Dropdown
    const monthOptions = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    monthOptions.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // Functions to Render Tenants
    function renderTenants() {
        tenantList.innerHTML = '';
        tenants.forEach((tenant, index) => {
            const card = document.createElement('div');
            card.className = 'tenant-card';
            card.innerHTML = `<h3>${tenant.name}</h3>`;
            card.addEventListener('click', () => openTenantDashboard(index));
            tenantList.appendChild(card);
        });
    }

    // Open Tenant Dashboard
    function openTenantDashboard(index) {
        currentTenantIndex = index;
        const tenant = tenants[index];
        tenantNameHeading.textContent = tenant.name;
        oldReadingSpan.textContent = tenant.oldReading || 0;
        newReadingInput.value = '';
        monthSelect.value = ''; // Reset month select
        billSection.innerHTML = '';
        historySection.innerHTML = '';
        tenantDashboard.style.display = 'block';
    }

    // Close Tenant Dashboard
    closeBtn.onclick = function() {
        tenantDashboard.style.display = 'none';
    }

    // Add Tenant
    addTenantBtn.addEventListener('click', () => {
        const name = prompt('Enter Tenant Name:');
        if (name) {
            tenants.push({
                name: name,
                oldReading: 0,
                history: []
            });
            localStorage.setItem('tenants', JSON.stringify(tenants));
            renderTenants();
        }
    });

    // Calculate Bill
    calculateBtn.addEventListener('click', () => {
        const tenant = tenants[currentTenantIndex];
        const oldReading = parseFloat(tenant.oldReading);
        const newReading = parseFloat(newReadingInput.value);
        const month = monthSelect.value; // Get user-selected month
        const rate = parseFloat(electricityRate);
        const updatedDate = new Date().toLocaleDateString(); // Get current date

        if (isNaN(newReading) || isNaN(rate) || newReading < oldReading || !month) {
            alert('Please enter a valid new reading, rate, and month.');
            return;
        }

        const unitsUsed = newReading - oldReading;
        const amountDue = unitsUsed * rate;

        const billDetails = {
            month: month,
            updatedDate: updatedDate, // Store the date when bill was updated
            tenantName: tenant.name,
            oldReading: oldReading,
            newReading: newReading,
            unitsUsed: unitsUsed,
            amountDue: amountDue.toFixed(2)
        };

        billSection.innerHTML = `
            <p>Month: ${billDetails.month}</p>
            <p>Old Reading: ${billDetails.oldReading}</p>
            <p>New Reading: ${billDetails.newReading}</p>
            <p>Units Used: ${billDetails.unitsUsed}</p>
            <p>Total Amount: ₹${billDetails.amountDue}</p>
        `;

        tenant.oldReading = newReading;
        tenant.history.push(billDetails);
        tenants[currentTenantIndex] = tenant;
        localStorage.setItem('tenants', JSON.stringify(tenants));

        // Automatically select the next month
        const nextMonthIndex = (monthOptions.indexOf(month) + 1) % 12;
        monthSelect.value = monthOptions[nextMonthIndex];

        alert('Bill calculated successfully!');
    });

    // Share Details
    shareBtn.addEventListener('click', () => {
        if (billSection.innerHTML === '') {
            alert('Calculate the bill first.');
            return;
        }
        const billDetails = tenants[currentTenantIndex].history.slice(-1)[0]; // Get the latest bill details
        const text = `Month: ${billDetails.month}\nOld Reading: ${billDetails.oldReading}\nNew Reading: ${billDetails.newReading}\nUnits Used: ${billDetails.unitsUsed}\nTotal Amount: ₹${billDetails.amountDue}`;
        if (navigator.share) {
            navigator.share({
                title: 'Electricity Bill Details',
                text: text
            }).catch(err => console.error(err));
        } else {
            alert('Sharing is not supported on this device.');
        }
    });

    // View History
    historyBtn.addEventListener('click', () => {
        const tenant = tenants[currentTenantIndex];
        historySection.innerHTML = '';
        tenant.history.slice().reverse().forEach(entry => {
            historySection.innerHTML += `
                <p>Month: ${entry.month}</p>
                <p>Old Reading: ${entry.oldReading}</p>
                <p>New Reading: ${entry.newReading}</p>
                <p>Units Used: ${entry.unitsUsed}</p>
                <p>Total Amount: ₹${entry.amountDue}</p>
                <p>Updated Date: ${entry.updatedDate}</p>
                <hr>
            `;
        });
        historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    });

    // Open Settings Modal
    settingsBtn.onclick = function() {
        rateInput.value = electricityRate || '';
        settingsModal.style.display = 'block';
    }

    // Close Settings Modal
    closeSettingsBtn.onclick = function() {
        settingsModal.style.display = 'none';
    }

    // Save Rate
    saveRateBtn.addEventListener('click', () => {
        const rate = parseFloat(rateInput.value);
        if (isNaN(rate)) {
            alert('Please enter a valid electricity rate.');
            return;
        }
        electricityRate = rate;
        localStorage.setItem('electricityRate', electricityRate);
        alert('Electricity rate updated successfully!');
        settingsModal.style.display = 'none';
    });

    // Close Modals When Clicking Outside
    window.onclick = function(event) {
        if (event.target === tenantDashboard) {
            tenantDashboard.style.display = 'none';
        }
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    }

    // Initialize App
    renderTenants();
});

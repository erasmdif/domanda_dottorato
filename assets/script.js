document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const viewToggle = document.getElementById('view-toggle');
    const tableView = document.getElementById('table-view');
    const chartView = document.getElementById('chart-view');
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const tableBody = document.querySelector('#data-table tbody');
    
    // Chart variables
    let pieChart, barChart;
    
    // Data storage
    let originalData = [];
    let filteredData = [];
    let workTypes = [];
    
    // Initialize the application
    loadData();
    
    // Event listeners
    viewToggle.addEventListener('change', toggleView);
    yearFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Load data from CSV
    function loadData() {
        fetch('assets/cronoprogramma.csv')
            .then(response => response.text())
            .then(csvText => {
                originalData = parseCSV(csvText);
                filteredData = [...originalData];
                
                // Extract unique work types
                workTypes = [...new Set(originalData.map(item => item['tipo di lavoro']))];
                
                // Populate type filter
                populateTypeFilter();
                
                // Initialize views
                renderTable();
                initCharts();
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                // Fallback data in case CSV fails to load
                originalData = [
                    {Anno: "Primo anno", lavoro: "Revisione dei dati esistenti e valutazione dello stato di digitalizzazione", "tipo di lavoro": "Raccolta dati"},
                    // Add more fallback data if needed
                ];
                filteredData = [...originalData];
                workTypes = [...new Set(originalData.map(item => item['tipo di lavoro']))];
                populateTypeFilter();
                renderTable();
                initCharts();
            });
    }
    
    // Parse CSV data
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i] ? values[i].trim() : '';
            });
            return obj;
        }).filter(item => item.Anno); // Remove empty lines
    }
    
    // Populate type filter dropdown
    function populateTypeFilter() {
        typeFilter.innerHTML = '';
        workTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            option.selected = true;
            typeFilter.appendChild(option);
        });
    }
    
    // Toggle between table and chart views
    function toggleView() {
        if (viewToggle.checked) {
            tableView.classList.remove('active');
            chartView.classList.add('active');
            updateCharts();
        } else {
            tableView.classList.add('active');
            chartView.classList.remove('active');
        }
    }
    
    // Apply filters based on selections
    function applyFilters() {
        const selectedYears = Array.from(yearFilter.selectedOptions).map(opt => opt.value);
        const selectedTypes = Array.from(typeFilter.selectedOptions).map(opt => opt.value);
        
        filteredData = originalData.filter(item => {
            const yearMatch = selectedYears.includes(item.Anno);
            const typeMatch = selectedTypes.includes(item['tipo di lavoro']);
            return yearMatch && typeMatch;
        });
        
        if (tableView.classList.contains('active')) {
            renderTable();
        } else {
            updateCharts();
        }
    }
    
    // Reset all filters
    function resetFilters() {
        Array.from(yearFilter.options).forEach(option => {
            option.selected = true;
        });
        Array.from(typeFilter.options).forEach(option => {
            option.selected = true;
        });
        applyFilters();
    }
    
    // Render data table
    function renderTable() {
        tableBody.innerHTML = '';
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            
            // Add year class for styling
            if (item.Anno.includes('Primo anno')) row.classList.add('first-year');
            else if (item.Anno.includes('Secondo anno')) row.classList.add('second-year');
            else if (item.Anno.includes('Terzo anno')) row.classList.add('third-year');
            
            row.innerHTML = `
                <td class="year-cell">${item.Anno}</td>
                <td>${item.lavoro}</td>
                <td>${item['tipo di lavoro']}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Initialize charts
    function initCharts() {
        const pieCtx = document.getElementById('pie-chart').getContext('2d');
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        
        // Aggiungi pattern container
        document.querySelectorAll('.chart-wrapper').forEach(wrapper => {
            const pattern = document.createElement('div');
            pattern.className = 'chart-pattern';
            wrapper.appendChild(pattern);
        });
    
        // Modern color palette
        const modernColors = [
            { bg: 'rgba(52, 152, 219, 0.7)', border: '#2980b9' }, // blue
            { bg: 'rgba(46, 204, 113, 0.7)', border: '#27ae60' }, // green
            { bg: 'rgba(231, 76, 60, 0.7)', border: '#c0392b' }, // red
            { bg: 'rgba(243, 156, 18, 0.7)', border: '#d35400' }, // orange
            { bg: 'rgba(155, 89, 182, 0.7)', border: '#8e44ad' }, // purple
            { bg: 'rgba(26, 188, 156, 0.7)', border: '#16a085' }  // teal
        ];
    
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: getPieChartData(),
            options: {
                responsive: true,
                cutout: '60%',
                borderRadius: 0, // Bordi dritti
                spacing: 2,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuzione per Tipo di Lavoro',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 16
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            family: 'Inter',
                            size: 12
                        },
                        titleFont: {
                            family: 'Inter',
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 2,
                        borderColor: '#fff'
                    }
                }
            }
        });
    
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: getBarChartData(),
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                family: 'Inter'
                            }
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Attività per Anno e Tipo',
                        font: {
                            family: 'Inter',
                            size: 16,
                            weight: '600'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            usePointStyle: true,
                            padding: 16
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            family: 'Inter',
                            size: 12
                        },
                        titleFont: {
                            family: 'Inter',
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                datasets: {
                    bar: {
                        categoryPercentage: 0.8,
                        barPercentage: 0.9,
                        borderRadius: 0 // Bordi dritti
                    }
                }
            }
        });
    }
    
    // Update charts with filtered data
    function updateCharts() {
        pieChart.data = getPieChartData();
        pieChart.update();
        
        barChart.data = getBarChartData();
        barChart.update();
    }
    
    // Prepare data for pie chart
    function getPieChartData() {
        const typeCounts = {};
        const modernColors = [
            { bg: 'rgba(52, 152, 219, 0.7)', border: '#2980b9' },
            { bg: 'rgba(46, 204, 113, 0.7)', border: '#27ae60' },
            { bg: 'rgba(231, 76, 60, 0.7)', border: '#c0392b' },
            { bg: 'rgba(243, 156, 18, 0.7)', border: '#d35400' },
            { bg: 'rgba(155, 89, 182, 0.7)', border: '#8e44ad' },
            { bg: 'rgba(26, 188, 156, 0.7)', border: '#16a085' }
        ];
        
        filteredData.forEach(item => {
            const type = item['tipo di lavoro'];
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        const types = Object.keys(typeCounts);
        
        return {
            labels: types,
            datasets: [{
                data: Object.values(typeCounts),
                backgroundColor: types.map((_, i) => modernColors[i % modernColors.length].bg),
                borderColor: types.map((_, i) => modernColors[i % modernColors.length].border),
                borderWidth: 2
            }]
        };
    }

        // Aggiungi gestione del pulsante di stampa
        document.getElementById('print-button').addEventListener('click', function() {
            // Crea una finestra temporanea per la stampa
            const printWindow = window.open('', '', 'width=800,height=600');
            
            // Ottieni l'HTML della tabella
            const tableHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Piano di Lavoro Dottorato</title>
                <style>
                    @page {
                        size: A4;
                        margin: 1.5cm;
                        @top-left { content: none; }
                        @top-right { content: none; }
                        @bottom-left { content: none; }
                        @bottom-center { content: none; }
                        @bottom-right { content: none; }
                    }
                    body {
                        font-family: "Helvetica Neue", Arial, sans-serif;
                        line-height: 1.5;
                        color: #000;
                        font-size: 12pt;
                        margin: 0;
                        padding: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20pt;
                    }
                    th, td {
                        padding: 10pt;
                        border: 1pt solid #ddd;
                    }
                    th {
                        background: #2c3e50 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .first-year { 
                        background-color: #e8f4fc !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                    .second-year { 
                        background-color: #e8f8f5 !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                    .third-year { 
                        background-color: #f9f2e8 !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                    h1 {
                        text-align: center;
                        font-size: 18pt;
                        margin-bottom: 20pt;
                        padding-top: 20pt;
                    }
                </style>
            </head>
            <body>
                <h1>Piano di Lavoro Dottorato</h1>
                ${document.querySelector('.printable-table').outerHTML}
                <script>
                    window.onload = function() {
                        // Forza i margini per tutti i browser
                        const style = document.createElement('style');
                        style.innerHTML = '@page { size: auto; margin: 0mm; }';
                        document.head.appendChild(style);
                        
                        setTimeout(function() {
                            window.print();
                            window.close();
                        }, 200);
                    };
                </script>
            </body>
            </html>
            `;

            // Scrivi il contenuto nella finestra
            printWindow.document.open();
            printWindow.document.write(tableHTML);
            printWindow.document.close();
            });

    
    
    // Prepare data for bar chart
    function getBarChartData() {
        const yearTypes = {};
        
        // Initialize structure
        const years = [...new Set(originalData.map(item => item.Anno))];
        const types = [...new Set(originalData.map(item => item['tipo di lavoro']))];
        
        years.forEach(year => {
            yearTypes[year] = {};
            types.forEach(type => {
                yearTypes[year][type] = 0;
            });
        });
        
        // Count occurrences
        filteredData.forEach(item => {
            yearTypes[item.Anno][item['tipo di lavoro']]++;
        });
        
        // Prepare dataset for Chart.js
        const datasets = types.map(type => {
            return {
                label: type,
                data: years.map(year => yearTypes[year][type]),
                backgroundColor: getColorForType(type)
            };
        });
        
        return {
            labels: years,
            datasets: datasets
        };
    }
    
    // Helper function to get consistent colors for types
    function getColorForType(type) {
        const colorMap = {
            'Raccolta dati': '#3498db',
            'Sistematizzazione': '#2ecc71',
            'Produzione e coding': '#e74c3c',
            'Formazione personale': '#f39c12',
            'Disseminazione e scrittura': '#9b59b6',
            'Analisi dati': '#1abc9c'
        };
        
        return colorMap[type] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }
});
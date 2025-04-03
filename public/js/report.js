// reports.js
document.addEventListener('DOMContentLoaded', function() {
    // สร้างข้อมูลจำลองสำหรับการแสดงผล
    const demoData = generateDemoData();
    
    // แสดงผลข้อมูลสรุป
    displaySummaryData(demoData.summary);
    
    // สร้างกราฟ
    createIncomeChart(demoData.dailyIncome);
    createTopProductsChart(demoData.topProducts);
    
    // แสดงข้อมูลในตาราง
    displayTableData(demoData.dailyIncome);
    
    // Event listeners
    setupEventListeners();
  });
  
  // สร้างข้อมูลจำลอง
  function generateDemoData() {
    // ข้อมูลสรุป
    const summary = {
      today: { income: 12500, percent: 5.2 },
      week: { income: 87450, percent: 3.8 },
      month: { income: 325800, percent: -2.1 },
      total: { income: 2145700, orders: 8542 }
    };
    
    // ข้อมูลรายได้รายวัน
    const dailyIncome = [
      { date: '2025-03-26', orders: 32, income: 11850, average: 370.31, change: -2.3 },
      { date: '2025-03-27', orders: 35, income: 11890, average: 339.71, change: 0.3 },
      { date: '2025-03-28', orders: 40, income: 14350, average: 358.75, change: 20.7 },
      { date: '2025-03-29', orders: 42, income: 15200, average: 361.90, change: 5.9 },
      { date: '2025-03-30', orders: 38, income: 13800, average: 363.16, change: -9.2 },
      { date: '2025-03-31', orders: 33, income: 11880, average: 360.00, change: -13.9 },
      { date: '2025-04-01', orders: 34, income: 12500, average: 367.65, change: 5.2 }
    ];
    
    // ข้อมูลสินค้าขายดี
    const topProducts = [
      { name: 'อเมริกาโน่', quantity: 154, revenue: 15400 },
      { name: 'ลาเต้', quantity: 128, revenue: 14080 },
      { name: 'คาปูชิโน่', quantity: 112, revenue: 12320 },
      { name: 'มอคค่า', quantity: 96, revenue: 11520 },
      { name: 'เอสเพรสโซ่', quantity: 85, revenue: 8500 }
    ];
    
    return { summary, dailyIncome, topProducts };
  }
  
  // แสดงข้อมูลสรุป
  function displaySummaryData(data) {
    document.getElementById('today-income').textContent = formatCurrency(data.today.income);
    document.getElementById('today-percent').textContent = data.today.percent.toFixed(1);
    
    document.getElementById('week-income').textContent = formatCurrency(data.week.income);
    document.getElementById('week-percent').textContent = data.week.percent.toFixed(1);
    
    document.getElementById('month-income').textContent = formatCurrency(data.month.income);
    document.getElementById('month-percent').textContent = Math.abs(data.month.percent).toFixed(1);
    
    const monthChange = document.getElementById('month-change');
    if (data.month.percent < 0) {
      monthChange.classList.remove('positive');
      monthChange.classList.add('negative');
      monthChange.innerHTML = `<i class="fas fa-arrow-down"></i> <span id="month-percent">${Math.abs(data.month.percent).toFixed(1)}</span>% จากเดือนที่แล้ว`;
    }
    
    document.getElementById('total-income').textContent = formatCurrency(data.total.income);
    document.getElementById('total-orders').textContent = `${data.total.orders.toLocaleString()} ออเดอร์`;
  }
  
  // สร้างกราฟรายได้
  function createIncomeChart(data) {
    const labels = data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    });
    
    const values = data.map(item => item.income);
    
    const ctx = document.getElementById('income-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'รายได้ (บาท)',
          data: values,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#007bff',
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y.toLocaleString('th-TH')} บาท`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              drawBorder: false
            },
            ticks: {
              callback: function(value) {
                return value.toLocaleString('th-TH');
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
  
  // สร้างกราฟสินค้าขายดี
  function createTopProductsChart(data) {
    const labels = data.map(item => item.name);
    const values = data.map(item => item.quantity);
    
    const ctx = document.getElementById('top-products-chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'จำนวนที่ขายได้',
          data: values,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)',
            'rgb(255, 205, 86)',
            'rgb(255, 159, 64)',
            'rgb(153, 102, 255)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // แสดงข้อมูลในตาราง
  function displayTableData(data) {
    const tableBody = document.getElementById('income-data');
    tableBody.innerHTML = '';
    
    data.forEach(item => {
      const row = document.createElement('tr');
      
      const dateCell = document.createElement('td');
      const date = new Date(item.date);
      dateCell.textContent = date.toLocaleDateString('th-TH', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
      row.appendChild(dateCell);
      
      const ordersCell = document.createElement('td');
      ordersCell.textContent = item.orders.toLocaleString();
      row.appendChild(ordersCell);
      
      const incomeCell = document.createElement('td');
      incomeCell.textContent = formatCurrency(item.income);
      row.appendChild(incomeCell);
      
      const averageCell = document.createElement('td');
      averageCell.textContent = formatCurrency(item.average);
      row.appendChild(averageCell);
      
      const changeCell = document.createElement('td');
      if (item.change > 0) {
        changeCell.innerHTML = `<span class="positive"><i class="fas fa-arrow-up"></i> ${item.change.toFixed(1)}%</span>`;
      } else if (item.change < 0) {
        changeCell.innerHTML = `<span class="negative"><i class="fas fa-arrow-down"></i> ${Math.abs(item.change).toFixed(1)}%</span>`;
      } else {
        changeCell.innerHTML = `<span><i class="fas fa-minus"></i> 0.0%</span>`;
      }
      row.appendChild(changeCell);
      
      tableBody.appendChild(row);
    });
  }
  
  // จัดรูปแบบเงิน
  function formatCurrency(value) {
    return new Intl.NumberFormat('th-TH', { 
      style: 'currency', 
      currency: 'THB',
      maximumFractionDigits: 0
    }).format(value);
  }
  
  // ตั้งค่า Event Listeners
  function setupEventListeners() {
    // ฟิลเตอร์กำหนดเอง
    const dateRange = document.getElementById('date-range');
    const customDates = document.getElementById('custom-dates');
    
    dateRange.addEventListener('change', function() {
      if (this.value === 'custom') {
        customDates.style.display = 'flex';
      } else {
        customDates.style.display = 'none';
      }
    });
    
    // ปุ่มสร้างรายงาน
    const generateBtn = document.getElementById('generate-report');
    generateBtn.addEventListener('click', function() {
      // จำลองการโหลดข้อมูลใหม่
      const reportType = document.getElementById('report-type').value;
      
      // แสดงการโหลด
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังโหลด...';
      this.disabled = true;
      
      // จำลองการรอสักครู่
      setTimeout(() => {
        // สร้างข้อมูลใหม่ตามประเภทรายงาน
        let newData;
        
        if (reportType === 'monthly') {
          newData = generateMonthlyData();
        } else if (reportType === 'yearly') {
          newData = generateYearlyData();
        } else {
          newData = generateDemoData();
        }
        
        // อัพเดตหน้ารายงาน
        displaySummaryData(newData.summary);
        
        // อัพเดตกราฟ
        document.getElementById('income-chart').remove();
        const incomeChartContainer = document.querySelector('.chart-container:first-child');
        incomeChartContainer.innerHTML += '<canvas id="income-chart"></canvas>';
        createIncomeChart(newData.dailyIncome);
        
        // อัพเดตตาราง
        displayTableData(newData.dailyIncome);
        
        // คืนค่าปุ่ม
        this.innerHTML = '<i class="fas fa-chart-bar"></i> สร้างรายงาน';
        this.disabled = false;
      }, 1000);
    });
    
    // ปุ่มส่งออก
    document.getElementById('export-excel').addEventListener('click', function() {
      alert('กำลังส่งออกรายงานเป็นไฟล์ Excel');
    });
    
    document.getElementById('export-pdf').addEventListener('click', function() {
      alert('กำลังส่งออกรายงานเป็นไฟล์ PDF');
    });
    
    document.getElementById('print-report').addEventListener('click', function() {
      window.print();
    });
  }
  
  // สร้างข้อมูลรายเดือน
  function generateMonthlyData() {
    const summary = {
      today: { income: 12500, percent: 5.2 },
      week: { income: 87450, percent: 3.8 },
      month: { income: 325800, percent: -2.1 },
      total: { income: 2145700, orders: 8542 }
    };
    
    const dailyIncome = [
      { date: '2024-10-01', orders: 850, income: 302500, average: 355.88, change: -5.2 },
      { date: '2024-11-01', orders: 912, income: 323760, average: 355.00, change: 7.0 },
      { date: '2024-12-01', orders: 1050, income: 378000, average: 360.00, change: 16.8 },
      { date: '2025-01-01', orders: 934, income: 335250, average: 358.94, change: -11.3 },
      { date: '2025-02-01', orders: 890, income: 319850, average: 359.38, change: -4.6 },
      { date: '2025-03-01', orders: 920, income: 332650, average: 361.58, change: 4.0 },
      { date: '2025-04-01', orders: 325, income: 116500, average: 358.46, change: -12.5 }
    ];
    
    return { summary, dailyIncome, topProducts: [] };
  }
  
  // สร้างข้อมูลรายปี
  function generateYearlyData() {
    const summary = {
      today: { income: 12500, percent: 5.2 },
      week: { income: 87450, percent: 3.8 },
      month: { income: 325800, percent: -2.1 },
      total: { income: 2145700, orders: 8542 }
    };
    
    const dailyIncome = [
      { date: '2020-01-01', orders: 6450, income: 2150000, average: 333.33, change: null },
      { date: '2021-01-01', orders: 7540, income: 2580000, average: 342.18, change: 20.0 },
      { date: '2022-01-01', orders: 8120, income: 2890000, average: 355.91, change: 12.0 },
      { date: '2023-01-01', orders: 8350, income: 3010000, average: 360.48, change: 4.2 },
      { date: '2024-01-01', orders: 9210, income: 3380000, average: 367.00, change: 12.3 },
      { date: '2025-01-01', orders: 2995, income: 1075000, average: 358.93, change: -11.8 }
    ];
    
    return { summary, dailyIncome, topProducts: [] };
  }
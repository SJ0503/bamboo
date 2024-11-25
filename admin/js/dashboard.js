// API 기본 URL
const BASE_URL = 'http://localhost:8082/api';

// Dashboard 관련 함수들
const DashboardService = {
    // 대시보드 통계 데이터 가져오기
    async fetchDashboardData() {
        try {
            const statsResponse = await fetch(`${BASE_URL}/dashboard`);
            const statsData = await statsResponse.json();
            this.updateDashboardStats(statsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            this.updateDashboardStats({
                totalUsers: '-',
                activeUsersToday: '-',
                totalDiaries: '-',
                todayChatSessions: '-'
            });
        }
    },

    // 통계 데이터 업데이트
    updateDashboardStats(data) {
        const elements = {
            'totalUsers': data.totalUsers || '0',
            'activeUsers': data.activeUsersToday || '0',
            'diaryCount': data.totalDiaries || '0',
            'chatSessions': data.todayChatSessions || '0'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }
};

// 도넛 차트 관련 함수들
const DonutChartService = {
    donutChart: null,

    createDonutChart() {
        const ctx = document.getElementById('donutChart')?.getContext('2d');
        if (!ctx) return null;

        if (this.donutChart) {
            this.donutChart.destroy();
        }

        this.donutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['일기', '챗봇', '둘 다 이용', '미이용'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#FF9F40',  // 일기
                        '#4BC0C0',  // 챗봇
                        '#36A2EB',  // 둘 다 이용
                        '#FF6384'   // 미이용
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const rawValue = context.dataset.rawData[context.dataIndex];
                                return `${label}: ${value}% (${rawValue}명)`;
                            }
                        }
                    }
                }
            }
        });

        return this.donutChart;
    },

    async fetchUserStats() {
        try {
            const response = await fetch(`${BASE_URL}/users-stats`);
            const data = await response.json();
            this.updateUserStatsChart(data);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    },

    updateUserStatsChart(data) {
        if (!this.donutChart) {
            this.donutChart = this.createDonutChart();
        }

        const total = (data.diaryOnlyUsers || 0) + 
                     (data.chatbotOnlyUsers || 0) + 
                     (data.bothUsers || 0) + 
                     (data.inactiveUsers || 0);

        const calculatePercentage = (value) => {
            return ((value || 0) / total * 100).toFixed(0);
        };

        const rawData = [
            data.diaryOnlyUsers || 0,
            data.chatbotOnlyUsers || 0,
            data.bothUsers || 0,
            data.inactiveUsers || 0
        ];

        const percentageData = rawData.map(value => parseInt(calculatePercentage(value)));
        
        this.donutChart.data.datasets[0].rawData = rawData;
        this.donutChart.data.datasets[0].data = percentageData;
        this.donutChart.update();

        this.updateDonutChartStats(percentageData, total);
    },

    updateDonutChartStats(percentageData, total) {
        const stats = {
            'diaryOnlyUsers': percentageData[0],
            'chatOnlyUsers': percentageData[1],
            'bothUsers': percentageData[2],
            'inactiveUsers': percentageData[3],
            'totalUsersStats': total
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = id === 'totalUsersStats' ? value : `${value}%`;
            }
        });
    },

    setupLegendClickHandlers() {
        const legendItems = document.querySelectorAll('.legend-item');
        legendItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const meta = this.donutChart.getDatasetMeta(0);
                const isHidden = meta.data[index].hidden || false;
                
                meta.data[index].hidden = !isHidden;
                item.style.opacity = !isHidden ? '0.5' : '1';
                
                this.donutChart.update();
            });
        });
    }
};

// 차트 관련 함수들 (Weekly Activity & Signup Trend)
const ChartService = {
    weeklyActivityChart: null,
    signupTrendMorrisChart: null,

    getLast7Days() {
        return Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString();
        });
    },

    async initWeeklyActivityChart() {
        try {
            const response = await fetch(`${BASE_URL}/weekly-activity`);
            const data = await response.json();
            
            const ctx = document.getElementById('weeklyActivityChart')?.getContext('2d');
            if (!ctx) return;

            if (this.weeklyActivityChart) {
                this.weeklyActivityChart.destroy();
            }

            this.weeklyActivityChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.getLast7Days(),
                    datasets: [{
                        label: '일기 작성',
                        data: data.diary,
                        borderColor: 'rgba(60,141,188,0.8)',
                        tension: 0.1,
                        fill: false
                    }, {
                        label: '채팅 사용',
                        data: data.chat,
                        borderColor: 'rgba(210,214,222,1)',
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error initializing weekly activity chart:', error);
        }
    },

    async initSignupTrendChart() {
        try {
            const response = await fetch(`${BASE_URL}/signup-trend`);
            const data = await response.json();

            const signupData = Object.entries(data).map(([date, signups]) => ({
                date,
                signups
            }));

            if (this.signupTrendMorrisChart) {
                this.signupTrendMorrisChart.setData([]);
            }

            this.signupTrendMorrisChart = new Morris.Area({
                element: 'signupTrendMorris',
                data: signupData,
                xkey: 'date',
                ykeys: ['signups'],
                labels: ['신규 가입자 수'],
                lineColors: ['#8884d8'],
                fillOpacity: 0.6,
                behaveLikeLine: true,
                resize: true,
                yLabelFormat: y => Math.round(y)
            });
        } catch (error) {
            console.error('Error initializing signup trend chart:', error);
        }
    }
};

// 사용자 테이블 관련 함수들
const UserTableService = {
    async fetchAllUsersWithJoinDate() {
        try {
            const response = await fetch(`${BASE_URL}/users-with-join-date`);
            const data = await response.json();
            console.log('All Users:', data); // 응답 데이터 콘솔 출력
            if (!Array.isArray(data)) {
                throw new Error('API did not return an array');
            }
            return data;
        } catch (error) {
            console.error('Error fetching all users:', error);
            return [];
        }
    },

    async fetchActiveUsers() {
        try {
            const response = await fetch(`${BASE_URL}/active-users`);
            const data = await response.json();
            console.log('Active Users:', data); // 데이터를 콘솔에 출력
            if (!Array.isArray(data)) {
                throw new Error('API did not return an array');
            }
            return data;
        } catch (error) {
            console.error('Error fetching active users:', error);
            return [];
        }
    },

    async initializeUserTable() {
        try {
            const [allUsers, activeUsers] = await Promise.all([
                this.fetchAllUsersWithJoinDate(),
                this.fetchActiveUsers()
            ]);

            console.log('All Users:', allUsers); // 전체 사용자 데이터 확인
            console.log('Active Users:', activeUsers); // 활성 사용자 데이터 확인

            const activeUserEmails = new Set(activeUsers.map(user => user.userEmail));
            
            const tableData = allUsers.map(user => ({
                userId: user.userEmail,
                nick: user.userNick,
                joinDate: new Date(user.joinedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }),
                status: activeUserEmails.has(user.userEmail) ? '활성' : '비활성'
            }));

            this.updateUserTable(tableData);

            // 테이블 데이터가 로드된 후 페이지네이션 설정
            updatePagination(tableData.length);
            changePage(1);
        } catch (error) {
            console.error('Error initializing user table:', error);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        }
    },

    updateUserTable(data) {
        const tbody = document.querySelector('#userDataTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.userId}</td>
                <td>${user.nick}</td>
                <td>${user.joinDate}</td>
                <td>
                    <span class="badge ${user.status === '활성' ? 'bg-success' : 'bg-secondary'}">
                        ${user.status}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
};

let currentPage = 1;
const rowsPerPage = 4; // 페이지당 보여줄 행 수

function changePage(page) {
  const table = document.getElementById('userDataTable');
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = tbody.getElementsByTagName('tr');
  const totalRows = rows.length;

  currentPage = page;

  for (let i = 0; i < totalRows; i++) {
    rows[i].style.display = 'none'; // 모든 행 숨기기
  }

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  for (let i = start; i < end && i < totalRows; i++) {
    rows[i].style.display = ''; // 현재 페이지의 행 표시
  }

  updatePagination(totalRows);
}

function updatePagination(totalRows) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    const a = document.createElement('a');
    a.className = 'page-link';
    a.href = '#';
    a.textContent = i;
    a.onclick = (function(page) {
      return function() {
        changePage(page);
      };
    })(i);
    li.appendChild(a);
    pagination.appendChild(li);
  }
}

// 초기 페이지 로딩 시 첫 페이지 표시 및 페이지네이션 설정
document.addEventListener('DOMContentLoaded', () => {
  changePage(1);
});

// 이벤트 리스너 설정 및 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing dashboard...');

    // 초기 데이터 로드
    await DashboardService.fetchDashboardData();
    await UserTableService.initializeUserTable();
    
    // 차트 초기화
    await ChartService.initWeeklyActivityChart();
    await ChartService.initSignupTrendChart();
    await DonutChartService.fetchUserStats();
    DonutChartService.setupLegendClickHandlers();

    // 이벤트 리스너 설정
    const allUsersBtn = document.getElementById('fetchAllUsersButton');
    const activeUsersBtn = document.getElementById('fetchActiveUsersButton');

    if (allUsersBtn) {
        allUsersBtn.addEventListener('click', () => UserTableService.initializeUserTable());
    }

    if (activeUsersBtn) {
        activeUsersBtn.addEventListener('click', async () => {
            const activeUsers = await UserTableService.fetchActiveUsers();
            UserTableService.updateUserTable(activeUsers);
            updatePagination(activeUsers.length);
            changePage(1);
        });
    }

    // 자동 새로고침 설정 (1분마다)
    setInterval(() => DashboardService.fetchDashboardData(), 60000);
});
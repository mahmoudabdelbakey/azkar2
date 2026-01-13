
const categoryTitles = {
    "azkhar_tayyiba": "أذكار طيبة",
    "asma_allah": "أسماء الله الحسنى",
    "morning": "أذكار الصباح",
    "evening": "أذكار المساء",
    "post_prayer": "أذكار بعد الصلاة",
    "tasbeeh": "تسابيح وأذكار عظيمة",
    "sleep": "أذكار النوم",
    "wake_up": "أذكار الاستيقاظ",
    "prayer": "أذكار الصلاة",
    "prophet_duas": "أدعية النبي ﷺ",
    "jawami": "جوامع الدعاء",
    "general": "أذكار متنوعة"
};

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';

        // Add animation class
        themeToggle.classList.add('pulse');
        setTimeout(() => themeToggle.classList.remove('pulse'), 500);
    });

    // Tab Switching & Dynamic Rendering
    const tabsContainer = document.querySelector('.tabs');
    const adhkarContainer = document.getElementById('adhkar-container');

    let activeCategory = 'azkhar_tayyiba';

    function init() {
        renderTabs();
        if (adhkarData[activeCategory]) {
            renderAdhkar(activeCategory);
        } else {
            // Fallback if morning is empty or missing, pick first available
            const firstKey = Object.keys(adhkarData)[0];
            if (firstKey) {
                activeCategory = firstKey;
                renderAdhkar(firstKey);
            }
        }
    }

    function renderTabs() {
        tabsContainer.innerHTML = '';
        const keys = Object.keys(adhkarData);

        // Sort keys to ensure priority
        const priority = ['azkhar_tayyiba', 'morning', 'evening', 'asma_allah', 'sleep', 'wake_up', 'post_prayer', 'prayer', 'tasbeeh', 'prophet_duas', 'jawami'];
        keys.sort((a, b) => {
            let idxA = priority.indexOf(a);
            let idxB = priority.indexOf(b);
            if (idxA === -1) idxA = 99;
            if (idxB === -1) idxB = 99;
            return idxA - idxB;
        });

        keys.forEach(key => {
            const title = categoryTitles[key] || key;
            const btn = document.createElement('button');
            btn.classList.add('tab-btn');
            if (key === activeCategory) btn.classList.add('active');
            btn.textContent = title;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = key;
                renderAdhkar(key);
            });
            tabsContainer.appendChild(btn);
        });
    }

    function renderAdhkar(category) {
        adhkarContainer.innerHTML = '';
        const items = adhkarData[category];

        adhkarContainer.style.opacity = '0';
        setTimeout(() => {
            if (category === 'asma_allah') {
                renderAsmaAllah(items);
            } else if (items && items.length > 0) {
                items.forEach(item => {
                    const card = createDhikrCard(item);
                    adhkarContainer.appendChild(card);
                });
            } else {
                adhkarContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">لا توجد أذكار في هذا القسم حالياً.</p>';
            }
            adhkarContainer.style.opacity = '1';
        }, 200);
    }

    function renderAsmaAllah(names) {
        const container = document.createElement('div');
        container.classList.add('asma-container');

        names.forEach((name, index) => {
            const circle = document.createElement('div');
            circle.classList.add('name-circle');
            circle.style.animationDelay = `${index * 0.05}s`; // Staggered animation
            circle.textContent = name;
            container.appendChild(circle);
        });

        adhkarContainer.appendChild(container);
    }

    function createDhikrCard(item) {
        const card = document.createElement('div');
        card.classList.add('dhikr-card');

        const isInfinite = item.count === 'infinity';
        const startCount = isInfinite ? 0 : (item.count || 1);

        // Parse Text and Meaning
        const textContent = formatText(item.text);
        let meaningContent = '';
        if (item.meaning && item.meaning !== 'ذكر' && item.meaning.length > 2) {
            meaningContent = `<div class="dhikr-meaning">${item.meaning}</div>`;
        }

        let actionHtml = '';
        if (isInfinite) {
            actionHtml = `
                <div class="dhikr-action infinite-mode">
                    <button class="counter-btn infinite" data-count="0">
                        <span class="count-display">0</span>
                        <span class="label">تكرار</span>
                    </button>
                    <button class="reset-btn" title="تصفير">↺</button>
                </div>
            `;
        } else {
            actionHtml = `
                <div class="dhikr-action">
                    <div class="counter-wrapper">
                        <button class="counter-btn" data-count="${startCount}" data-original="${startCount}">
                            <span class="count-display">${startCount}</span>
                            <span class="label">تكرار</span>
                        </button>
                        <div class="progress-ring">
                            <svg width="86" height="86">
                               <circle cx="43" cy="43" r="40"></circle>
                               <circle cx="43" cy="43" r="40" class="progress"></circle>
                            </svg>
                        </div>
                    </div>
                    <button class="reset-btn" title="إعادة">↺</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="dhikr-content">
                <div class="dhikr-text">${textContent}</div>
                ${meaningContent}
            </div>
            ${actionHtml}
        `;

        if (isInfinite) {
            const btn = card.querySelector('.counter-btn');
            const display = card.querySelector('.count-display');
            const resetBtn = card.querySelector('.reset-btn');
            let currentCount = 0;

            btn.addEventListener('click', () => {
                currentCount++;
                display.textContent = currentCount;
                btn.classList.add('pulse');
                setTimeout(() => btn.classList.remove('pulse'), 200);
                if (navigator.vibrate) navigator.vibrate(50);
            });

            resetBtn.addEventListener('click', () => {
                currentCount = 0;
                display.textContent = currentCount;
                btn.classList.add('pulse'); // Visual feedback
                setTimeout(() => btn.classList.remove('pulse'), 200);
            });

        } else {
            const btn = card.querySelector('.counter-btn');
            // const display = card.querySelector('.count-display'); // This will be queried dynamically now
            const progressCircle = card.querySelector('.progress');
            const resetBtn = card.querySelector('.reset-btn');
            const radius = 40;
            const circumference = 2 * Math.PI * radius;

            progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
            progressCircle.style.strokeDashoffset = 0; // Start Full

            let currentCount = startCount;

            // Re-write click listener to be robust against innerHTML changes
            btn.addEventListener('click', (e) => {
                // Need to re-query display because reset might have replaced it
                const currentDisplay = btn.querySelector('.count-display');
                if (!currentDisplay) return; // If it's a checkmark, ignore click? Or do nothing.

                if (currentCount > 0) {
                    currentCount--;
                    currentDisplay.textContent = currentCount;

                    // Pulse animation
                    btn.classList.add('pulse');
                    setTimeout(() => btn.classList.remove('pulse'), 200);

                    // Update Progress
                    progressCircle.style.strokeDashoffset = circumference * (1 - (currentCount / startCount));

                    if (currentCount === 0) {
                        card.classList.add('completed');
                        btn.innerHTML = '✔';
                        btn.classList.add('done');
                        if (navigator.vibrate) navigator.vibrate(50);
                    }
                }
            });

            resetBtn.addEventListener('click', () => {
                currentCount = startCount;

                // Reset Progress Ring
                progressCircle.style.strokeDashoffset = 0;

                // Reset Card State
                card.classList.remove('completed');
                btn.classList.remove('done');

                // Restore button HTML structure
                btn.innerHTML = `
                    <span class="count-display">${startCount}</span>
                    <span class="label">تكرار</span>
                `;

                // Add pulse for visual feedback on reset
                btn.classList.add('pulse');
                setTimeout(() => btn.classList.remove('pulse'), 200);
            });
        }

        return card;
    }

    function formatText(text) {
        if (!text) return '';
        // Replace newlines with <br>
        return text.replace(/\n/g, '<br>');
    }

    // Init
    if (typeof adhkarData !== 'undefined') {
        init();
    } else {
        window.addEventListener('load', init);
    }
});

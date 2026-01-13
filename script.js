
const categoryTitles = {
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
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');

    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Tab Switching & Dynamic Rendering
    const tabsContainer = document.querySelector('.tabs');
    const adhkarContainer = document.getElementById('adhkar-container');

    let activeCategory = 'morning';

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

        // Sort keys to ensure Morning/Evening come first if present
        const priority = ['morning', 'evening', 'sleep', 'wake_up', 'post_prayer', 'prayer', 'tasbeeh', 'prophet_duas', 'jawami'];
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
            if (items && items.length > 0) {
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

    function createDhikrCard(item) {
        const card = document.createElement('div');
        card.classList.add('dhikr-card');

        const startCount = item.count || 1;

        // Parse Text and Meaning
        const textContent = formatText(item.text);
        let meaningContent = '';
        if (item.meaning && item.meaning !== 'ذكر' && item.meaning.length > 2) {
            meaningContent = `<div class="dhikr-meaning">${item.meaning}</div>`;
        }

        card.innerHTML = `
            <div class="dhikr-content">
                <div class="dhikr-text">${textContent}</div>
                ${meaningContent}
            </div>
            <div class="dhikr-action">
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
        `;

        const btn = card.querySelector('.counter-btn');
        const display = card.querySelector('.count-display');
        const progressCircle = card.querySelector('.progress');
        const radius = 40;
        const circumference = 2 * Math.PI * radius;

        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;

        let currentCount = startCount;

        btn.addEventListener('click', (e) => {
            // Ripple effect or click logic
            if (currentCount > 0) {
                currentCount--;
                display.textContent = currentCount;

                // Pulse animation
                btn.classList.add('pulse');
                setTimeout(() => btn.classList.remove('pulse'), 200);

                // Update Progress
                // Progress goes from Full (offset=circumference) to Empty (offset=0) -> or vice versa.
                // Let's make it fill up as we go? Or empty out?
                // Usually counting down -> empties the ring.
                // Initial: offset = circumference (Hidden?). No, usually we want Full ring then reduce it.
                // strokeDashoffset = 0 is FULL. strokeDashoffset = circumference is EMPTY.

                // Let's start with Full Ring (offset 0) and reduce to Empty (offset circ).
                // Wait, current styling might be different.
                // Let's set initial state in JS:
                // Start: offset = 0 (Full)
                // End: offset = circumference (Empty)

                // Actually, let's do: Start Empty, Fill up?
                // Let's do: Start Full, Empty as you click.

                const percentDone = (startCount - currentCount) / startCount;
                const offset = circumference * percentDone;
                progressCircle.style.strokeDashoffset = circumference - offset; // This fills it up?

                // To Empty it:
                // offset = (currentCount / startCount) * circumference
                // progressCircle.style.strokeDashoffset = (circumference - ((currentCount/startCount)*circumference));
                // cleaner:
                progressCircle.style.strokeDashoffset = circumference - (currentCount / startCount) * circumference;

                // Wait, simpler:
                // If 100% (count=max) -> offset should be 0 (Full)
                // If 0% (count=0) -> offset should be C (Empty)
                // So offset = C * (1 - current/start)

                // Actually, stroke-dashoffset: 0 means full line. 
                // We want it to decrease.
                // offset = C * (1 - current/start) -> This increases offset (empties it).

                progressCircle.style.strokeDashoffset = circumference * (1 - (currentCount / startCount));

                if (currentCount === 0) {
                    card.classList.add('completed');
                    btn.innerHTML = '✔';
                    btn.classList.add('done');
                    if (navigator.vibrate) navigator.vibrate(50);
                }
            }
        });

        // Set initial validation
        progressCircle.style.strokeDashoffset = 0; // Starts full

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

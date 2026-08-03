(() => {
    'use strict';

    const parseDate = (value) => {
        if (!value) return null;
        const [year, month, day] = value.split('-').map(Number);
        return year && month && day ? new Date(year, month - 1, day) : null;
    };
    const sameDay = (left, right) => left.toDateString() === right.toDateString();

    const create = (container, options = {}) => {
        if (!container || container.dataset.calendarReady) return;
        container.dataset.calendarReady = 'true';
        const locale = options.locale || document.documentElement.lang || undefined;
        const events = (options.events || []).map((event) => ({
            ...event,
            start: parseDate(event.startDate),
            end: parseDate(event.endDate) || parseDate(event.startDate)
        })).filter((event) => event.start);
        let visibleMonth = new Date();
        visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);

        const render = () => {
            const year = visibleMonth.getFullYear();
            const month = visibleMonth.getMonth();
            const firstWeekday = new Date(year, month, 1).getDay();
            const gridStart = new Date(year, month, 1 - firstWeekday);
            container.replaceChildren();

            const controls = document.createElement('div');
            controls.className = 'controls';
            const previous = document.createElement('button');
            previous.type = 'button';
            previous.className = 'clndr-previous-button';
            previous.setAttribute('aria-label', 'Previous month');
            previous.innerHTML = '<i class="fa fa-fw fa-arrow-circle-left" aria-hidden="true"></i>';
            const heading = document.createElement('div');
            heading.className = 'month-year';
            heading.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(visibleMonth);
            const next = document.createElement('button');
            next.type = 'button';
            next.className = 'clndr-next-button';
            next.setAttribute('aria-label', 'Next month');
            next.innerHTML = '<i class="fa fa-fw fa-arrow-circle-right" aria-hidden="true"></i>';
            controls.append(previous, heading, next);

            const daysContainer = document.createElement('div');
            daysContainer.className = 'days-container';
            const days = document.createElement('div');
            days.className = 'days';
            const headers = document.createElement('div');
            headers.className = 'headers';
            for (let weekday = 0; weekday < 7; weekday++) {
                const header = document.createElement('div');
                header.className = 'day-header';
                header.textContent = new Intl.DateTimeFormat(locale, { weekday: 'short' })
                    .format(new Date(2024, 0, 7 + weekday));
                headers.append(header);
            }
            days.append(headers);

            const eventPanel = document.createElement('div');
            eventPanel.className = 'events';
            const eventHeader = document.createElement('div');
            eventHeader.className = 'headers';
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'x-button';
            close.setAttribute('aria-label', 'Close events');
            close.innerHTML = '<i class="fa fa-fw fa-close" aria-hidden="true"></i>';
            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-header';
            eventTitle.textContent = options.eventsHeader || 'Events';
            const eventList = document.createElement('div');
            eventList.className = 'events-list';
            eventHeader.append(close, eventTitle);
            eventPanel.append(eventHeader, eventList);

            const showEvents = (matches) => {
                eventList.replaceChildren();
                matches.forEach((event) => {
                    const row = document.createElement('div');
                    row.className = 'event';
                    row.id = event.id || '';
                    const dateFormat = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric' });
                    const dates = sameDay(event.start, event.end)
                        ? dateFormat.format(event.start)
                        : `${dateFormat.format(event.start)} - ${dateFormat.format(event.end)}`;
                    const text = `${dates}: ${event.title || ''}`;
                    if (event.url) {
                        const link = document.createElement('a');
                        link.className = 'event-link';
                        link.href = event.url;
                        link.target = event.target || '_blank';
                        link.rel = link.target === '_blank' ? 'noopener' : '';
                        link.textContent = text;
                        row.append(link);
                    } else {
                        row.append(document.createTextNode(text));
                    }
                    if (event.desc) {
                        const description = document.createElement('span');
                        description.className = 'event-desc';
                        description.textContent = event.desc;
                        row.append(description);
                    }
                    eventList.append(row);
                });
                daysContainer.classList.toggle('show-events', matches.length > 0);
            };

            for (let index = 0; index < 42; index++) {
                const date = new Date(gridStart);
                date.setDate(gridStart.getDate() + index);
                const matches = events.filter((event) => date >= event.start && date <= event.end);
                const day = document.createElement('button');
                day.type = 'button';
                day.className = `day${date.getMonth() === month ? '' : ' adjacent-month'}${matches.length ? ' event' : ''}`;
                day.textContent = date.getDate();
                day.setAttribute('aria-label', new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date));
                if (matches.length) day.addEventListener('click', () => showEvents(matches));
                if (date.getMonth() !== month) day.addEventListener('click', () => {
                    visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                    render();
                });
                days.append(day);
            }

            close.addEventListener('click', () => daysContainer.classList.remove('show-events'));
            previous.addEventListener('click', () => {
                visibleMonth = new Date(year, month - 1, 1);
                render();
            });
            next.addEventListener('click', () => {
                visibleMonth = new Date(year, month + 1, 1);
                render();
            });
            daysContainer.append(days, eventPanel);
            container.append(controls, daysContainer);
        };
        render();
    };

    window.GantryCalendar = { create };
})();

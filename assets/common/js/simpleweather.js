(() => {
    'use strict';

    const fieldLabels = {
        humidity: 'Humidity',
        pressure: 'Pressure',
        visibility: 'Visibility',
        windspeedKmph: 'Wind',
        windspeedMiles: 'Wind'
    };

    document.querySelectorAll('[data-simpleweather-id]').forEach(async (container) => {
        if (container.dataset.simpleweatherReady) return;
        container.dataset.simpleweatherReady = 'true';
        const location = container.dataset.simpleweatherLocation?.trim();
        if (!location) return;

        try {
            const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
            const data = await response.json();
            const current = data.current_condition?.[0];
            if (!current) throw new Error('Weather data is unavailable');
            const metric = String(container.dataset.simpleweatherUnits).toLowerCase() !== 'f';
            const content = document.createElement('div');
            content.className = 'g-simpleweather-content';
            const title = document.createElement('span');
            title.className = 'g-simpleweather-title';
            title.textContent = container.dataset.simpleweatherTitle || '';
            const icon = document.createElement('i');
            icon.className = `weathericon-${current.weatherCode || ''}`;
            const temperature = document.createElement('span');
            temperature.textContent = `${metric ? current.temp_C : current.temp_F}°${metric ? 'C' : 'F'}`;
            content.append(title, document.createTextNode(' '), icon, document.createTextNode(' '), temperature);

            if (container.dataset.simpleweatherShowlocation === 'enabled') {
                const area = data.nearest_area?.[0];
                const place = [area?.areaName?.[0]?.value, area?.region?.[0]?.value].filter(Boolean).join(', ');
                if (place) content.append(document.createTextNode(` ${place}`));
            }

            const fields = (container.dataset.simpleweatherParams || '').split(',').filter(Boolean);
            fields.forEach((field) => {
                let value = current[field];
                if (field === 'wind') value = metric ? current.windspeedKmph : current.windspeedMiles;
                if (value !== undefined) content.append(document.createTextNode(` ${fieldLabels[field] || field}: ${value}`));
            });
            container.replaceChildren(content);
        } catch (error) {
            const message = document.createElement('p');
            message.className = 'g-simpleweather-error';
            message.textContent = error.message;
            container.replaceChildren(message);
        }
    });
})();

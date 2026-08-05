'use strict';

const normalizeText = (value, diacritics) => {
    const normalized = String(value == null ? '' : value).toLowerCase();
    return diacritics
        ? normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        : normalized;
};

const getValue = (item, field, nesting) => {
    if (!nesting) return item == null ? undefined : item[field];
    return String(field).split('.').reduce(
        (value, key) => value == null ? undefined : value[key],
        item
    );
};

const compareValues = (left, right, diacritics) => {
    if (typeof left === 'number' && typeof right === 'number') {
        return left > right ? 1 : (left < right ? -1 : 0);
    }

    const normalizedLeft = normalizeText(left, diacritics);
    const normalizedRight = normalizeText(right, diacritics);
    return normalizedLeft > normalizedRight ? 1 : (normalizedLeft < normalizedRight ? -1 : 0);
};

class SearchIndex {
    constructor(items, settings) {
        this.items = items;
        this.settings = settings || { diacritics: true };
    }

    tokenize(query) {
        const normalized = normalizeText(query, this.settings.diacritics).trim();
        return normalized ? normalized.split(/\s+/) : [];
    }

    getScoreFunction(query, options) {
        const tokens = this.tokenize(query);
        const fields = Array.isArray(options.fields) ? options.fields : [options.fields].filter(Boolean);
        const conjunction = options.conjunction || 'and';
        const diacritics = this.settings.diacritics;
        const nesting = options.nesting;

        if (!tokens.length || !fields.length) return () => 0;

        const scoreValue = (value, token) => {
            if (value == null || value === '') return 0;

            const normalized = normalizeText(value, diacritics);
            const position = normalized.indexOf(token);
            if (position === -1) return 0;

            return (token.length / normalized.length) + (position === 0 ? 0.5 : 0);
        };

        const scoreToken = (item, token) => fields.reduce(
            (sum, field) => sum + scoreValue(getValue(item, field, nesting), token),
            0
        ) / fields.length;

        return (item) => {
            const scores = tokens.map(token => scoreToken(item, token));
            if (conjunction === 'and' && scores.some(score => score <= 0)) return 0;
            return scores.reduce((sum, score) => sum + score, 0) / scores.length;
        };
    }

    getSortFunction(query, options) {
        let fields = Array.isArray(options.sort) ? options.sort.slice() : [];
        const hasScore = fields.some(sort => sort.field === '$score');
        const diacritics = this.settings.diacritics;

        if (query && !hasScore) fields.unshift({ field: '$score', direction: 'desc' });
        if (!query) fields = fields.filter(sort => sort.field !== '$score');
        if (!fields.length) return null;

        return (left, right) => {
            for (const sort of fields) {
                const multiplier = sort.direction === 'desc' ? -1 : 1;
                const leftValue = sort.field === '$score'
                    ? left.score
                    : getValue(this.items[left.id], sort.field, options.nesting);
                const rightValue = sort.field === '$score'
                    ? right.score
                    : getValue(this.items[right.id], sort.field, options.nesting);
                const result = multiplier * compareValues(leftValue, rightValue, diacritics);

                if (result) return result;
            }

            return 0;
        };
    }

    search(query, options) {
        const normalizedQuery = normalizeText(query, this.settings.diacritics).trim();
        const score = options.score || this.getScoreFunction(normalizedQuery, options);
        const results = [];

        Object.keys(this.items).forEach((id) => {
            const itemScore = normalizedQuery ? score(this.items[id]) : 1;
            if (!normalizedQuery || options.filter === false || itemScore > 0) {
                results.push({ score: itemScore, id });
            }
        });

        const sort = this.getSortFunction(normalizedQuery, options);
        if (sort) results.sort(sort);

        return {
            options,
            query: normalizedQuery,
            tokens: this.tokenize(normalizedQuery),
            total: results.length,
            items: typeof options.limit === 'number' ? results.slice(0, options.limit) : results
        };
    }
}

export default SearchIndex;

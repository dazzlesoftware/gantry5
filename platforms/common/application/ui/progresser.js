"use strict";

let defaults = {
    value: 0.0,
    size: 50.0,
    startAngle: -Math.PI / 2,
    thickness: 'auto',
    fill: {
        gradient: ['#9e38eb', '#4e68fc']
    },
    emptyFill: 'rgba(0, 0, 0, .1)',
    animation: {
        duration: 1200,
        equation: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
    },
    animationStartValue: 0.0,
    reverse: false,
    lineCap: 'butt',
    insertElement: null,
    insertLocation: 'before'
};

let asElement = function(element) {
    if (element && element.nodeType) { return element; }
    if (element && element[0] && element[0].nodeType) { return element[0]; }
    return null;
};

let insertCanvas = function(canvas, target, location) {
    if (!target) { throw new Error('The progress indicator needs a target element.'); }

    switch (location) {
        case 'top':
            target.insertBefore(canvas, target.firstChild);
            break;
        case 'bottom':
            target.appendChild(canvas);
            break;
        case 'after':
            target.parentNode.insertBefore(canvas, target.nextSibling);
            break;
        case 'before':
        default:
            target.parentNode.insertBefore(canvas, target);
            break;
    }
};

let Progresser = function(element, options) {
    this.element = asElement(element);
    this.options = Object.assign({}, defaults, options || {});
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.arcFill = null;
    this.lastFrameValue = 0.0;
    this.animationFrame = null;

    let target = asElement(this.options.insertElement) || this.element;
    insertCanvas(this.canvas, target, this.options.insertLocation || 'before');
    this.update(options);
};

Progresser.prototype.update = function(options) {
    this.options = Object.assign({}, this.options, options || {});
    this.radius = this.options.size / 2;
    this.canvas.width = this.options.size;
    this.canvas.height = this.options.size;

    if (this.animationFrame !== null) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }

    this.initFill();
    this.draw();
    return this;
};

Progresser.prototype.initFill = function() {
    let fill = this.options.fill,
        size = this.options.size,
        ctx = this.ctx;

    if (!fill) { throw new Error('The fill is not specified.'); }

    this.arcFill = fill.color || null;

    if (fill.gradient) {
        let colors = fill.gradient;
        if (colors.length === 1) {
            this.arcFill = colors[0];
        } else {
            let angle = fill.gradientAngle || 0,
                direction = fill.gradientDirection || [
                    size / 2 * (1 - Math.cos(angle)),
                    size / 2 * (1 + Math.sin(angle)),
                    size / 2 * (1 + Math.cos(angle)),
                    size / 2 * (1 - Math.sin(angle))
                ],
                gradient = ctx.createLinearGradient.apply(ctx, direction);

            colors.forEach(function(entry, index) {
                let color = entry,
                    position = index / (colors.length - 1);

                if (Array.isArray(entry)) {
                    color = entry[0];
                    position = entry[1];
                }
                gradient.addColorStop(position, color);
            });
            this.arcFill = gradient;
        }
    }
};

Progresser.prototype.emit = function(name, detail) {
    this.element.dispatchEvent(new CustomEvent(name, {
        bubbles: true,
        detail: detail
    }));
};

Progresser.prototype.draw = function() {
    if (this.options.animation) { this.drawAnimated(this.options.value); }
    else { this.drawFrame(this.options.value); }
};

Progresser.prototype.drawFrame = function(value) {
    this.lastFrameValue = value;
    this.ctx.clearRect(0, 0, this.options.size, this.options.size);
    this.drawEmptyArc(value);
    this.drawArc(value);
};

Progresser.prototype.drawArc = function(value) {
    let ctx = this.ctx,
        radius = this.radius,
        thickness = this.getThickness(),
        angle = this.options.startAngle;

    ctx.save();
    ctx.beginPath();
    if (!this.options.reverse) {
        ctx.arc(radius, radius, radius - thickness / 2, angle, angle + Math.PI * 2 * value);
    } else {
        ctx.arc(radius, radius, radius - thickness / 2, angle - Math.PI * 2 * value, angle);
    }
    ctx.lineWidth = thickness;
    ctx.lineCap = this.options.lineCap;
    ctx.strokeStyle = this.arcFill;
    ctx.stroke();
    ctx.restore();
};

Progresser.prototype.drawEmptyArc = function(value) {
    let ctx = this.ctx,
        radius = this.radius,
        thickness = this.getThickness(),
        angle = this.options.startAngle;

    if (value >= 1) { return; }

    ctx.save();
    ctx.beginPath();
    if (value <= 0) {
        ctx.arc(radius, radius, radius - thickness / 2, 0, Math.PI * 2);
    } else if (!this.options.reverse) {
        ctx.arc(radius, radius, radius - thickness / 2, angle + Math.PI * 2 * value, angle);
    } else {
        ctx.arc(radius, radius, radius - thickness / 2, angle, angle - Math.PI * 2 * value);
    }
    ctx.lineWidth = thickness;
    ctx.strokeStyle = this.options.emptyFill;
    ctx.stroke();
    ctx.restore();
};

Progresser.prototype.drawAnimated = function(value) {
    this.emit('progress-animation-start', { value: value });

    let start = performance.now(),
        duration = parseFloat(this.options.animation.duration) || 1200,
        initial = this.lastFrameValue,
        frame = function(timestamp) {
            let progress = Math.min(1, (timestamp - start) / duration),
                stepValue = initial * (1 - progress) + value * progress;

            this.drawFrame(stepValue);
            this.emit('progress-animation-change', {
                progress: progress,
                value: stepValue
            });

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(frame);
                return;
            }

            this.animationFrame = null;
            if (this.options.animation.callback) { this.options.animation.callback(); }
            this.emit('progress-animation-end', { value: value });
        }.bind(this);

    this.animationFrame = requestAnimationFrame(frame);
};

Progresser.prototype.getThickness = function() {
    return typeof this.options.thickness === 'number' ? this.options.thickness : this.options.size / 14;
};

Progresser.prototype.destroy = function() {
    if (this.animationFrame !== null) { cancelAnimationFrame(this.animationFrame); }
    if (this.canvas.parentNode) { this.canvas.parentNode.removeChild(this.canvas); }
    this.animationFrame = null;
};

export default Progresser;

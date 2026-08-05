(() => {
  var Chart = function(s) {
    function v(a, c, b) {
      a = A((a - c.graphMin) / (c.steps * c.stepValue), 1, 0);
      return b * c.steps * a;
    }
    function x(a, c, b, e) {
      function h() {
        g += f;
        var k = a.animation ? A(d(g), null, 0) : 1;
        e.clearRect(0, 0, q, u);
        a.scaleOverlay ? (b(k), c()) : (c(), b(k));
        if (1 >= g) D(h);
        else if ("function" == typeof a.onAnimationComplete) a.onAnimationComplete();
      }
      var f = a.animation ? 1 / A(a.animationSteps, Number.MAX_VALUE, 1) : 1, d = B[a.animationEasing], g = a.animation ? 0 : 1;
      "function" !== typeof c && (c = function() {
      });
      D(h);
    }
    function C(a, c, b, e, h, f) {
      var d;
      a = Math.floor(Math.log(e - h) / Math.LN10);
      h = Math.floor(h / (1 * Math.pow(10, a))) * Math.pow(10, a);
      e = Math.ceil(e / (1 * Math.pow(10, a))) * Math.pow(10, a) - h;
      a = Math.pow(10, a);
      for (d = Math.round(e / a); d < b || d > c; ) a = d < b ? a / 2 : 2 * a, d = Math.round(e / a);
      c = [];
      z(f, c, d, h, a);
      return { steps: d, stepValue: a, graphMin: h, labels: c };
    }
    function z(a, c, b, e, h) {
      if (a) for (var f = 1; f < b + 1; f++) c.push(E(a, { value: (e + h * f).toFixed(0 != h % 1 ? h.toString().split(".")[1].length : 0) }));
    }
    function A(a, c, b) {
      return !isNaN(parseFloat(c)) && isFinite(c) && a > c ? c : !isNaN(parseFloat(b)) && isFinite(b) && a < b ? b : a;
    }
    function y(a, c) {
      var b = {}, e;
      for (e in a) b[e] = a[e];
      for (e in c) b[e] = c[e];
      return b;
    }
    function E(a, c) {
      var sourceElement = !/\W/.test(a) ? document.getElementById(a) : null;
      var template = sourceElement ? sourceElement.innerHTML : a;
      var render = function(data) {
        return template.replace(/<%=\s*([\w.]+)\s*%>/g, function(match, path) {
          return path.split(".").reduce(function(value, key) {
            return value == null ? "" : value[key];
          }, data || {});
        });
      };
      return c ? render(c) : render;
    }
    var r = this, B = { linear: function(a) {
      return a;
    }, easeInQuad: function(a) {
      return a * a;
    }, easeOutQuad: function(a) {
      return -1 * a * (a - 2);
    }, easeInOutQuad: function(a) {
      return 1 > (a /= 0.5) ? 0.5 * a * a : -0.5 * (--a * (a - 2) - 1);
    }, easeInCubic: function(a) {
      return a * a * a;
    }, easeOutCubic: function(a) {
      return 1 * ((a = a / 1 - 1) * a * a + 1);
    }, easeInOutCubic: function(a) {
      return 1 > (a /= 0.5) ? 0.5 * a * a * a : 0.5 * ((a -= 2) * a * a + 2);
    }, easeInQuart: function(a) {
      return a * a * a * a;
    }, easeOutQuart: function(a) {
      return -1 * ((a = a / 1 - 1) * a * a * a - 1);
    }, easeInOutQuart: function(a) {
      return 1 > (a /= 0.5) ? 0.5 * a * a * a * a : -0.5 * ((a -= 2) * a * a * a - 2);
    }, easeInQuint: function(a) {
      return 1 * (a /= 1) * a * a * a * a;
    }, easeOutQuint: function(a) {
      return 1 * ((a = a / 1 - 1) * a * a * a * a + 1);
    }, easeInOutQuint: function(a) {
      return 1 > (a /= 0.5) ? 0.5 * a * a * a * a * a : 0.5 * ((a -= 2) * a * a * a * a + 2);
    }, easeInSine: function(a) {
      return -1 * Math.cos(a / 1 * (Math.PI / 2)) + 1;
    }, easeOutSine: function(a) {
      return 1 * Math.sin(a / 1 * (Math.PI / 2));
    }, easeInOutSine: function(a) {
      return -0.5 * (Math.cos(Math.PI * a / 1) - 1);
    }, easeInExpo: function(a) {
      return 0 == a ? 1 : 1 * Math.pow(2, 10 * (a / 1 - 1));
    }, easeOutExpo: function(a) {
      return 1 == a ? 1 : 1 * (-Math.pow(2, -10 * a / 1) + 1);
    }, easeInOutExpo: function(a) {
      return 0 == a ? 0 : 1 == a ? 1 : 1 > (a /= 0.5) ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (-Math.pow(2, -10 * --a) + 2);
    }, easeInCirc: function(a) {
      return 1 <= a ? a : -1 * (Math.sqrt(1 - (a /= 1) * a) - 1);
    }, easeOutCirc: function(a) {
      return 1 * Math.sqrt(1 - (a = a / 1 - 1) * a);
    }, easeInOutCirc: function(a) {
      return 1 > (a /= 0.5) ? -0.5 * (Math.sqrt(1 - a * a) - 1) : 0.5 * (Math.sqrt(1 - (a -= 2) * a) + 1);
    }, easeInElastic: function(a) {
      var c = 1.70158, b = 0, e = 1;
      if (0 == a) return 0;
      if (1 == (a /= 1)) return 1;
      b || (b = 0.3);
      e < Math.abs(1) ? (e = 1, c = b / 4) : c = b / (2 * Math.PI) * Math.asin(1 / e);
      return -(e * Math.pow(2, 10 * (a -= 1)) * Math.sin((1 * a - c) * 2 * Math.PI / b));
    }, easeOutElastic: function(a) {
      var c = 1.70158, b = 0, e = 1;
      if (0 == a) return 0;
      if (1 == (a /= 1)) return 1;
      b || (b = 0.3);
      e < Math.abs(1) ? (e = 1, c = b / 4) : c = b / (2 * Math.PI) * Math.asin(1 / e);
      return e * Math.pow(2, -10 * a) * Math.sin((1 * a - c) * 2 * Math.PI / b) + 1;
    }, easeInOutElastic: function(a) {
      var c = 1.70158, b = 0, e = 1;
      if (0 == a) return 0;
      if (2 == (a /= 0.5)) return 1;
      b || (b = 1 * 0.3 * 1.5);
      e < Math.abs(1) ? (e = 1, c = b / 4) : c = b / (2 * Math.PI) * Math.asin(1 / e);
      return 1 > a ? -0.5 * e * Math.pow(2, 10 * (a -= 1)) * Math.sin((1 * a - c) * 2 * Math.PI / b) : 0.5 * e * Math.pow(2, -10 * (a -= 1)) * Math.sin((1 * a - c) * 2 * Math.PI / b) + 1;
    }, easeInBack: function(a) {
      return 1 * (a /= 1) * a * (2.70158 * a - 1.70158);
    }, easeOutBack: function(a) {
      return 1 * ((a = a / 1 - 1) * a * (2.70158 * a + 1.70158) + 1);
    }, easeInOutBack: function(a) {
      var c = 1.70158;
      return 1 > (a /= 0.5) ? 0.5 * a * a * (((c *= 1.525) + 1) * a - c) : 0.5 * ((a -= 2) * a * (((c *= 1.525) + 1) * a + c) + 2);
    }, easeInBounce: function(a) {
      return 1 - B.easeOutBounce(1 - a);
    }, easeOutBounce: function(a) {
      return (a /= 1) < 1 / 2.75 ? 1 * 7.5625 * a * a : a < 2 / 2.75 ? 1 * (7.5625 * (a -= 1.5 / 2.75) * a + 0.75) : a < 2.5 / 2.75 ? 1 * (7.5625 * (a -= 2.25 / 2.75) * a + 0.9375) : 1 * (7.5625 * (a -= 2.625 / 2.75) * a + 0.984375);
    }, easeInOutBounce: function(a) {
      return 0.5 > a ? 0.5 * B.easeInBounce(2 * a) : 0.5 * B.easeOutBounce(2 * a - 1) + 0.5;
    } }, q = s.canvas.width, u = s.canvas.height;
    window.devicePixelRatio && (s.canvas.style.width = q + "px", s.canvas.style.height = u + "px", s.canvas.height = u * window.devicePixelRatio, s.canvas.width = q * window.devicePixelRatio, s.scale(window.devicePixelRatio, window.devicePixelRatio));
    this.PolarArea = function(a, c) {
      r.PolarArea.defaults = {
        scaleOverlay: true,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleShowLine: true,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel: "<%=value%>",
        scaleFontFamily: "'Arial'",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        scaleShowLabelBackdrop: true,
        scaleBackdropColor: "rgba(255,255,255,0.75)",
        scaleBackdropPaddingY: 2,
        scaleBackdropPaddingX: 2,
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 2,
        animation: true,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        onAnimationComplete: null
      };
      var b = c ? y(r.PolarArea.defaults, c) : r.PolarArea.defaults;
      return new G(a, b, s);
    };
    this.Radar = function(a, c) {
      r.Radar.defaults = {
        scaleOverlay: false,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleShowLine: true,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: false,
        scaleLabel: "<%=value%>",
        scaleFontFamily: "'Arial'",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        scaleShowLabelBackdrop: true,
        scaleBackdropColor: "rgba(255,255,255,0.75)",
        scaleBackdropPaddingY: 2,
        scaleBackdropPaddingX: 2,
        angleShowLineOut: true,
        angleLineColor: "rgba(0,0,0,.1)",
        angleLineWidth: 1,
        pointLabelFontFamily: "'Arial'",
        pointLabelFontStyle: "normal",
        pointLabelFontSize: 12,
        pointLabelFontColor: "#666",
        pointDot: true,
        pointDotRadius: 3,
        pointDotStrokeWidth: 1,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        animation: true,
        animationSteps: 60,
        animationEasing: "easeOutQuart",
        onAnimationComplete: null
      };
      var b = c ? y(r.Radar.defaults, c) : r.Radar.defaults;
      return new H(a, b, s);
    };
    this.Pie = function(a, c) {
      r.Pie.defaults = { segmentShowStroke: true, segmentStrokeColor: "#fff", segmentStrokeWidth: 2, animation: true, animationSteps: 100, animationEasing: "easeOutBounce", animateRotate: true, animateScale: false, onAnimationComplete: null };
      var b = c ? y(r.Pie.defaults, c) : r.Pie.defaults;
      return new I(a, b, s);
    };
    this.Doughnut = function(a, c) {
      r.Doughnut.defaults = {
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50,
        animation: true,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        onAnimationComplete: null
      };
      var b = c ? y(r.Doughnut.defaults, c) : r.Doughnut.defaults;
      return new J(a, b, s);
    };
    this.Line = function(a, c) {
      r.Line.defaults = {
        scaleOverlay: false,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel: "<%=value%>",
        scaleFontFamily: "'Arial'",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        bezierCurve: true,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 2,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        animation: true,
        animationSteps: 60,
        animationEasing: "easeOutQuart",
        onAnimationComplete: null
      };
      var b = c ? y(r.Line.defaults, c) : r.Line.defaults;
      return new K(a, b, s);
    };
    this.Bar = function(a, c) {
      r.Bar.defaults = {
        scaleOverlay: false,
        scaleOverride: false,
        scaleSteps: null,
        scaleStepWidth: null,
        scaleStartValue: null,
        scaleLineColor: "rgba(0,0,0,.1)",
        scaleLineWidth: 1,
        scaleShowLabels: true,
        scaleLabel: "<%=value%>",
        scaleFontFamily: "'Arial'",
        scaleFontSize: 12,
        scaleFontStyle: "normal",
        scaleFontColor: "#666",
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        barShowStroke: true,
        barStrokeWidth: 2,
        barValueSpacing: 5,
        barDatasetSpacing: 1,
        animation: true,
        animationSteps: 60,
        animationEasing: "easeOutQuart",
        onAnimationComplete: null
      };
      var b = c ? y(r.Bar.defaults, c) : r.Bar.defaults;
      return new L(a, b, s);
    };
    var G = function(a, c, b) {
      var e, h, f, d, g, k, j, l, m;
      g = Math.min.apply(Math, [q, u]) / 2;
      g -= Math.max.apply(Math, [0.5 * c.scaleFontSize, 0.5 * c.scaleLineWidth]);
      d = 2 * c.scaleFontSize;
      c.scaleShowLabelBackdrop && (d += 2 * c.scaleBackdropPaddingY, g -= 1.5 * c.scaleBackdropPaddingY);
      l = g;
      d = d ? d : 5;
      e = Number.MIN_VALUE;
      h = Number.MAX_VALUE;
      for (f = 0; f < a.length; f++) a[f].value > e && (e = a[f].value), a[f].value < h && (h = a[f].value);
      f = Math.floor(l / (0.66 * d));
      d = Math.floor(0.5 * (l / d));
      m = c.scaleShowLabels ? c.scaleLabel : null;
      c.scaleOverride ? (j = { steps: c.scaleSteps, stepValue: c.scaleStepWidth, graphMin: c.scaleStartValue, labels: [] }, z(m, j.labels, j.steps, c.scaleStartValue, c.scaleStepWidth)) : j = C(
        l,
        f,
        d,
        e,
        h,
        m
      );
      k = g / j.steps;
      x(c, function() {
        for (var a2 = 0; a2 < j.steps; a2++) if (c.scaleShowLine && (b.beginPath(), b.arc(q / 2, u / 2, k * (a2 + 1), 0, 2 * Math.PI, true), b.strokeStyle = c.scaleLineColor, b.lineWidth = c.scaleLineWidth, b.stroke()), c.scaleShowLabels) {
          b.textAlign = "center";
          b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily;
          var e2 = j.labels[a2];
          if (c.scaleShowLabelBackdrop) {
            var d2 = b.measureText(e2).width;
            b.fillStyle = c.scaleBackdropColor;
            b.beginPath();
            b.rect(Math.round(q / 2 - d2 / 2 - c.scaleBackdropPaddingX), Math.round(u / 2 - k * (a2 + 1) - 0.5 * c.scaleFontSize - c.scaleBackdropPaddingY), Math.round(d2 + 2 * c.scaleBackdropPaddingX), Math.round(c.scaleFontSize + 2 * c.scaleBackdropPaddingY));
            b.fill();
          }
          b.textBaseline = "middle";
          b.fillStyle = c.scaleFontColor;
          b.fillText(e2, q / 2, u / 2 - k * (a2 + 1));
        }
      }, function(e2) {
        var d2 = -Math.PI / 2, g2 = 2 * Math.PI / a.length, f2 = 1, h2 = 1;
        c.animation && (c.animateScale && (f2 = e2), c.animateRotate && (h2 = e2));
        for (e2 = 0; e2 < a.length; e2++) b.beginPath(), b.arc(q / 2, u / 2, f2 * v(a[e2].value, j, k), d2, d2 + h2 * g2, false), b.lineTo(q / 2, u / 2), b.closePath(), b.fillStyle = a[e2].color, b.fill(), c.segmentShowStroke && (b.strokeStyle = c.segmentStrokeColor, b.lineWidth = c.segmentStrokeWidth, b.stroke()), d2 += h2 * g2;
      }, b);
    }, H = function(a, c, b) {
      var e, h, f, d, g, k, j, l, m;
      a.labels || (a.labels = []);
      g = Math.min.apply(Math, [q, u]) / 2;
      d = 2 * c.scaleFontSize;
      for (e = l = 0; e < a.labels.length; e++) b.font = c.pointLabelFontStyle + " " + c.pointLabelFontSize + "px " + c.pointLabelFontFamily, h = b.measureText(a.labels[e]).width, h > l && (l = h);
      g -= Math.max.apply(Math, [l, 1.5 * (c.pointLabelFontSize / 2)]);
      g -= c.pointLabelFontSize;
      l = g = A(g, null, 0);
      d = d ? d : 5;
      e = Number.MIN_VALUE;
      h = Number.MAX_VALUE;
      for (f = 0; f < a.datasets.length; f++) for (m = 0; m < a.datasets[f].data.length; m++) a.datasets[f].data[m] > e && (e = a.datasets[f].data[m]), a.datasets[f].data[m] < h && (h = a.datasets[f].data[m]);
      f = Math.floor(l / (0.66 * d));
      d = Math.floor(0.5 * (l / d));
      m = c.scaleShowLabels ? c.scaleLabel : null;
      c.scaleOverride ? (j = { steps: c.scaleSteps, stepValue: c.scaleStepWidth, graphMin: c.scaleStartValue, labels: [] }, z(m, j.labels, j.steps, c.scaleStartValue, c.scaleStepWidth)) : j = C(l, f, d, e, h, m);
      k = g / j.steps;
      x(c, function() {
        var e2 = 2 * Math.PI / a.datasets[0].data.length;
        b.save();
        b.translate(q / 2, u / 2);
        if (c.angleShowLineOut) {
          b.strokeStyle = c.angleLineColor;
          b.lineWidth = c.angleLineWidth;
          for (var d2 = 0; d2 < a.datasets[0].data.length; d2++) b.rotate(e2), b.beginPath(), b.moveTo(0, 0), b.lineTo(0, -g), b.stroke();
        }
        for (d2 = 0; d2 < j.steps; d2++) {
          b.beginPath();
          if (c.scaleShowLine) {
            b.strokeStyle = c.scaleLineColor;
            b.lineWidth = c.scaleLineWidth;
            b.moveTo(0, -k * (d2 + 1));
            for (var f2 = 0; f2 < a.datasets[0].data.length; f2++) b.rotate(e2), b.lineTo(0, -k * (d2 + 1));
            b.closePath();
            b.stroke();
          }
          c.scaleShowLabels && (b.textAlign = "center", b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily, b.textBaseline = "middle", c.scaleShowLabelBackdrop && (f2 = b.measureText(j.labels[d2]).width, b.fillStyle = c.scaleBackdropColor, b.beginPath(), b.rect(Math.round(-f2 / 2 - c.scaleBackdropPaddingX), Math.round(-k * (d2 + 1) - 0.5 * c.scaleFontSize - c.scaleBackdropPaddingY), Math.round(f2 + 2 * c.scaleBackdropPaddingX), Math.round(c.scaleFontSize + 2 * c.scaleBackdropPaddingY)), b.fill()), b.fillStyle = c.scaleFontColor, b.fillText(j.labels[d2], 0, -k * (d2 + 1)));
        }
        for (d2 = 0; d2 < a.labels.length; d2++) {
          b.font = c.pointLabelFontStyle + " " + c.pointLabelFontSize + "px " + c.pointLabelFontFamily;
          b.fillStyle = c.pointLabelFontColor;
          var f2 = Math.sin(e2 * d2) * (g + c.pointLabelFontSize), h2 = Math.cos(e2 * d2) * (g + c.pointLabelFontSize);
          b.textAlign = e2 * d2 == Math.PI || 0 == e2 * d2 ? "center" : e2 * d2 > Math.PI ? "right" : "left";
          b.textBaseline = "middle";
          b.fillText(a.labels[d2], f2, -h2);
        }
        b.restore();
      }, function(d2) {
        var e2 = 2 * Math.PI / a.datasets[0].data.length;
        b.save();
        b.translate(q / 2, u / 2);
        for (var g2 = 0; g2 < a.datasets.length; g2++) {
          b.beginPath();
          b.moveTo(0, d2 * -1 * v(a.datasets[g2].data[0], j, k));
          for (var f2 = 1; f2 < a.datasets[g2].data.length; f2++) b.rotate(e2), b.lineTo(0, d2 * -1 * v(a.datasets[g2].data[f2], j, k));
          b.closePath();
          b.fillStyle = a.datasets[g2].fillColor;
          b.strokeStyle = a.datasets[g2].strokeColor;
          b.lineWidth = c.datasetStrokeWidth;
          b.fill();
          b.stroke();
          if (c.pointDot) {
            b.fillStyle = a.datasets[g2].pointColor;
            b.strokeStyle = a.datasets[g2].pointStrokeColor;
            b.lineWidth = c.pointDotStrokeWidth;
            for (f2 = 0; f2 < a.datasets[g2].data.length; f2++) b.rotate(e2), b.beginPath(), b.arc(0, d2 * -1 * v(a.datasets[g2].data[f2], j, k), c.pointDotRadius, 2 * Math.PI, false), b.fill(), b.stroke();
          }
          b.rotate(e2);
        }
        b.restore();
      }, b);
    }, I = function(a, c, b) {
      for (var e = 0, h = Math.min.apply(Math, [u / 2, q / 2]) - 5, f = 0; f < a.length; f++) e += a[f].value;
      x(c, null, function(d) {
        var g = -Math.PI / 2, f2 = 1, j = 1;
        c.animation && (c.animateScale && (f2 = d), c.animateRotate && (j = d));
        for (d = 0; d < a.length; d++) {
          var l = j * a[d].value / e * 2 * Math.PI;
          b.beginPath();
          b.arc(q / 2, u / 2, f2 * h, g, g + l);
          b.lineTo(q / 2, u / 2);
          b.closePath();
          b.fillStyle = a[d].color;
          b.fill();
          c.segmentShowStroke && (b.lineWidth = c.segmentStrokeWidth, b.strokeStyle = c.segmentStrokeColor, b.stroke());
          g += l;
        }
      }, b);
    }, J = function(a, c, b) {
      for (var e = 0, h = Math.min.apply(Math, [u / 2, q / 2]) - 5, f = h * (c.percentageInnerCutout / 100), d = 0; d < a.length; d++) e += a[d].value;
      x(c, null, function(d2) {
        var k = -Math.PI / 2, j = 1, l = 1;
        c.animation && (c.animateScale && (j = d2), c.animateRotate && (l = d2));
        for (d2 = 0; d2 < a.length; d2++) {
          var m = l * a[d2].value / e * 2 * Math.PI;
          b.beginPath();
          b.arc(q / 2, u / 2, j * h, k, k + m, false);
          b.arc(q / 2, u / 2, j * f, k + m, k, true);
          b.closePath();
          b.fillStyle = a[d2].color;
          b.fill();
          c.segmentShowStroke && (b.lineWidth = c.segmentStrokeWidth, b.strokeStyle = c.segmentStrokeColor, b.stroke());
          k += m;
        }
      }, b);
    }, K = function(a, c, b) {
      var e, h, f, d, g, k, j, l, m, t, r2, n, p, s2 = 0;
      g = u;
      b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily;
      t = 1;
      for (d = 0; d < a.labels.length; d++) e = b.measureText(a.labels[d]).width, t = e > t ? e : t;
      q / a.labels.length < t ? (s2 = 45, q / a.labels.length < Math.cos(s2) * t ? (s2 = 90, g -= t) : g -= Math.sin(s2) * t) : g -= c.scaleFontSize;
      d = c.scaleFontSize;
      g = g - 5 - d;
      e = Number.MIN_VALUE;
      h = Number.MAX_VALUE;
      for (f = 0; f < a.datasets.length; f++) for (l = 0; l < a.datasets[f].data.length; l++) a.datasets[f].data[l] > e && (e = a.datasets[f].data[l]), a.datasets[f].data[l] < h && (h = a.datasets[f].data[l]);
      f = Math.floor(g / (0.66 * d));
      d = Math.floor(0.5 * (g / d));
      l = c.scaleShowLabels ? c.scaleLabel : "";
      c.scaleOverride ? (j = { steps: c.scaleSteps, stepValue: c.scaleStepWidth, graphMin: c.scaleStartValue, labels: [] }, z(l, j.labels, j.steps, c.scaleStartValue, c.scaleStepWidth)) : j = C(g, f, d, e, h, l);
      k = Math.floor(g / j.steps);
      d = 1;
      if (c.scaleShowLabels) {
        b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily;
        for (e = 0; e < j.labels.length; e++) h = b.measureText(j.labels[e]).width, d = h > d ? h : d;
        d += 10;
      }
      r2 = q - d - t;
      m = Math.floor(r2 / (a.labels.length - 1));
      n = q - t / 2 - r2;
      p = g + c.scaleFontSize / 2;
      x(c, function() {
        b.lineWidth = c.scaleLineWidth;
        b.strokeStyle = c.scaleLineColor;
        b.beginPath();
        b.moveTo(q - t / 2 + 5, p);
        b.lineTo(q - t / 2 - r2 - 5, p);
        b.stroke();
        0 < s2 ? (b.save(), b.textAlign = "right") : b.textAlign = "center";
        b.fillStyle = c.scaleFontColor;
        for (var d2 = 0; d2 < a.labels.length; d2++) b.save(), 0 < s2 ? (b.translate(n + d2 * m, p + c.scaleFontSize), b.rotate(-(s2 * (Math.PI / 180))), b.fillText(
          a.labels[d2],
          0,
          0
        ), b.restore()) : b.fillText(a.labels[d2], n + d2 * m, p + c.scaleFontSize + 3), b.beginPath(), b.moveTo(n + d2 * m, p + 3), c.scaleShowGridLines && 0 < d2 ? (b.lineWidth = c.scaleGridLineWidth, b.strokeStyle = c.scaleGridLineColor, b.lineTo(n + d2 * m, 5)) : b.lineTo(n + d2 * m, p + 3), b.stroke();
        b.lineWidth = c.scaleLineWidth;
        b.strokeStyle = c.scaleLineColor;
        b.beginPath();
        b.moveTo(n, p + 5);
        b.lineTo(n, 5);
        b.stroke();
        b.textAlign = "right";
        b.textBaseline = "middle";
        for (d2 = 0; d2 < j.steps; d2++) b.beginPath(), b.moveTo(n - 3, p - (d2 + 1) * k), c.scaleShowGridLines ? (b.lineWidth = c.scaleGridLineWidth, b.strokeStyle = c.scaleGridLineColor, b.lineTo(n + r2 + 5, p - (d2 + 1) * k)) : b.lineTo(n - 0.5, p - (d2 + 1) * k), b.stroke(), c.scaleShowLabels && b.fillText(j.labels[d2], n - 8, p - (d2 + 1) * k);
      }, function(d2) {
        function e2(b2, c2) {
          return p - d2 * v(a.datasets[b2].data[c2], j, k);
        }
        for (var f2 = 0; f2 < a.datasets.length; f2++) {
          b.strokeStyle = a.datasets[f2].strokeColor;
          b.lineWidth = c.datasetStrokeWidth;
          b.beginPath();
          b.moveTo(n, p - d2 * v(a.datasets[f2].data[0], j, k));
          for (var g2 = 1; g2 < a.datasets[f2].data.length; g2++) c.bezierCurve ? b.bezierCurveTo(
            n + m * (g2 - 0.5),
            e2(f2, g2 - 1),
            n + m * (g2 - 0.5),
            e2(f2, g2),
            n + m * g2,
            e2(f2, g2)
          ) : b.lineTo(n + m * g2, e2(f2, g2));
          b.stroke();
          c.datasetFill ? (b.lineTo(n + m * (a.datasets[f2].data.length - 1), p), b.lineTo(n, p), b.closePath(), b.fillStyle = a.datasets[f2].fillColor, b.fill()) : b.closePath();
          if (c.pointDot) {
            b.fillStyle = a.datasets[f2].pointColor;
            b.strokeStyle = a.datasets[f2].pointStrokeColor;
            b.lineWidth = c.pointDotStrokeWidth;
            for (g2 = 0; g2 < a.datasets[f2].data.length; g2++) b.beginPath(), b.arc(n + m * g2, p - d2 * v(a.datasets[f2].data[g2], j, k), c.pointDotRadius, 0, 2 * Math.PI, true), b.fill(), b.stroke();
          }
        }
      }, b);
    }, L = function(a, c, b) {
      var e, h, f, d, g, k, j, l, m, t, r2, n, p, s2, w = 0;
      g = u;
      b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily;
      t = 1;
      for (d = 0; d < a.labels.length; d++) e = b.measureText(a.labels[d]).width, t = e > t ? e : t;
      q / a.labels.length < t ? (w = 45, q / a.labels.length < Math.cos(w) * t ? (w = 90, g -= t) : g -= Math.sin(w) * t) : g -= c.scaleFontSize;
      d = c.scaleFontSize;
      g = g - 5 - d;
      e = Number.MIN_VALUE;
      h = Number.MAX_VALUE;
      for (f = 0; f < a.datasets.length; f++) for (l = 0; l < a.datasets[f].data.length; l++) a.datasets[f].data[l] > e && (e = a.datasets[f].data[l]), a.datasets[f].data[l] < h && (h = a.datasets[f].data[l]);
      f = Math.floor(g / (0.66 * d));
      d = Math.floor(0.5 * (g / d));
      l = c.scaleShowLabels ? c.scaleLabel : "";
      c.scaleOverride ? (j = { steps: c.scaleSteps, stepValue: c.scaleStepWidth, graphMin: c.scaleStartValue, labels: [] }, z(l, j.labels, j.steps, c.scaleStartValue, c.scaleStepWidth)) : j = C(g, f, d, e, h, l);
      k = Math.floor(g / j.steps);
      d = 1;
      if (c.scaleShowLabels) {
        b.font = c.scaleFontStyle + " " + c.scaleFontSize + "px " + c.scaleFontFamily;
        for (e = 0; e < j.labels.length; e++) h = b.measureText(j.labels[e]).width, d = h > d ? h : d;
        d += 10;
      }
      r2 = q - d - t;
      m = Math.floor(r2 / a.labels.length);
      s2 = (m - 2 * c.scaleGridLineWidth - 2 * c.barValueSpacing - (c.barDatasetSpacing * a.datasets.length - 1) - (c.barStrokeWidth / 2 * a.datasets.length - 1)) / a.datasets.length;
      n = q - t / 2 - r2;
      p = g + c.scaleFontSize / 2;
      x(c, function() {
        b.lineWidth = c.scaleLineWidth;
        b.strokeStyle = c.scaleLineColor;
        b.beginPath();
        b.moveTo(q - t / 2 + 5, p);
        b.lineTo(q - t / 2 - r2 - 5, p);
        b.stroke();
        0 < w ? (b.save(), b.textAlign = "right") : b.textAlign = "center";
        b.fillStyle = c.scaleFontColor;
        for (var d2 = 0; d2 < a.labels.length; d2++) b.save(), 0 < w ? (b.translate(n + d2 * m, p + c.scaleFontSize), b.rotate(-(w * (Math.PI / 180))), b.fillText(a.labels[d2], 0, 0), b.restore()) : b.fillText(a.labels[d2], n + d2 * m + m / 2, p + c.scaleFontSize + 3), b.beginPath(), b.moveTo(n + (d2 + 1) * m, p + 3), b.lineWidth = c.scaleGridLineWidth, b.strokeStyle = c.scaleGridLineColor, b.lineTo(n + (d2 + 1) * m, 5), b.stroke();
        b.lineWidth = c.scaleLineWidth;
        b.strokeStyle = c.scaleLineColor;
        b.beginPath();
        b.moveTo(n, p + 5);
        b.lineTo(n, 5);
        b.stroke();
        b.textAlign = "right";
        b.textBaseline = "middle";
        for (d2 = 0; d2 < j.steps; d2++) b.beginPath(), b.moveTo(n - 3, p - (d2 + 1) * k), c.scaleShowGridLines ? (b.lineWidth = c.scaleGridLineWidth, b.strokeStyle = c.scaleGridLineColor, b.lineTo(n + r2 + 5, p - (d2 + 1) * k)) : b.lineTo(n - 0.5, p - (d2 + 1) * k), b.stroke(), c.scaleShowLabels && b.fillText(j.labels[d2], n - 8, p - (d2 + 1) * k);
      }, function(d2) {
        b.lineWidth = c.barStrokeWidth;
        for (var e2 = 0; e2 < a.datasets.length; e2++) {
          b.fillStyle = a.datasets[e2].fillColor;
          b.strokeStyle = a.datasets[e2].strokeColor;
          for (var f2 = 0; f2 < a.datasets[e2].data.length; f2++) {
            var g2 = n + c.barValueSpacing + m * f2 + s2 * e2 + c.barDatasetSpacing * e2 + c.barStrokeWidth * e2;
            b.beginPath();
            b.moveTo(g2, p);
            b.lineTo(g2, p - d2 * v(a.datasets[e2].data[f2], j, k) + c.barStrokeWidth / 2);
            b.lineTo(g2 + s2, p - d2 * v(a.datasets[e2].data[f2], j, k) + c.barStrokeWidth / 2);
            b.lineTo(g2 + s2, p);
            c.barShowStroke && b.stroke();
            b.closePath();
            b.fill();
          }
        }
      }, b);
    }, D = window.requestAnimationFrame.bind(window), F = {};
  };
  window.Chart = Chart;
})();

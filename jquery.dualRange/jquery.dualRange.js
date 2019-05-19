(function ($) {
    var styleSheet = null;

    function addStylesheetRules(rules) {
        if (!styleSheet) {
            var styleEl = document.createElement('style');
            document.head.appendChild(styleEl);
            styleSheet = styleEl.sheet;
            window.styleSheet = styleSheet;
        }
        $.each(rules, function (idx, rule) {
            addStylesheetRule(styleSheet, rule.selectors, rule.properties);
        });
    }

    function addStylesheetRule(styleSheet, selectors, properties) {
        $.each(selectors, function (idx, selector) {
            $.each(properties, function (k, v) {
                var rule = selector + '{' + k + ":" + v + '}';
                try {
                    var s = styleSheet.insertRule(rule, styleSheet.cssRules.length);
                    console.log('inserted rule:', rule, styleSheet.cssRules[idx]);
                }
                catch (e) {
                    // console.log('non-applicable rule:', e.message);
                }
            });
        });
    }

    function SvgDualRange(options) {
        this.uid = 'slider-' + (Math.floor(Math.random() * 26) + Date.now());
        this.settings = $.extend({
            type: 'classic',
            width: 100,
            height: 10,
            trackHeight: 5
        }, options);
        console.log("create SvgDualRange", options);
        var cfg = this.settings;
        if (typeof cfg.sliderWidth === "undefined" || cfg.sliderWidth === null) {
            cfg.sliderWidth = cfg.height;
        }
        if (typeof cfg.sliderHeight === "undefined" || cfg.sliderHeight === null) {
            cfg.sliderHeight = cfg.sliderWidth;
        }
        cfg.sliderWidth = parseFloat(cfg.sliderWidth);
        cfg.width = parseFloat(cfg.width);
        cfg.height = parseFloat(cfg.height);
        cfg.trackHeight = parseFloat(cfg.trackHeight);
        var slider;
        var track;
        if (cfg.type === "round") {
            slider = '<ellipse id="' + this.uid + '"' +
                ' rx="' + (cfg.sliderWidth / 2) + '"' +
                ' ry="' + (cfg.sliderHeight / 2) + '"' +
                ' cx="0"' +
                ' cy="' + (cfg.height / 2) + '"' +
                '/>';
            track = '<rect class="track" y="' + ((cfg.height - cfg.trackHeight) / 2) + '" height="' + cfg.trackHeight + '"/>';
        }
        else if (cfg.type === "classic") {
            var w = (cfg.sliderWidth / 2), h = (cfg.sliderHeight - w);

            var d = '0,' + (cfg.height - cfg.trackHeight) +
                'l-' + w + ',-' + w +
                'v-' + h +
                'h' + cfg.sliderWidth +
                'v' + h +
                'z';
            slider = '<path id="' + this.uid + '" d="M' + d + 'z"/>';
            track = '<rect class="track" y="' + (cfg.height - cfg.trackHeight) + '" height="' + cfg.trackHeight + '"/>';
        }
        else {
            cfg.height = cfg.sliderWidth = cfg.trackHeight;
            slider = '';
            track = '<rect class="track" y="' + ((cfg.height - cfg.trackHeight) / 2) + '" height="' + cfg.trackHeight + '"/>';
        }
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
            'viewBox="0 0 ' + cfg.width + ' ' + cfg.height + '" preserveAspectRatio="xMidYMin slice"' +
            'width="' + cfg.width + '" height="' + cfg.height + '">' +
            '<defs>' + slider + '</defs>' +
            track +
            '<use class="slider slider1" xlink:href="#' + this.uid + '"/>' +
            '<use class="slider slider2" xlink:href="#' + this.uid + '"/>' +
            '</svg>';
        this.min = 0;
        this.max = 100;
        this.$svg = $(svg);
        this.$track = this.$svg.find('.track');
        this.$slider1 = this.$svg.find('.slider1');
        this.$slider2 = this.$svg.find('.slider2');
    }

    SvgDualRange.prototype = {
        update: function (val1, val2) {
            val1 = typeof val1 === "undefined" || val1 == null ? this.val1 : parseFloat(val1);
            val2 = typeof val2 === "undefined" || val2 == null ? this.val2 : parseFloat(val2);
            this.val1 = Math.min(val1, val2);
            this.val2 = Math.max(val1, val2);
            var x = this.valueToPosition(this.val1);

            this.$track
                .attr('x', x - this.sliderOffset(this.val1))
                .attr('width', this.valueToPosition(this.val2) - this.valueToPosition(this.val1) - this.sliderOffset(this.val2) + this.sliderOffset(this.val1))
            ;
            this.sliderOffset(this.val1);
            this.$slider1.attr('transform', 'translate(' + (this.valueToPosition(this.val1) - this.sliderOffset(this.val1)) + ')');
            this.$slider2.attr('transform', 'translate(' + (this.valueToPosition(this.val2) - this.sliderOffset(this.val2)) + ')');
            return this;
        },
        /**
         * Compute offset to add to slider position to be à the same position as native slider.
         * value === min : slider stick on left
         * value === max : slider stick on right
         * value === (max-min)/2 -> in the middle : slider stck on middle
         */
        sliderOffset: function (val) {
            return this.settings.sliderWidth * (this.valueToPercent(val) - 0.5);
        },
        valueToPercent: function (val) {
            return (val - this.min) / (this.max - this.min);
        },
        /**
         * Convert value to position inside SVG according total SVG width
         * @param val
         * @returns {number}
         */
        valueToPosition: function (val) {
            return this.valueToPercent(val) * this.settings.width;
        },
        attachInputs: function (inputs) {
            console.log("attachInputs", inputs);
            var s = this, c = 'input-' + this.uid;
            var $inputs = $(inputs);
            var $ranges = [
                $($inputs.get(0)),
                $($inputs.get(1))
            ];
            $inputs.on('input change', function () {
                s.update($ranges[0].val(), $ranges[1].val());
            }).addClass(c);

            $.each(['slider1', 'slider2'], function (idx, prefix) {
                $ranges[idx]
                    .on('mouseover touchstart', function () {
                        s.$svg
                            .addClass(prefix + '-hover')
                            .find('.' + prefix)
                            .addClass('hover')
                        ;
                    })
                    .on('mouseout touchend', function () {
                        s.$svg
                            .removeClass(prefix + '-hover')
                            .find('.' + prefix)
                            .removeClass('hover')
                        ;
                    })
                    .on('focus', function () {
                        s.$svg
                            .addClass(prefix + '-focus')
                            .find('.' + prefix)
                            .addClass('focus')
                        ;
                    })
                    .on('blur', function () {
                        s.$svg
                            .removeClass(prefix + '-focus')
                            .find('.' + prefix)
                            .removeClass('focus')
                        ;
                    });
            });

            s.min = this.val1 = Number.MAX_VALUE;
            s.max = this.val2 = Number.MIN_VALUE;
            $inputs.each(function () {
                var $this = $(this), v = parseFloat($this.val());
                s.min = Math.min(parseFloat($this.attr('min')), s.min);
                s.val1 = Math.min(v, s.val1);
                s.max = Math.max(parseFloat($this.attr('max')), s.max);
                s.val2 = Math.max(v, s.val2);
            });
            s.factor = $inputs.parent().width() / 100;
            addStylesheetRules([
                {
                    selectors: [
                        '.' + c + '::-webkit-slider-thumb',
                        '.' + c + '::-moz-range-thumb'
                    ],
                    properties: {
                        padding: '0 0 ' + this.settings.height + 'px ' + this.settings.sliderWidth + 'px',
                    }
                }, {
                    selectors: [
                        '.' + c + '::-ms-thumb'
                    ],
                    properties: {
                        width: this.settings.sliderWidth + 'px',
                        height: this.settings.height + 'px'
                    }
                }
            ]);

            return s.update();
        }
    };

    /**
     * Parse string value of each object properties and return the max interger.
     *
     * @returns {number}
     */
    function maxValue(obj) {
        var values = !obj ? [] : $.map(obj, function (v) {
            return v ? parseFloat(v) : 0;
        });
        return values.length === 0 ? 0 : Math.max.apply(null, values);
    }

    $.fn.dualRange = function (options) {
        var settings = $.extend({
            inputs: '.inputs',
            lower: '.inputs input:first-child',
            upper: '.inputs input:last-child',
            rangeMinOutput: '.rangeMin',
            rangeMaxOutput: '.rangeMax',
            borderColor: '#FFF'
        }, options);

        return this.each(function () {
            var $this = $(this);
            var $inputs = $this.find(settings.inputs);


            var initDualRangeSvgTimer;
            var initDualRangeSvg = function () {
                clearTimeout(initDualRangeSvgTimer);
                var w = $inputs.width(), h = $inputs.outerHeight();
                if (w === 0 || h === 0) {
                    // No width if content is not displayed.
                    // Start a time to fix widget display when it displayed
                    initDualRangeSvgTimer = setTimeout(function () {
                        initDualRangeSvg();
                    }, 200);
                    return;
                }

                var svgDualRange = new SvgDualRange({
                    type: $this.data('slider'),
                    width: $inputs.outerWidth(),
                    height: $inputs.outerHeight(),
                    sliderWidth: $this.data('sliderWidth'),
                    sliderHeight: $this.data('sliderHeight'),
                    trackHeight: $this.data('trackHeight')
                }).attachInputs(
                    $this.find(settings.lower + ',' + settings.upper)
                );
                svgDualRange.$svg.css($inputs.css([
                    // List here CSS values to copy from <div/> which wrapping inputs, on SVG
                    // NB: shorthand css value retrieval do not work on IE, so get each value
                    'marginTop',
                    'marginRight',
                    'marginBottom',
                    'marginLeft'
                ]));
                $inputs
                    .after(svgDualRange.$svg)
                    .css({
                        'position': 'absolute',
                        'padding': 0,
                        'width': w,
                        'height': h
                    });
            };
            initDualRangeSvg();

            var tracker = {
                lower: {
                    dom: $this.find(settings.lower).get(0)
                },
                upper: {
                    dom: $this.find(settings.upper).get(0)
                }
            };

            if (parseFloat(tracker.lower.dom.value) > parseFloat(tracker.upper.dom.value)) {
                var v = tracker.lower.dom.value;
                tracker.lower.dom.value = tracker.upper.dom.value;
                tracker.upper.dom.value = v;
            }

            tracker.lower.originalMax = tracker.lower.dom.max;
            tracker.upper.originalMin = tracker.upper.dom.min;

            tracker.min = parseFloat(tracker.lower.dom.min);
            tracker.max = parseFloat(tracker.upper.dom.max);
            tracker.all = tracker.max - tracker.min;

            var $rangeOuputMin = $this.find(settings.rangeMinOutput);
            var $rangeOutputMax = $this.find(settings.rangeMaxOutput);

            var updateOutput = function ($output, value) {
                var outputPattern = $output.attr('data-pattern') || '#';
                $output.html(outputPattern.replace('#', value));
            };

            var update = function () {
                var rangeMin = parseFloat(tracker.lower.dom.value);
                var rangeMax = parseFloat(tracker.upper.dom.value);

                var mid = Math.round((rangeMax - rangeMin) / 2) + rangeMin;

                var lowerWidth = 100 * (mid - tracker.min) / tracker.all;
                var upperWidth = 100 * (tracker.max - mid) / tracker.all;

                tracker.lower.dom.max = tracker.upper.dom.min = mid;

                $(tracker.lower.dom).css('width', lowerWidth + "%");
                $(tracker.upper.dom).css('width', upperWidth + "%");

                updateOutput($rangeOuputMin, rangeMin);
                updateOutput($rangeOutputMax, rangeMax);
            };


            var timeout;
            $this.find('[type=range]').on('input change', function () {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    update();
                }, 10);
            });
            update();
        });
    };


})(jQuery);

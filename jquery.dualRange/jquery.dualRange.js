(function ($) {
    /**
     * Parse les chaînes de caractères passées de chacune des valeurs des propriétés de l'objet
     * et renvoi la valeur numérique la plus grande.
     *
     * @returns {number}
     */
    function maxValue(obj) {
        var values = !obj ? [] : $.map(obj, function (v, k) {
            return v ? parseInt(v, 10) : 0;
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
            var tracker = {
                color: $inputs.css('backgroundColor'),
                height: parseInt($inputs.height(), 10),
                padding: maxValue($inputs.css(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'])),
                lower: {
                    dom: $this.find(settings.lower).get(0)
                },
                upper: {
                    dom: $this.find(settings.upper).get(0)
                }
            };
            $inputs.css('background', 'transparent');
            var slider = {
                color: $inputs.css('borderTopColor'),
                width: maxValue($inputs.css(['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'])),
                radius: tracker.height / 2 + tracker.padding
            };
            slider.start = slider.radius + slider.width;

            $inputs.css({
                borderStyle: 'none',
                padding: (tracker.padding + slider.width) + 'px ' + slider.start + 'px'
            });


            tracker.gradient = {
                slider: {
                    prefix: 'radial-gradient(' + slider.radius + 'px at ',
                    suffix:
                        ' 50%,' +
                        tracker.color + ' ' + slider.radius + 'px,' +
                        slider.color + ' ' + slider.radius + 'px,' +
                        slider.color + ' ' + (slider.width + slider.radius) + 'px,' +
                        'transparent ' + (slider.width + slider.radius) + 'px' +
                        ') no-repeat,'
                },
                whiteBorder: 'linear-gradient(to bottom,' +
                    settings.borderColor + ' ' + (tracker.padding + slider.width) + 'px,' +
                    'transparent ' + (tracker.padding + slider.width) + 'px,' +
                    'transparent ' + (tracker.padding + slider.width + tracker.height) + 'px,' +
                    settings.borderColor + ' ' + (tracker.padding + slider.width + tracker.height) + 'px' +
                    '),'
            };


            if (tracker.lower.dom.min !== tracker.upper.dom.min ||
                tracker.lower.dom.max !== tracker.upper.dom.max ||
                tracker.lower.dom.step !== tracker.upper.dom.step
            ) {
                console.warn("range bound not equals");
                return;
            }
            if (parseInt(tracker.lower.dom.value, 10) > parseInt(tracker.upper.dom.value, 10)) {
                var v = tracker.lower.dom.value;
                tracker.lower.dom.value = tracker.upper.dom.value;
                tracker.upper.dom.value = v;
            }

            tracker.lower.originalMax = tracker.lower.dom.max;
            tracker.upper.originalMin = tracker.upper.dom.min;

            tracker.min = parseInt(tracker.lower.dom.min);
            tracker.max = parseInt(tracker.upper.dom.max);
            tracker.all = tracker.max - tracker.min;

            var $rangeOuputMin = $this.find(settings.rangeMinOutput);
            var $rangeOutputMax = $this.find(settings.rangeMaxOutput);

            var updateTrackColorTimer;
            var updateTrackColor = function (rangeMin, rangeMax) {
                var w = $inputs.width();
                if (w === 0) {
                    // No width if content is not displayed.
                    // Start a time to fix widget display when it displayed
                    clearTimeout(updateTrackColorTimer);
                    setTimeout(function () {
                        updateTrackColor(rangeMin, rangeMax);
                    }, 200);
                    return;
                }
                // Javascript calculation
                var rLower = (slider.start + w * (rangeMin - tracker.min) / tracker.all) + 'px';
                var rUpper = (slider.start + w * (rangeMax - tracker.min) / tracker.all) + 'px';
                $inputs.css('background',
                    // Slider de gauche
                    tracker.gradient.slider.prefix + rLower + tracker.gradient.slider.suffix +
                    // Slider de droite
                    tracker.gradient.slider.prefix + rUpper + tracker.gradient.slider.suffix +
                    // bandes blanches en haut et en bas
                    tracker.gradient.whiteBorder +
                    // indicateur entre les 2 sliders
                    'linear-gradient(to right,' +
                    'transparent ' + rLower + ',' +
                    tracker.color + ' ' + rLower + ',' +
                    tracker.color + ' ' + rUpper + ',' +
                    'transparent ' + rUpper +
                    ')'
                );
            };
            var updateOutput = function ($output, value) {
                var outputPattern = $output.attr('data-pattern') || '#';
                $output.html(outputPattern.replace('#', value));
            };

            var update = function () {
                var rangeMin = parseInt(tracker.lower.dom.value, 10);
                var rangeMax = parseInt(tracker.upper.dom.value, 10);

                var mid = Math.round((rangeMax - rangeMin) / 2) + rangeMin;

                var lowerWidth = 100 * (mid - tracker.min) / tracker.all;
                var upperWidth = 100 * (tracker.max - mid) / tracker.all;

                tracker.lower.dom.max = tracker.upper.dom.min = mid;

                var gradientLower = 100 * rangeMin / (tracker.lower.dom.max - tracker.lower.dom.min);
                var gradientUpper = 100 * (rangeMax - tracker.upper.dom.min) / (tracker.upper.dom.max - tracker.upper.dom.min);

                $(tracker.lower.dom).css('width', lowerWidth + "%");
                $(tracker.upper.dom).css('width', upperWidth + "%");

                updateTrackColor(rangeMin, rangeMax);

                updateOutput($rangeOuputMin, rangeMin);
                updateOutput($rangeOutputMax, rangeMax);
            };


            var timeout;
            $this.find('[type=range]').on('input change', function () {
                var that = this;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    update();
                }, 10);
            });
            update();
        });
    };
})(jQuery);

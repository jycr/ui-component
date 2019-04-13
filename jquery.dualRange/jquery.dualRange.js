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
                padding: maxValue($inputs.css(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']))
            };
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


            tracker.sliderGradientPrefix = 'radial-gradient(' + slider.radius + 'px at ';
            tracker.sliderGradientSuffix = 'px' +
                ' 50%,' +
                tracker.color + ' ' + slider.radius + 'px,' +
                slider.color + ' ' + slider.radius + 'px,' +
                slider.color + ' ' + (slider.width + slider.radius) + 'px,' +
                'transparent ' + (slider.width + slider.radius) + 'px' +
                ') no-repeat,';

            tracker.whiteBorder = 'linear-gradient(to bottom,' +
                settings.borderColor + ' ' + (tracker.padding + slider.width) + 'px,' +
                'transparent ' + (tracker.padding + slider.width) + 'px,' +
                'transparent ' + (tracker.padding + slider.width + tracker.height) + 'px,' +
                settings.borderColor + ' ' + (tracker.padding + slider.width + tracker.height) + 'px' +
                '),';

            var dualRange = {
                lower: {
                    dom: $this.find(settings.lower).get(0)
                },
                upper: {
                    dom: $this.find(settings.upper).get(0)
                }
            };

            if (dualRange.lower.dom.min !== dualRange.upper.dom.min ||
                dualRange.lower.dom.max !== dualRange.upper.dom.max ||
                dualRange.lower.dom.step !== dualRange.upper.dom.step
            ) {
                console.warn("range bound not equals");
                return;
            }
            if (parseInt(dualRange.lower.dom.value, 10) > parseInt(dualRange.upper.dom.value, 10)) {
                var v = dualRange.lower.dom.value;
                dualRange.lower.dom.value = dualRange.upper.dom.value;
                dualRange.upper.dom.value = v;
            }

            dualRange.lower.originalMax = dualRange.lower.dom.max;
            dualRange.upper.originalMin = dualRange.upper.dom.min;

            dualRange.min = parseInt(dualRange.lower.dom.min);
            dualRange.max = parseInt(dualRange.upper.dom.max);
            dualRange.all = dualRange.max - dualRange.min;

            var $rangeOuputMin = $this.find(settings.rangeMinOutput);
            var $rangeOutputMax = $this.find(settings.rangeMaxOutput);


            var updateTrackColor = function (rangeMin, rangeMax) {
                var w = $inputs.width();
                var rLower = slider.start + w * (rangeMin - dualRange.min) / dualRange.all;
                var rUpper = slider.start + w * (rangeMax - dualRange.min) / dualRange.all;
                $inputs.css('background',
                    // Slider de gauche
                    tracker.sliderGradientPrefix + rLower + tracker.sliderGradientSuffix +
                    // Slider de droite
                    tracker.sliderGradientPrefix + rUpper + tracker.sliderGradientSuffix +
                    // bandes blanches en haut et en bas
                    tracker.whiteBorder +
                    // indicateur entre les 2 sliders
                    'linear-gradient(to right,' +
                    'transparent ' + rLower + 'px,' +
                    tracker.color + ' ' + rLower + 'px,' +
                    tracker.color + ' ' + rUpper + 'px,' +
                    'transparent ' + rUpper + 'px' +
                    ')'
                );
            };
            var updateOutput = function ($output, value) {
                var outputPattern = $output.attr('data-pattern') || '#';
                $output.html(outputPattern.replace('#', value));
            };


            var update = function () {
                var rangeMin = parseInt(dualRange.lower.dom.value, 10);
                var rangeMax = parseInt(dualRange.upper.dom.value, 10);
                var mid = Math.round((rangeMax - rangeMin) / 2) + rangeMin;

                var lowerWidth = 100 * (mid - dualRange.min) / dualRange.all;
                var upperWidth = 100 * (dualRange.max - mid) / dualRange.all;

                dualRange.lower.dom.max = dualRange.upper.dom.min = mid;
                var gradientLower = 100 * rangeMin / (dualRange.lower.dom.max - dualRange.lower.dom.min);
                var gradientUpper = 100 * (rangeMax - dualRange.upper.dom.min) / (dualRange.upper.dom.max - dualRange.upper.dom.min);
                $(dualRange.lower.dom).css('width', lowerWidth + "%");
                $(dualRange.upper.dom).css('width', upperWidth + "%");
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

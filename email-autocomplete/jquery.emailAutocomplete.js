(function ($) {
	function genUid() {
		return "ui-id-" + Math.floor(Math.random() * 26) + Date.now();
	}

	function setupEmailDomainAutocomplete(input) {
		var prefix = input.value.split('@')[0];
		input.list.innerHTML = input
			._emailDomains
			.map(function (domain) {
				return '<option value="' + prefix + '@' + domain + '"/>';
			})
			.join('');
	}

	function process(input) {
		if (input.value.indexOf("@") < 0) {
			// Le symbole '@' n'est pas encore saisie, on n'affiche pas d'autocomplete
			input.autocomplete = input._defaultAutocomplete;
			// on réinitialise les éventuelles valeurs précédentes
			input.list.innerHTML = '';
			input.lastValue = null;
			return;
		}
		var prefix = input.value.split('@')[0];
		if (input.lastValue !== prefix) {
			input.lastValue = prefix;
			if (!input._defaultAutocomplete) {
				input._defaultAutocomplete = input.autocomplete;
			}
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1474137
			input.autocomplete = "off";
			clearTimeout(input._timer);
			input._timer = setTimeout(function () {
				setupEmailDomainAutocomplete(input);
			}, 10);
		}
	}

	$.fn.emailAutocomplete = function (options) {
		var settings = $.extend({
			domains: function () {
				return [];
			}
		}, options);

		return this.each(function () {
			var input = this;
			if (!input.list) {
				// Initialisation de la datalist si elle n'existe pas, et rattachement à l'input
				var id = genUid();
				$('<datalist id="' + id + '"/>').insertAfter(input);
				$(input).attr('list', id);
			}
			if (!input._emailDomains) {
				input._emailDomains = settings.domains(input);
			}
			$(input).on('keyup', function (e) {
				process(input);
			});
		});
	};
})(jQuery);

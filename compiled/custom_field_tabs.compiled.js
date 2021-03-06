"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Custom_Field_Tabs_Parser = function () {
	function Custom_Field_Tabs_Parser() {
		var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

		_classCallCheck(this, Custom_Field_Tabs_Parser);

		this.template = template;
	}

	_createClass(Custom_Field_Tabs_Parser, [{
		key: "append",
		value: function append() {
			var $node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var simple_field_name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

			if ($node && simple_field_name) {
				var html = $("<div></div>").append($node).html();
				var re = new RegExp("\\$\\[" + simple_field_name + "\\]", "gi");

				if (this.template.match(re)) {
					this.template = this.template.replace(re, html);
				}
			}
		}
	}, {
		key: "content",
		value: function content() {
			return $("<div></div>").html(this.template);
		}
	}]);

	return Custom_Field_Tabs_Parser;
}();

var Custom_Field_Tabs = function () {
	function Custom_Field_Tabs() {
		_classCallCheck(this, Custom_Field_Tabs);
	}

	_createClass(Custom_Field_Tabs, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_custom_field_tabs";
			this.route = pb.data("route").name;
			this.existing_ui_event_added = false;
			this.settings = Object.create(null);

			this.setup();

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			var _this = this;

			if (this.edit_profile() || this.view_profile()) {
				var $the_form = $("form.form_user_edit_personal");

				this.settings.tabs.forEach(function (elem) {
					var fields = elem.fields_to_move.split("\n");

					if (fields.length == 0 || fields.length == 1 && fields[0] == "") {
						return;
					}

					var $html = void 0;
					var custom = false;

					if (elem.custom_layout.length > 0) {
						$html = new Custom_Field_Tabs_Parser(elem.custom_layout);
						custom = true;
					} else {
						$html = $("<div></div>");
					}

					var table_fragment = document.createDocumentFragment();

					fields.forEach(function (field) {

						var simple_field_name = _this.simple_field_name(field);
						var $the_field_node = $the_form.find("div.custom-field-" + simple_field_name);

						if ($the_field_node.length == 1) {
							var $cloned_field = $the_field_node.clone(true);

							$cloned_field.attr("data-custom-field-clone", simple_field_name);

							$the_field_node.hide();

							$html.append($cloned_field.show(), custom ? simple_field_name : null);
						} else if (_this.profile_home()) {
							var $tr_node = $("td#center-column").find("tr[class^=custom-field-" + simple_field_name + "]");

							if ($tr_node.length == 1) {
								table_fragment.appendChild($tr_node.clone().get(0));
								$tr_node.hide();
							}
						}
					});

					_this.create_profile_tab({

						text: elem.tab_text,

						render: function render($content, data_page, viewing) {
							if (!viewing) {
								$content.append(custom ? $html.content() : $html);

								var $button = $("<button>" + (elem.submit_button_text || "Save Settings") + "</button>");

								$button.on("click", _this.save_fields.bind(_this, fields));

								$content.append($button);

								$content.append("<span class='the-save-status' style='display: none'></span>");
							}
						},

						view: function view($content, data_page) {

							if (table_fragment.childNodes.length == 0) {
								$content.html("<em>No information</em>");
							} else {
								var table = document.createElement("table");

								table.appendChild(table_fragment);

								$content.append(table);
							}

							$content.addClass("content-box");

							$content.css("padding", "10px");
						}

					});
				});

				this.set_active_click_event();

				if (this.edit_profile()) {
					this.setup_observer();
				}
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.settings.tabs = plugin.settings.tabs;

				this.settings.profile_view_tabs = plugin.settings.profile_view_tabs == 1 ? true : false;
				this.settings.profile_edit_tabs = plugin.settings.profile_edit_tabs == 1 ? true : false;
			}
		}
	}, {
		key: "setup_observer",
		value: function setup_observer() {
			var $the_form = $("form.form_user_edit_personal");

			var observer = new MutationObserver(function (mutations) {

				var $li = $("div.edit-user div.ui-tabMenu:first ul").find("li.ui-active");

				if ($li.length == 1 && $li.find("a.js-tab").length == 1) {
					return;
				}

				mutations.forEach(function (mutation) {

					if (mutation.addedNodes.length) {
						var _loop = function _loop(i) {
							var the_node = mutation.addedNodes[i];

							if (the_node.className.match("status-box")) {
								$("span.the-save-status").html(the_node.textContent).fadeIn(900, function () {

									$("span.the-save-status").fadeOut(900, function () {

										setTimeout(function () {
											return $("span.the-save-status").hide();
										}, 1700);
										the_node.style.display = "none";
									});
								});

								return "break";
							}
						};

						for (var i = 0; i < mutation.addedNodes.length; ++i) {
							var _ret = _loop(i);

							if (_ret === "break") break;
						}
					}
				});
			});

			observer.observe($the_form.get(0), {

				attributes: false,
				childList: true,
				characterData: false

			});
		}
	}, {
		key: "simple_data_page",
		value: function simple_data_page() {
			var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			return text.replace(/[^\w-]+/g, "_");
		}
	}, {
		key: "simple_field_name",
		value: function simple_field_name() {
			var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			return text.replace(/[^a-z0-9]+/gi, "").toLowerCase();
		}
	}, {
		key: "save_fields",
		value: function save_fields() {
			var _this2 = this;

			var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			var $the_form = $("form.form_user_edit_personal");

			fields.forEach(function (field) {
				var simple_field_name = _this2.simple_field_name(field);
				var $the_original = $("div[class*=custom-field-" + simple_field_name + "]:not([data-custom-field-clone])");
				var $the_clone = $("div[class*=custom-field-" + simple_field_name + "][data-custom-field-clone]");

				var $form_field = $the_original.find("input, select, textarea");
				var $cloned_form_field = $the_clone.find("input, select, textarea");

				if ($form_field.length > 0) {
					var elem = $form_field.get(0);

					switch (elem.nodeName.toLowerCase()) {

						case "select":
							elem.selectedIndex = $cloned_form_field.get(0).selectedIndex;

							break;

						case "textarea":
							elem.value = $cloned_form_field.get(0).value;

						case "input":
							var type = elem.type;

							switch (type) {

								case "text":
									elem.value = $cloned_form_field.get(0).value;

									break;

								case "radio":
								case "checkbox":
									for (var i = 0; i < $form_field.length; ++i) {
										if ($cloned_form_field.get(i).checked) {
											$form_field.get(i).checked = true;
										} else {
											$form_field.get(i).checked = false;
										}
									}

									break;

							}

							break;

					}
				}
			});

			$the_form.submit();
		}
	}, {
		key: "create_profile_tab",
		value: function create_profile_tab() {
			var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    _ref$text = _ref.text,
			    text = _ref$text === undefined ? "" : _ref$text,
			    _ref$render = _ref.render,
			    render = _ref$render === undefined ? null : _ref$render,
			    _ref$edit = _ref.edit,
			    edit = _ref$edit === undefined ? null : _ref$edit,
			    _ref$view = _ref.view,
			    view = _ref$view === undefined ? null : _ref$view;

			var $user = $("div.show-user, div.edit-user");
			var $ul = $user.find("div.ui-tabMenu:first ul");

			if ($ul.length) {
				var member = pb.data("page").member;

				if (member && parseInt(member.id, 10)) {
					var viewing = this.view_profile() ? true : false;
					var data_page = this.simple_data_page(text);
					var $li = $("<li></li>");
					var $link = $("<a data-page='" + data_page + "' href='#'>" + text + "</a>");
					var $content = $("<div></div>");

					$content.addClass(data_page);

					if (viewing) {
						$link.attr("href", "/user/" + parseInt(member.id) + "/?tab-" + data_page);

						if (location.search.match(/\?tab-(\w+)$/i) && RegExp.$1 == data_page) {
							$li.addClass("ui-active");
							$content.removeClass("hide");

							var $last_pad_all = $("div.content").find("div.pad-all-double:last");

							$last_pad_all.children().hide();
							$last_pad_all.append($content);
						}

						view($content, data_page);
					} else {
						$content.addClass("js-edit content-box hide");

						$("div.clear.js-enabled").append($content);

						$link.on("click", function (e) {
							return e.preventDefault();
						}); // Bubble bubble
					}

					render($content, data_page, viewing);

					$li.append($link);
					$ul.append($li);
				}
			}
		}
	}, {
		key: "set_active_click_event",
		value: function set_active_click_event() {
			var $user = $("div.show-user, div.edit-user");
			var $ul = $user.find("div.ui-tabMenu:first ul");

			if ($ul.length) {
				var what = this;

				$ul.children().on("click", function () {

					what.hide_and_show($(this));

					$ul.children().removeClass("ui-active");
					$(this).addClass("ui-active");
				});
			}
		}
	}, {
		key: "hide_and_show",
		value: function hide_and_show() {
			var $li = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

			if ($li) {
				$("div.js-edit[class*=-edit]").addClass("hide");

				var data_page = $li.find("a:first").attr("data-page");

				$("div.js-edit[class*=" + data_page + "]").removeClass("hide");
			}
		}
	}, {
		key: "edit_profile",
		value: function edit_profile() {
			if (!this.settings.profile_edit_tabs) {
				return false;
			}

			return this.profile_edit_admin() || this.profile_edit_avatar() || this.profile_edit_badges() || this.profile_edit_notifications() || this.profile_edit_personal() || this.profile_edit_privacy() || this.profile_edit_settings() || this.profile_edit_social();
		}
	}, {
		key: "view_profile",
		value: function view_profile() {
			if (!this.settings.profile_view_tabs) {
				return false;
			}

			return this.profile_activity() || this.profile_following() || this.profile_friends() || this.profile_gift() || this.profile_groups() || this.profile_home() || this.profile_notifications();
		}
	}, {
		key: "__is_page",
		value: function __is_page(id) {
			return this.route == id;
		}
	}, {
		key: "profile_activity",
		value: function profile_activity() {
			return this.__is_page("show_user_activity");
		}
	}, {
		key: "profile_following",
		value: function profile_following() {
			return this.__is_page("show_user_following");
		}
	}, {
		key: "profile_friends",
		value: function profile_friends() {
			return this.__is_page("show_user_friends");
		}
	}, {
		key: "profile_gift",
		value: function profile_gift() {
			return this.__is_page("show_user_gift");
		}
	}, {
		key: "profile_groups",
		value: function profile_groups() {
			return this.__is_page("show_user_groups");
		}
	}, {
		key: "profile_home",
		value: function profile_home() {
			return this.__is_page("user") || this.__is_page("current_user");;
		}
	}, {
		key: "profile_notifications",
		value: function profile_notifications() {
			return this.__is_page("show_user_notifications") || this.__is_page("show_more_notifications");
		}
	}, {
		key: "profile_edit_admin",
		value: function profile_edit_admin() {
			return this.__is_page("edit_user_admin");
		}
	}, {
		key: "profile_edit_avatar",
		value: function profile_edit_avatar() {
			return this.__is_page("edit_user_avatar");
		}
	}, {
		key: "profile_edit_badges",
		value: function profile_edit_badges() {
			return this.__is_page("edit_user_badges");
		}
	}, {
		key: "profile_edit_notifications",
		value: function profile_edit_notifications() {
			return this.__is_page("edit_user_notifications");
		}
	}, {
		key: "profile_edit_personal",
		value: function profile_edit_personal() {
			return this.__is_page("edit_user_personal");
		}
	}, {
		key: "profile_edit_privacy",
		value: function profile_edit_privacy() {
			return this.__is_page("edit_user_privacy");
		}
	}, {
		key: "profile_edit_settings",
		value: function profile_edit_settings() {
			return this.__is_page("edit_user_settings");
		}
	}, {
		key: "profile_edit_social",
		value: function profile_edit_social() {
			return this.__is_page("edit_user_social");
		}
	}]);

	return Custom_Field_Tabs;
}();


Custom_Field_Tabs.init();
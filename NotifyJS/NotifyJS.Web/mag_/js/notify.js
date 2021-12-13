/* v2.0.0 | (c) Paul Nieuwelaar Magnetism Apps Limited | https://github.com/PaulNieuwelaar/notifyjs */

/*
    // Add a notification with a button and a link (inline html in the message too)
    Notify.add("Would you like to create a new <b>Sale</b>?", "QUESTION", "sale",
        [new Notify.Button("Create Sale", function () {
            Notify.add("Sale created successfully!", "SUCCESS", "sale", null, 3);
        }),
        new Notify.Link("Not now", function () {
            Notify.remove("sale");
        })]);

    // Add a notification which disappears after 5 seconds
    Notify.add("Workflow executed successfully!", "SUCCESS", "success", null, 5);
        
    // Remove a certain notification by its uniqueId
    Notify.remove("sale");

    // Remove all notifications
    Notify.remove();
*/

var Notify = Notify || {};

Notify._context = window.document;
Notify._jQuery = top.jQuery || parent.jQuery || window.jQuery;

Notify.$ = function (selector, context) {
    return Notify._jQuery(selector, context || Notify._context);
}

Notify._notifications = [];
Notify._timeStamp = null;
Notify._initialised = false;
Notify._prefix = "mag_"; // Change this if you have your own solution prefix (as long as the file structure's the same)
Notify._crmFormHeaderId = "formHeaderContainer"; // This is probably the only thing "unsupported"
Notify._crmViewHeaderId = "crmContentPanel"; // And this, but it's cool

// message = (optional) what is displayed in the notification bar
// level = (optional) ERROR, WARNING, INFO, SUCCESS, QUESTION, SUCCESS, or LOADING. If not included, no image will display
// uniqueId = (optional) unique ID for this notification
// buttons = (optional) array of objects, each object must have a 'text' attrbute, a 'callback' function attribute, and a 'type' attribute of 'link' or 'button'
// durationSeconds = (optional) after how long should the notification disappear
// bgColor = hex code for the notification background. Defaults to Classic CRM yellow: "#FFF19D"
// textColor = hex code for the notification text, button outlines, link colors, X color, etc. Defaults to Grey: #444444
Notify.add = function (message, level, uniqueId, buttons, durationSeconds, bgColor, textColor) {
    bgColor = bgColor || "#FFF19D"; // Classic CRM yellow
    textColor = textColor || "#444444"; // Grey
    uniqueId = uniqueId ? (uniqueId + "").toLowerCase() : ""; // Accepts non-strings and undefined

    Notify._initialise();

    var notification = {
        id: uniqueId,
        severity: level,
        buttons: buttons,
        bgColor: bgColor,
        textColor: textColor
    };

    // Update or append the new notification
    var exists = false;
    for (var i = 0; i < Notify._notifications.length; i++) {
        if (Notify._notifications[i].id === uniqueId) {
            Notify._notifications[i] = notification;
            exists = true;
            break;
        }
    }
    if (!exists) {
        Notify._notifications.push(notification);
    }

    // Unhide the notify wrapper if this is the first notification
    Notify.$("#notifyWrapper").show();

    // If the element exists remove it before recreating it
    Notify.$("#notifyNotification_" + uniqueId).remove();

    // Create all the elements for this notification
    var $elem = Notify.$("<div>", { id: "notifyNotification_" + uniqueId, class: "notify-notification" }).css("color", textColor).css("background-color", bgColor).hide().prependTo(Notify.$("#notify"));
    var $table = Notify.$("<table>", { cellpadding: "0", cellspacing: "0" }).css("width", "100%").appendTo($elem);
    var $tr = Notify.$("<tr>").appendTo($table);
    if (level && ["INFO", "WARNING", "ERROR", "SUCCESS", "QUESTION", "LOADING", "SEARCH"].indexOf(level) !== -1) {
        var $imgTd = Notify.$("<td>", { valign: "top" }).css("width", "22px").appendTo($tr);
        var imgType = level == "ERROR" ? "crit" : level == "WARNING" ? "warn" : level == "INFO" ? "info" : level == "SUCCESS" ? "tick" : level == "QUESTION" ? "ques" : level == "LOADING" ? "load" : "find";
        var $img = Notify.$("<div>");
        $img.addClass("notify-image notify-image-" + imgType);
        $img.appendTo($imgTd);
    }
    var $textTd = Notify.$("<td>", { class: "notify-text" }).appendTo($tr);
    var $close = Notify.$("<a>", { title: "Dismiss", class: "notify-close" }).css("color", textColor).click(function () { Notify.remove(uniqueId); });
    $close.append("&times;");
    $textTd.append($close);
    $textTd.append(message || "");
    if (buttons && buttons.length > 0) {
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            var $button = Notify.$("<a>", { class: b.type == "link" ? "notify-link" : "notify-button" });
            $button.css("color", textColor).click(b.callback);
            $button.append(b.text || "");

            if (b.type != "link") {
                var rgb = Notify._hexToRgb(textColor);
                if (rgb != null) {
                    $button.hover(function () {
                        // On hover
                        Notify.$(this).css("background-color", "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0.2)");
                    }, function () {
                        // Off hover
                        Notify.$(this).css("background-color", "");
                    });
                }
            }

            $textTd.append($button);
        }
    }

    if (exists) {
        $elem.show();
    }
    else {
        $elem.slideDown(500);
    }

    // If there's a timeout specified, wait and then remove this notification
    if (durationSeconds && durationSeconds > 0) {
        var timeStamp = new Date();
        Notify._timeStamp = timeStamp; // Timestamp prevents mutliple presses
        setTimeout(function () {
            if (timeStamp == Notify._timeStamp) {
                Notify.remove(uniqueId);
            }
        }, durationSeconds * 1000);
    }
}

// uniqueId = (optional) the ID of the notification to remove. If ID is not specified, all notifications are cleared
Notify.remove = function (uniqueId) {
    if (!Notify._initialised) { return; }

    // If no ID specified, remove all notifications
    if (uniqueId === null || uniqueId === undefined) {
        Notify.$("#notifyWrapper").slideUp(500, function () {
            for (var i = 0; i < Notify._notifications.length; i++) {
                Notify.$("#notifyNotification_" + Notify._notifications[i].id).remove();
            }

            Notify._notifications = [];
        });
    }
    else {
        // Accepts non-strings
        uniqueId = (uniqueId + "").toLowerCase();

        // Remove the notification
        var tempNotifications = [];
        for (var i = 0; i < Notify._notifications.length; i++) {
            if (Notify._notifications[i].id !== uniqueId) {
                tempNotifications.push(Notify._notifications[i]);
            }
        }
        Notify._notifications = tempNotifications;

        if (Notify._notifications.length == 0) {
            // If that was the last notification hide the notify wrapper
            Notify.$("#notifyWrapper").slideUp(500, function () {
                // Delete the notification once hidden
                Notify.$("#notifyNotification_" + uniqueId).remove();
            });
        }
        else {
            // Hide and Delete the element
            Notify.$("#notifyNotification_" + uniqueId).slideUp(500, function () { Notify.$(this).remove(); });
        }
    }
}

Notify._initialise = function () {
    if (!Notify._initialised) {
        // Remove any leftover wrappers
        Notify.$("#notifyWrapper").remove();
        Notify.$("#notifyWrapper", parent.document).remove();

        var $notify = Notify.$("<div>", { id: "notifyWrapper" });
        $notify.append(Notify.$("<div>", { id: "notify", class: "notify", size: "3", maxheight: "51" }).css("display", "block"));

        // Try get the form header
        var $header = Notify.$("#" + Notify._crmFormHeaderId);
        if ($header.length > 0) {
            $header.append($notify);
        }
        else {
            // Try get the form header from the parent
            var $header = Notify.$("#" + Notify._crmFormHeaderId, parent.document);
            if ($header.length > 0) {
                Notify._context = parent.document; // This is because the notifications are now in the parent
                $header.append($notify);
            }
            else {
                // If not form header, might be a view, so try get the view header
                $header = Notify.$("#" + Notify._crmViewHeaderId, parent.document);
                if ($header.length > 0) {
                    Notify._context = parent.document; // This is because the notifications are now in the parent
                    $header.prepend($notify);
                }
                else {
                    // v9+ Unified Interface form
                    //$header = Notify.$("#tab-section", parent.document);
                    $header = Notify.$("div[data-id='form-header']", parent.document);
                    if ($header.length > 0) {
                        Notify._context = parent.document; // This is because the notifications are now in the parent
                        $header.before($notify);
                    }
                    else {
                        // v9+ Unified Interface view
                        $header = Notify.$("section[data-id^=dataSetRoot] > div", parent.document).first();
                        //$header = Notify.$("[data-id^=commandBar]", parent.document);
                        if ($header.length > 0) {
                            Notify._context = parent.document; // This is because the notifications are now in the parent
                            $header.after($notify);
                        }
                    }
                }
            }
        }

        if ($header.length > 0) {
            // Load the style sheet
            var baseUrl = Xrm.Page.context.getClientUrl();
            Notify.$("<link/>", { rel: "stylesheet", href: baseUrl + "/WebResources/" + Notify._prefix + "/css/notify.css" }).appendTo($notify);

            Notify._initialised = true;
        }
        else {
            // Broken most likely from a rollup/update - just need to find the new header ID (hopefully)
            console.log("Notify: CRM header element: '" + Notify._crmFormHeaderId + "' does not exist.");
            return;
        }
    }
}

Notify._hexToRgb = function (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

Notify._Button = function (type, text, callback) {
    this.type = type;
    this.text = text;
    this.callback = callback;
}

Notify.Button = function (text, callback) {
    Notify._Button.call(this, "button", text, callback);
}

Notify.Link = function (text, callback) {
    Notify._Button.call(this, "link", text, callback);
}

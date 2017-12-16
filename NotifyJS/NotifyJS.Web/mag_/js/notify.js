// Notify.js v1.1 - Copyright Paul Nieuwelaar Magnetism 2016
// Download the latest version from https://github.com/PaulNieuwelaar/notifyjs

/*
    // Add a notification with a button and a link (inline html in the message too)
    Notify.add("Would you like to create a new <b>Sale</b>?", "QUESTION", "sale",
        [{
            type: "button",
            text: "Create Sale",
            callback: function () {
                Notify.add("Sale created successfully!", "SUCCESS", "sale", null, 3);
            }
        },
        {
            type: "link",
            text: "Not now",
            callback: function () {
                Notify.remove("sale");
            }
        }]);

    // Add a notification which disappears after 5 seconds
    Notify.add("Workflow executed successfully!", "SUCCESS", "success", null, 5);
        
    // Remove a certain notification by its uniqueId
    Notify.remove("sale");

    // Remove all notifications
    Notify.remove();
*/

var Notify = Notify || {};
var $ = $ || parent.$;

Notify._notifications = [];
Notify._timeStamp = null;
Notify._initialised = false;
Notify._prefix = "mag_"; // Change this if you have your own solution prefix (as long as the file structure's the same)
Notify._crmFormHeaderId = "formHeaderContainer"; // This is probably the only thing "unsupported"
Notify._crmViewHeaderId = "crmContentPanel"; // And this, but it's cool

// message = (optional) what is displayed in the notification bar
// level = (optional) ERROR, WARNING, INFO, SUCCESS, QUESTION, or LOADING. If not included, no image will display
// uniqueId = (optional) unique ID for this notification
// buttons = (optional) array of objects, each object must have a 'text' attrbute, a 'callback' function attribute, and a 'type' attribute of 'link' or 'button'
// durationSeconds = (optional) after how long should the notification disappear
Notify.add = function (message, level, uniqueId, buttons, durationSeconds) {
    if (!Notify._initialised) {
        var $notify = $("<div>", { id: "notifyWrapper" });
        $notify.append($("<div>", { id: "notify", class: "notify", size: "3", maxheight: "51", class: "notify" }).css("display", "block"));

        // Try get the form header
        var $header = $("#" + Notify._crmFormHeaderId);
        if ($header.length > 0) {
            $header.append($notify);
        }

        if ($header.length == 0) {
            $ = parent.$;

            // Try get the form header again (2015 SP1)
            var $header = $("#" + Notify._crmFormHeaderId);
            if ($header.length > 0) {
                $header.append($notify);
            }

            // If not form header, might be a view, so try get the view header
            if ($header.length == 0) {
                $header = $("#" + Notify._crmViewHeaderId);
                if ($header.length > 0) {
                    $header.prepend($notify);
                }
            }
        }

        if ($header.length > 0) {
            // Load the style sheet
            var baseUrl = Xrm.Page.context.getClientUrl();
            $("<link/>", { rel: "stylesheet", href: baseUrl + "/WebResources/" + Notify._prefix + "/css/notify.css" }).appendTo('head');

            Notify._initialised = true;
        }
        else {
            // Broken most likely from a rollup/update - just need to find the new header ID (hopefully)
            console.log("Notify: CRM header element: '" + Notify._crmHeaderId + "' does not exist.");
            return;
        }
    }

    // Accepts non-strings and undefined
    uniqueId = uniqueId ? (uniqueId + "").toLowerCase() : "";

    var notification = {
        id: uniqueId,
        severity: level,
        buttons: buttons
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
    $("#notifyWrapper").show();

    // If the element exists remove it before recreating it
    $("#notifyNotification_" + uniqueId).remove();

    // Create all the elements for this notification
    var $elem = $("<div>", { id: "notifyNotification_" + uniqueId, class: "notify-notification" }).hide().prependTo($("#notify"));
    var $table = $("<table>", { cellpadding: "0", cellspacing: "0" }).css("width", "100%").appendTo($elem);
    var $tr = $("<tr>").appendTo($table);
    if (level && ["INFO", "WARNING", "ERROR", "SUCCESS", "QUESTION", "LOADING"].indexOf(level) !== -1) {
        var $imgTd = $("<td>", { valign: "top" }).css("width", "23px").appendTo($tr);
        var imgType = level == "ERROR" ? "crit" : level == "WARNING" ? "warn" : level == "INFO" ? "info" : level == "SUCCESS" ? "tick" : level == "QUESTION" ? "ques" : "load";
        var $img = $("<div>");
        $img.addClass("notify-image notify-image-" + imgType);
        $img.appendTo($imgTd);
    }
    var $textTd = $("<td>").appendTo($tr);
    var $close = $("<a>", { title: "Dismiss", class: "notify-close" }).click(function () { Notify.remove(uniqueId); });;
    $textTd.append($close);
    $textTd.append(message || "");
    if (buttons && buttons.length > 0) {
        for (var i = 0; i < buttons.length; i++) {
            var b = buttons[i];
            var $button = $("<a>", { class: b.type == "link" ? "notify-link" : "notify-button" }).click(b.callback);
            $button.append(b.text || "");
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
        $("#notifyWrapper").slideUp(500, function () {
            for (var i = 0; i < Notify._notifications.length; i++) {
                $("#notifyNotification_" + Notify._notifications[i].id).remove();
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
            $("#notifyWrapper").slideUp(500, function () {
                // Delete the notification once hidden
                $("#notifyNotification_" + uniqueId).remove();
            });
        }
        else {
            // Hide and Delete the element
            $("#notifyNotification_" + uniqueId).slideUp(500, function () { $(this).remove(); });
        }
    }
}

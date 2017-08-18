# Notify.js - CRM 2013-D365 Custom Notifications in JavaScript
[![download](https://user-images.githubusercontent.com/14048382/27844360-c7ea9670-6174-11e7-8658-80d356c1ba8f.png)](https://github.com/PaulNieuwelaar/notifyjs/raw/master/NotifyJS_1_1_0_0.zip) (v1.1) [<img align="right" src="https://user-images.githubusercontent.com/14048382/29433676-4eb13ea6-83f4-11e7-8c07-eca514b1b197.png"/>](https://github.com/PaulNieuwelaar/notifyjs/wiki/Documentation)

![](https://user-images.githubusercontent.com/14048382/29441236-e8e965b0-841d-11e7-9d96-06748f992dbd.PNG)

## Overview
This library gives developers the ability to create nice CRM notifications on forms and views, similar to the Xrm.Page.ui.setFormNotification SDK function, but better!

It gives us all the same functionality as the setFormNotification SDK function, but has the following additional features:
* Allows you to add buttons and/or hyperlinks into the notification, with custom JavaScript triggered on click.
* Supports additional icons, including SUCCESS ![](https://user-images.githubusercontent.com/14048382/29441319-90e1b646-841e-11e7-9e3f-08e901d56cb4.png), QUESTION ![](https://user-images.githubusercontent.com/14048382/29441320-9159a7d2-841e-11e7-8a41-40f85c981de6.png), and LOADING ![](https://user-images.githubusercontent.com/14048382/29441321-923a88ec-841e-11e7-9a99-87677ed27a75.gif)
* Supports custom HTML tags to be used manually in the notification message for greater flexibility
* Ability to manually close a notification using the 'X' on the right hand side
* Has smooth slide in and out transitions when adding and removing notifications
* Ability to specify a duration after which that particular notification will disappear
* Supports displaying notifications inside views from command bar buttons (only in web client - must specify duration)

Check the [Documentation](https://github.com/PaulNieuwelaar/notifyjs/wiki/Documentation) page for usage details.

![](https://user-images.githubusercontent.com/14048382/29441262-229a36c2-841e-11e7-8d45-e27bf363ca4a.PNG)

## Add Notification
Adds or overwrites a notification on the custom notification bar. Note that this notification bar is separate to the CRM Notification bar.

Parameters: Message, Icon, Unique ID, Buttons (array), Duration (seconds - optional)

All parameters are _technically_ optional, if there's no icon specified the icon will be removed, if the unique ID is not specified, the ID will be null (and any new notifications with no ID will overwrite that one), the buttons are optional and will display after the message in the order they are added to the array, duration is optional, and if not specified the notification will only disappear if the user manually dismisses it or if other code removes it.

Supported Icon types are: "INFO", "WARNING", "ERROR", "SUCCESS", "QUESTION", "LOADING"

Each button object in the array should have a 'text' to display on the button or hyperlink, a 'callback' function to call when the button or hyperlink is clicked, and optionally a 'type' of 'link' or 'button' (defaults to button if not specified)

```javascript
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
```

![](https://user-images.githubusercontent.com/14048382/29441307-7491bf4a-841e-11e7-93af-b5fa2c82229b.PNG)

## Remove Notification
Removes one or all notifications from the custom notification bar. If an ID of a notification is passed to this function, that notification will be removed. If no ID is passed to this function, all notifications will be removed.

Parameters: Unique ID (optional)

```javascript
// Remove a single notification
Notify.remove("sale");
```

```javascript
// Remove all notifications
Notify.remove();
```

Created by [Paul Nieuwelaar](http://paulnieuwelaar.wordpress.com) - [@paulnz1](https://twitter.com/paulnz1)  
Sponsored by [Magnetism Solutions - Dynamics CRM Specialists](http://www.magnetismsolutions.com)

# recept-i
A submission to the [IT-Talents Code Competition](https://www.it-talents.de/foerderung/code-competition/code-competition-10-2020-edeka-digital). 

Native JS-based "What's in my fridge" web application with basic functionallity, barcode scanner and advanced search of recipes. Check out this [live demo](https://www.shot-boehm.com/apps/recipe-i/). 

If you have not received this project by cloning from git, check out the [repository](https://github.com/time-run/recipe-i).

![recipe-i-fridge](/images/recept-i-fridge.png)

## Features

* Basic functions - add, remove items by type in name or scanning barcode
* Search and find recipes by ingredients
* Filter recipes by diet, type and time
* Detailed recipe description with checklist
* Save/Restore items to/from the browser local storage
* Animated graphical user interface

## Implementation

### Project Structure

recept-i is a single page application where the content is loaded externally using js. Only the policy website is stored in its own individual file in order to be displayed correctly even if Javascript is deactivated.

The main application can be accessed via the index.html. As soon as the application has started, several files are imported from the 'set' directory. Therefore the folder recipe-i/set contains all css- and js-files, also the fontello font and graphics.

* [set/js/basic.js](/recipe-i/set/js/basic.js) - Like JQuery, this library contains basic functions like adding one element to another, adding and removing classes from elements, or requesting an Ajax statement
* [set/js/zxing.js](/recipe-i/set/js/zxing.js) - This dependency adds a barcode scanner
* [set/js/setting.js](/recipe-i/set/js/setting.js) - This script creates a GUI-based switch menu with different switch modules
* [set/js/base.js](/recipe-i/set/js/base.js) - The actual application is controlled using this script

* [set/css/fontello.css](/recipe-i/set/css/fontello.css) - Fontello Icon Font
* [set/css/app.css](/recipe-i/set/css/app.css) - Layout and style of web application

### App functionality

The mobile web app is divided into modules and views. 
* **Preview module and view:** First, the user has to accept the guidelines. When the web app is called up again, only a loading screen appears.
* **Structure module:** The skeleton of the main application.
  * **Fridge view:** In this view the user can scan or type in all ingredients.
  * **Settings view:** In this view the user can set all filters.
  * **Multi recipes view:** All recipes according to the filters applied are listed.
  * **Single recipe view:** The view of the selected recipe.

### Enter and scan items

With ZXing, barcodes can be scanned and their sequence of digits read. For this method a camera connected to the device is required. Using Ajax and the Open Food Facts Api, the article numbers (EAN-13 or EAN-8) can be assigned to the products. The barcode scan is canceled once the product has been identified or can be canceled by clicking on the screen. After that, Js based elements are added to the DOM. Also, all items are stored in the local storage.

### Search for recipes

The Spoonacular Api, which is available free of charge to a limited extent, is used to search for the recipes. Filters such as diets and intolerances, but also the occasion and times can be changed with the settings module. With an api request you get the desired recipes sorted according to the available ingredients. Note: sometimes the request is interrupted or takes a long time.

### Detailed recipe

After a recipe has been selected, the required ingredients and steps are displayed. In this mode you also ave a checklist for all ingredients.

## Dependencies

* [zxing](https://github.com/zxing/zxing) - barcode reader
* [Fontello Font](https://fontello.com/) - fancy font icons
* [Open Food Facts Api](https://world.openfoodfacts.org/) - barcode to product name
* [Spoonacular Api](https://spoonacular.com) - find recepts with api

## Installation

Download the "recipe-i"-folder or use npm.

## Copyright and License

Copyright 2020 Michael Böhm

This project is licensed under GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

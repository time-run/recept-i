/*
* Copyright 2020 Michael Böhm
* This file is part of recipe-i
*
* recipe-i is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* any later version.
* recipe-i is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with recipe-i. If not, see <https://www.gnu.org/licenses/>.
*/

!function (w, d, u) {
  /**
   * @param {HTMLElement} _app - The application div
   * @param {HTMLElement} _frame - The frame of the application
   */
  var _app, _frame, _header, _view, _setting;
  _app = only('.app-wrapper');
  _frame = append(_app, '<div class="app-frame module-col"></div>');

  /**
   * @param {string} module_view - The active view
   * @param {Array} storage - contains all firdge items
   * @param {Array} settings - contains all active search filters
   * @param {Boolean} isLoaded - 'true' once the page is loaded
   * @param {Boolean} isClicked - 'true' once the policy is accepted
   * @param {Boolean} isTimer - 'true' after a defined timeout
   */
  var module_view, storage, settings, isLoaded, isClicked, isTimer;

  var HTML_LOGO = '<div class="logo"><h1>recipe</h1><span>i</span></div>';
  var HTML_IMAGE_FRIDGE = '<object data="set/graphics/image-preview.svg" type="image/svg+xml"></object>';
  var HTML_IMAGE_ITTALENTS = '<object data="set/graphics/image-it-talents.svg" type="image/svg+xml"></object>';
  var HTML_IMAGE_EDDIE = '<object data="set/graphics/logo_eddi_white.png" type="image/png"></object>';
  var HTML_COOKIES_MESSAGE = '<h2>What`s in my fridge?</h2><p>Our website uses cookies to make your browsing experience better. By using our site you agree to our use of cookies. <a href="policy">Lern more</a>.</p>';

  /**
   * Generates the preview when the user loads the page
   */
  function loadPreview () {
    module_view = 'preview';

    var _scroller, _folder, _item, _btn;
    _scroller = html(_frame, node('div.module-scroller'));
    _folder = append(_scroller, node('div.module-wrapper'));

    append(_folder, '<div class="module-container module-picture">' + HTML_IMAGE_FRIDGE + '</div>');

    /**
     * If the user has already accepted the policy, a loading screen is displayed.
     * Otherwise, the user is asked to accept the policy in order to use the app.
     */
    if(cookie('policy-accepted')){
      append(_folder, '<div class="module-container module-preview">' + HTML_LOGO + '<p>powered by</p><div class="module-items">' + HTML_IMAGE_ITTALENTS + HTML_IMAGE_EDDIE + '</div></div>');

      setTimeout(function (e) {
        return (isTimer = true) && loadStructure()
      }, 1150);

    }else{
      _item = append(_folder, '<div class="module-container module-note">' + HTML_COOKIES_MESSAGE + '</div>');

      _btn = append(_item, '<button class="btn btn-accept">Zustimmen und fortfahren</button>');

      /*
       * If the policy is accepted, a cookie will be set
       */
      addClick(_btn, function (e) {
        return (isClicked = true) && cookie('policy-accepted', '1', 365) && loadStructure()
      });
    }
  }

  /**
   * When the page has completely loaded and the guidelines have been accepted,
   * the main structure of the web application can be generated
   */
  function loadStructure () {
    if((isUndefined(isClicked) && isUndefined(isTimer)) || !isLoaded)
      return false;

    html(_frame);
    _header = append(_frame,
      '<div class="module-header">\
        <div class="module-container module-row">' + HTML_LOGO + '<div class="btn-settings quad"><i class="icon-cog"></i></div></div>\
      </div>');
    _view = append(_frame, '<div class="module-col module-custom"></div>');
    _setting = append(_frame, '<div class="module-col module-custom module-settings hidden"></div>');

    var _components, _detach, _scroller, _folder, $settings;
    _components = append(_setting, '<div class="module-col module-custom"></div>');
    _detach = append(_setting, '<div class="module-hedge"><button class="btn btn-accept btn-detach">Einstellungen anwenden</button></div>');

    _scroller = append(_components, '<div class="module-scroller module-custom"></div>');
    _folder = append(_scroller, '<div class="module-container"></div>');

    $settings = new Setting(_folder);
    $settings.createSwitchRow('type', 'starter|main course|dessert|all'.split('|'), 'all');
    $settings.createSwitchRow('diet', 'vegetarian|vegan|gluten|none'.split('|'), 'none');
    $settings.createSwitchRow('cuisine', 'German|Italian|European|all'.split('|'), 'all');
    ['quickly prepared'].forEach((item) => {$settings.createSwitchItem(item, false)});

    settings = $settings.get();

    addClick(only('.btn-settings', _app), (e) => {toggleClass([_setting, _view], 'hidden'), $settings.reset()});

    addClick(_detach, (e) => {$settings.save(), settings = $settings.get(), toggleClass([_setting, _view], 'hidden'), (module_view == 'recipes') && loadRecepts()})

    loadContent();
  }


  /**
   * In this view, the user can insert all items into the fridge by scanning or tapping.
   */
  function loadContent () {
    module_view = 'fridge';

    html(_view);
    var _components, _main, _stack, _search;
    _components = append(_view,
      '<div class="module-components">\
        <div class="module-container module-row">\
          <div class="module-row module-search">\
            <div class="btn-add quad"><i class="icon-plus"></i></div>\
            <input type="text" placeholder="Search for goods ..." size="5" pattern="[a-zA-ZöäüßÖÄÜ]+"></input>\
            <div class="btn-barcode quad"><i class="icon-barcode"></i></div>\
          </div>\
        </div>\
      </div>');

    _main = append(_view, '<div class="module-col module-custom"></div>');

    _stack = append(_main,
      '<div class="module-scroller module-stack module-custom">\
        <div class="module-container">\
          <article>\
            <div class="module-picture">' + HTML_IMAGE_FRIDGE + '</div>\
            <div class="module-note">\
              <h2>What`s in my fridge?</h2>\
              <p>Scan or type in the first few ingredients and look for the tastiest recipes.</p>\
            </div>\
          </article>\
        </div>\
      </div>');

    _search = append(_main, '<div class="module-hedge"><button class="btn btn-accept btn-recipes">Search recipes</button></div>');

    var _input, _folder, _preview;
    _input = only('input', _app);
    _folder = only('.module-container', _stack);
    _preview = only('article', _app);

    /**
     * add new items to the fridge by adding items to {array} 'storage' and localStorage
     * @param {object} item - contains name and src of ingredient
     */
    function addItem (item) {
      if(isArray(item)) return item.forEach((coitem) => {addItem(coitem)});

      item.name = item.name.toLowerCase();
      var stackitem, index;
      if ((index = storage.findIndex(coitem => coitem.name == item.name)) > -1){
        if(stackitem = get('.stack-item')[storage.length - index - 1])
          stackitem.parentNode.removeChild(stackitem);
          storage.splice(index, 1);
      }
      storage.push(item)

      if(!isUndefined(localStorage))
        localStorage.setItem('items', JSON.stringify(storage));

      showItem(item);
    }

    /**
     * remove items from the fridge by removing items from {array} 'storage' and localStorage
     * @param {object} item - contains name and src of ingredient
     */
    function removeItem (item) {
      if(isArray(item)) return item.forEach((coitem) => {removeItem(coitem)});

      storage = storage.filter(coitem => !(coitem.name == item.name));
      if(!isUndefined(localStorage))
        localStorage.setItem('items', JSON.stringify(storage));
    }

    /**
     * show items from {array} 'storage' and localStorage
     * @param {object} item - contains name and src of ingredient
     */
    function showItem (item) {
      if(isArray(item)) return item.forEach((coitem) => {showItem(coitem)});

      _stackitem = insert(_folder,
        '<div class="stack-item" data-name="' + item.name + '">\
          <div class="quad"><!--<object data="' + item.src + '" type="image/png"></object>--></div>\
          <div class="stack-title">' + item.name + '</div>\
          <div class="stack-delete quad"><i class="icon-cancel"></i></div>\
        </div>');

      /**
       * delete and remove item from the fridge after button has been clicked
       */
      addClick(only('.stack-delete', _stackitem), function (item) {
        this.parentNode.removeChild(this);
        removeItem(item);

        if(!only('.stack-item', _app))
          removeClass(_preview, 'hidden');
      }.bind(_stackitem, item));

      addClass(_preview, 'hidden');

      return true;
    }

    /**
     * Once you have clicked the button or pressed the Enter key, add the new item from the input field
     */
    addClick(only('.btn-add', _app), function (e) {
      if(_input.value)
        return addItem({src:'', name:_input.value}), (_input.value = '')
    });
    //addEvent(_input, 'input', function (e) {});
    addEvent(_input, 'keyup', function (e) {
      if (this.value && (e.key === 'Enter' || e.keyCode === 13))
          return addItem({src:'', name:this.value}), (this.value = '')
    });

    var _scanner = append(_app, '<div class="barcode-reader hidden"><div></div><video></video></div>');
    var isScanning = false;
    var codeReader = new ZXing.BrowserBarcodeReader();

    /**
     * Once you have clicked the barcode button, open the barcode scanner
     */
    addClick(only('.btn-barcode', _app), async function (e) {
      if(isScanning) return false;

      var devices, device, controls;
      devices = await codeReader.listVideoInputDevices();

      for(var i = devices.length-1; i > 0; i--){
        device = devices[i];
        if(devices[i].label && devices[i].label.includes('back'))
          break;
      }

      if(!device) return false;

      function closeScanner () {
        codeReader.stopStreams();
        addClass(_scanner, 'hidden');
        isScanning = false;
      }
      codeReader.decodeFromVideoDevice(device.deviceId, only('video', _scanner), (result, err) => {
        /**
         * As soon as a barcode has been recognized, the product is identified
         * using the world.openfoodfacts.org API and added to the fridge
         */
        if(result){
          ajax('GET', 'https://world.openfoodfacts.org/api/v0/product/' + result.text + '.json', function (data, state, status) {
            if(state == 4 && status == 200 && (data = JSON.parse(data))){
              if(data.status != 1) {
                return log('product not found') && false;
              }
              var product = data.product;
              addItem({src: product.image_url, name: (product.product_name_en || product.product_name)});
            }
          });
          closeScanner();
        }
      });

      isScanning = true;

      /**
       * Scan can be ended with a single click
       */
      addOnce(_scanner, 'click', (e) => {isScanning && closeScanner()})

      removeClass(_scanner, 'hidden');
    });

    addClick(only('.btn-recipes', _app), (e) => loadRecepts());

    /**
     * All items that are stored in localStorage are displayed
     */
    storage = localStorage ? JSON.parse(localStorage.getItem('items')) : [];
    storage = isArray(storage) ? storage : [];
    showItem(storage)
  }


  /**
   * In this view, the user is shown all recipes with the filter applied
   */
  function loadRecepts () {
    module_view = 'recipes';

    html(_view);

    var _components, _main, _stack, _search;
    _components = append(_view,
      '<div class="module-components">\
        <div class="module-container module-row">\
          <div class="module-row module-back">\
            <div class="btn-back quad"><i class="icon-left-open-1"></i></div>\
            <p>Add more items?</p>\
          </div>\
        </div>\
      </div>');

    _main = append(_view, '<div class="module-col module-custom"></div>');

    _stack = append(_main, '<div class="module-scroller module-recipes module-custom"><div class="module-container"></div></div>');

    /**
     * The API of spoonacular.com is used to receive the recipes
     */
    var api_data = {
      apiKey : '208d26acf47242e88b2e6351bf6e960c',
      ingredients : storage.map(a => a.name).join(','),
      number : 10,
      addRecipeInformation: true,
      sort : 'min-missing-ingredients',
      cuisine : (settings['cuisine'] != 'all' ? settings['cuisine'] : ''),
      diet : (settings['diet'] != 'none' ? settings['diet'] : ''),
      type : (settings['type'] != 'all' ? settings['type'] : ''),
      maxReadyTime: (settings['quickly prepared'] ? 20 : 1000),
      ignorePantry : true
    }

    ajax('GET', 'https://api.spoonacular.com/recipes/findByIngredients?' + toQuery(api_data), (result, state, status) => {
      if(state == 4 && status == 200){
        var recipes = JSON.parse(result);
        api_data.ids = recipes.map(a => a.id).join(',');
        ajax('GET', 'https://api.spoonacular.com/recipes/informationBulk?' + toQuery(api_data), (result, state, status) => {
          if(state == 4 && status == 200){
            result = JSON.parse(result);
            result.forEach((recipe) => {
              var _recipe = append(only('.module-container', _stack),
                '<article class="module-col">\
                  <div class="module-image" style="background-image:url(\'' + recipe.image + '\')"></div>\
                  <div class="module-insight module-custom">\
                    <h2>' + recipe.title + '</h2>\
                    <div class="module-row">\
                      <span>Time: ' + recipe.readyInMinutes + 'min.</span>\
                      <span>health score: ' + recipe.healthScore + '</span>\
                    </div>\
                    <p>' + truncateText(recipe.summary, 1) + '</p>\
                  </div>\
                </article>');

              addClick(_recipe, function (e) {
                loadRecept(this)
              }.bind(recipe))
            });
          }

        });

      }
    });

    /**
     * When the button is clicked, you get to the fridge view
     */
    addClick(only('.btn-back', _app), (e) => {loadContent();})
  }

  /**
   * In this view, the user is shown the chosen recipe
   */
  function loadRecept (recipe) {
    module_view = 'recipe';

    html(_view);

    var _components, _main, _stack, _search;
    _components = append(_view,
      '<div class="module-components">\
        <div class="module-container module-row">\
          <div class="module-row module-back">\
            <div class="btn-back quad"><i class="icon-left-open-1"></i></div>\
            <p>Zu den Rezepten</p>\
          </div>\
        </div>\
      </div>');

    _main = append(_view, '<div class="module-col module-custom"></div>');

    _stack = append(_main,
      '<div class="module-scroller module-recipe module-custom">\
        <div class="module-wrapper">\
          <article>\
            <div class="module-image" style="background-image:url(\'' + recipe.image + '\')"></div>\
            <div class="module-container">\
              <h1>' + recipe.title + '</h1>\
              <div class="module-row">\
                <span>time: ' + recipe.readyInMinutes + 'min.</span>\
                <span>health score: ' + recipe.healthScore + '</span>\
              </div>\
              <p>' + recipe.summary + '</p>\
              <h2>ingredients</h2>\
              <div class="module-checkliste"></div>\
              <h2>preparation</h2>\
            </div>\
          </article>\
        </div>\
      </div>');

    /**
     * A checklist with all the necessary ingredients is created
     */
    if(isArray(recipe.analyzedInstructions)){
      recipe.analyzedInstructions[0].steps.forEach((step) => {
        append(only('.module-container', _stack), node('section', step.step));
        step.ingredients.forEach((ingredient) => {
          append(only('.module-checkliste', _stack), '<label class="module-checkbox">' + ingredient.name + '<input type="checkbox"><span class="checkmark"></span></label>')
        });

      });
    }

    append(only('.module-container', _stack), '<button class="btn btn-accept btn-finished">Finish recipe</button>');
    /**
     * When the button is clicked, you get to the recipes view
     */
    addClick(only('.btn-back', _app), (e) => {loadRecepts();});
    /**
     * Once the button is clicked, you get to the fridge view
     */
    addClick(only('.btn-finished', _app), (e) => {loadContent();});
  }

  loadPreview();

  addEvent(w, 'load', (e) => {(isLoaded = true) && loadStructure()});

}(window, window.document)

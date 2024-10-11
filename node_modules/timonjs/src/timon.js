/*!
 * timon.js
 * Copyright(c) 2024 Timon Fiedler
 * MIT Licensed
 */

/*
             ,,                                                 ,,
MMP""MM""YMM db                                               `7MM
P'   MM   `7                                                    MM
     MM    `7MM  `7MMpMMMb.pMMMb.  ,pW"Wq.`7MMpMMMb.       ,M""bMM  .gP"Ya `7M'   `MF'
     MM      MM    MM    MM    MM 6W'   `Wb MM    MM     ,AP    MM ,M'   Yb  VA   ,V
     MM      MM    MM    MM    MM 8M     M8 MM    MM     8MI    MM 8M""""""   VA ,V
     MM      MM    MM    MM    MM YA.   ,A9 MM    MM  ,, `Mb    MM YM.    ,    VVV
   .JMML.  .JMML..JMML  JMML  JMML.`Ybmd9'.JMML  JMML.db  `Wbmd"MML.`Mbmmd'     W

Visit https://www.timondev.com
*/

"use strict";

// Debug options
let DEBUG = false;

function timonjs_setDebugMode(value) {
  DEBUG = value;
}

function timonjs_message() {
  const message = (color, size, padding) => `color: ${color}; font-size: ${size}em; background-color: #000; font-family: Consolas, monospace; padding: 0.75em ${padding}; display: block;`;
  console.log("%cCustom Coded by @timon.dev", message("#0f0", 2, "25%"));
  console.log("%cVisit https://www.timondev.com", message("#fff", 1, "35%"));
}

// Functions

/**
 * Converts a file to a Base64-encoded string.
 * @param {File} file - The file to be converted to Base64.
 * @returns {Promise<string>} - A promise that resolves with the Base64-encoded string of the file.
 */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a file to a Base64-encoded string and resizes the image if its size exceeds the maximum bytes count.
 * @param {File} file - The file to be converted to Base64.
 * @param {number} bytes - The maximum bytes allowed.
 * @param {number} [scale=0.8] - The quality scale of the returned image.
 * @returns {Promise<string>} - Promise that resolves with the Base64-encoded string of the file.
 */
function toBase64Max(file, bytes, scale = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const scaleFactor = Math.min(1, bytes / file.size);
        const width = img.width * scaleFactor;
        const height = img.height * scaleFactor;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const resizedImage = canvas.toDataURL('image/jpeg', scale);
        resolve(resizedImage);
      };
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a JavaScript `Date` object to a readable date string in a specific format.
 * @param {Date} date - The date object to be converted to a readable date string.
 * @returns {string} - A string representing the date in the format "DD. Month YYYY um HH:MM:SS".
 */
function toDateString(date) {
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const time = date.toLocaleTimeString();

  return `${day}. ${month} ${year} um ${time}`;
}

/**
 * Attaches an event listener to a specified element.
 *
 * @param {Element} element - The DOM element to which the event listener will be attached.
 * @param {string} event - The name of the event to listen for (e.g., 'click', 'mouseover').
 * @param {Function} callback - The function to be called when the event is triggered.
 * @param {...any} args - Additional arguments to pass to the `addEventListener` method.
 * @returns {Element} The element to which the event listener was attached.
 */
function timonjs_on(element, event, callback, ...args) {
  element.addEventListener(event, callback, ...args);
  return element;
}

/**
 * Removes an event listener from the specified element.
 *
 * @param {Element} element - The DOM element from which to remove the event listener.
 * @param {string} event - The event type to remove (e.g., 'click', 'mouseover').
 * @param {Function} callback - The function to remove from the event listener.
 * @param {...any} args - Additional arguments to pass to removeEventListener.
 * @returns {Element} The element that had the event listener removed.
 */
function timonjs_off(element, event, callback, ...args) {
  element.removeEventListener(event, callback, ...args);
  return element;
}

/**
 * Attaches a click event listener to an element or triggers a native click.
 *
 * @param {HTMLElement} element - The DOM element to attach the click event listener to.
 * @param {Function} nativeClick - The native click function to call if no callback is provided.
 * @param {Function} [callback] - The callback function to execute when the element is clicked.
 * @param {...any} args - Additional arguments to pass to the event listener.
 * @returns {HTMLElement} The element with the event listener attached.
 */
function timonjs_click(element, nativeClick, callback, ...args) {
  if (typeof callback === "function") {
    element.addEventListener("click", callback, ...args);
  } else {
    nativeClick();
  }
  return element;
}

/**
 * Adds an event listener to each child element of the specified element.
 *
 * @param {HTMLElement} element - The parent element whose children will have the event listener added.
 * @param {string} event - The event type to listen for (e.g., 'click', 'mouseover').
 * @param {Function} callback - The function to be called when the event is triggered.
 * @param {...any} args - Additional arguments to pass to the event listener.
 * @returns {HTMLElement} The original parent element.
 */
function timonjs_childrenOn(element, event, callback, ...args) {
  Array.from(element.children).forEach(child => {
    child.addEventListener(event, callback, ...args);
  });
  return element;
}

/**
 * Removes an event listener from all child elements of a given element.
 *
 * @param {HTMLElement} element - The parent element whose children will have the event listener removed.
 * @param {string} event - The event type to remove (e.g., 'click', 'mouseover').
 * @param {Function} callback - The event handler function to remove.
 * @param {...*} args - Additional arguments to pass to removeEventListener.
 * @returns {HTMLElement} The parent element.
 */
function timonjs_childrenOff(element, event, callback, ...args) {
  Array.from(element.children).forEach(child => {
    child.removeEventListener(event, callback, ...args);
  });
  return element;
}

/**
 * Adds a click event listener to each child element of the given element, or triggers a click event on each child element.
 *
 * @param {HTMLElement} element - The parent element whose children will be affected.
 * @param {Function} [callback] - The function to be called when a child element is clicked. If not provided, a click event will be triggered on each child element.
 * @param {...any} args - Additional arguments to pass to the event listener.
 * @returns {HTMLElement} The original parent element.
 */
function timonjs_childrenClick(element, callback, ...args) {
  if (typeof callback === "function") {
    Array.from(element.children).forEach(child => {
      child.addEventListener("click", callback, ...args);
    });
  } else {
    Array.from(element.children).forEach(child => {
      child.click();
    });
  }
  return element;
}

/**
 * Applies CSS styles to a given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to which the styles will be applied.
 * @param {Object|string} styles - An object containing CSS property-value pairs or a string representing a single CSS property.
 * @param {string} [value] - The value of the CSS property if `styles` is a string.
 * @returns {HTMLElement|string} - The modified HTML element or the value of the CSS property if `value` is undefined.
 */
function timonjs_css(element, styles, value) {
  if (typeof styles === "object") {
    Object.entries(styles).map(([property, value]) => element.style.setProperty(property, value));
    Object.assign(element.style, styles);
  } else if (typeof styles === "string" && typeof value === "string") {
    element.style[styles] = value;
  } else if (typeof styles === "string" && typeof value === "undefined") {
    return element.style[styles];
  }
  return element;
}

/**
 * Toggles the display style of a given HTML element between two specified types.
 *
 * @param {HTMLElement} element - The HTML element to toggle.
 * @param {string} [type="block"] - The display style to set when the element is shown.
 * @param {string} [type2="none"] - The display style to set when the element is hidden.
 * @returns {HTMLElement} The HTML element with the updated display style.
 */
function timonjs_toggle(element, type = "block", type2 = "none") {
  element.style.display = element.style.display === type2 ? type : type2;
  return element;
}

/**
 * Hides the specified HTML element by setting its display style to "none".
 *
 * @param {HTMLElement} element - The HTML element to hide.
 * @returns {HTMLElement} The same HTML element that was hidden.
 */
function timonjs_hide(element) {
  element.style.display = "none";
  return element;
}

/**
 * Displays the specified HTML element by setting its display style.
 *
 * @param {HTMLElement} element - The HTML element to be displayed.
 * @param {string} [type="block"] - The display type to be applied. Defaults to "block".
 * @returns {HTMLElement} The HTML element that was displayed.
 */
function timonjs_show(element, type = "block") {
  element.style.display = type;
  return element;
}

/**
 * Sets the display style of the given HTML element to "flex".
 *
 * @param {HTMLElement} element - The HTML element to be styled.
 * @returns {HTMLElement} The same HTML element with the display style set to "flex".
 */
function timonjs_flex(element) {
  element.style.display = "flex";
  return element;
}

/**
 * Applies a CSS grid display style to the given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to which the grid display style will be applied.
 * @returns {HTMLElement} The same HTML element with the grid display style applied.
 */
function timonjs_grid(element) {
  element.style.display = "grid";
  return element;
}

/**
 * Rotates the given HTML element by a specified number of degrees.
 *
 * @param {HTMLElement} element - The HTML element to be rotated.
 * @param {number} degrees - The number of degrees to rotate the element.
 * @returns {HTMLElement} The rotated HTML element.
 */
function timonjs_rotate(element, degrees) {
  element.style.transform += `rotate(${degrees}deg)`;
  return element;
}

/**
 * Sets or gets the inner text of a given HTML element.
 *
 * @param {HTMLElement} element - The HTML element whose inner text is to be set or retrieved.
 * @param {string} [text] - The text to set as the inner text of the element. If omitted, the current inner text of the element is returned.
 * @returns {HTMLElement|string} - Returns the element if text is provided, otherwise returns the current inner text of the element.
 */
function timonjs_text(element, text) {
  if (typeof text === "undefined") {
    return element.innerText;
  } else {
    element.innerText = text.toString();
    return element;
  }
}

/**
 * Sets or gets the inner HTML of a given element.
 *
 * @param {HTMLElement} element - The DOM element to set or get the inner HTML from.
 * @param {string} [html] - The HTML string to set as the inner HTML of the element. If not provided, the current inner HTML of the element is returned.
 * @returns {HTMLElement|string} - Returns the element if setting the inner HTML, or the current inner HTML string if getting.
 */
function timonjs_html(element, html) {
  if (typeof html === "undefined") {
    return element.innerHTML;
  } else {
    element.innerHTML = html.toString();
    return element;
  }
}

/**
 * Gets or sets the value of a given element.
 *
 * @param {HTMLElement} element - The HTML element whose value is to be retrieved or set.
 * @param {string} [value] - The value to set for the element. If omitted, the current value of the element is returned.
 * @returns {string|HTMLElement} - Returns the current value of the element if no value is provided. 
 *                                 Returns the element itself after setting the value.
 */
function timonjs_val(element, value) {
  if (typeof value === "undefined") {
    return element.value;
  } else {
    element.value = value;
    return element;
  }
}

/**
 * Manipulates the class list of a given HTML element.
 *
 * @param {HTMLElement} element - The target HTML element.
 * @param {string|string[]} [className] - The class name(s) to be toggled. If not provided, returns the current class list as a string.
 * @param {string} [replaceClass] - A class name to be replaced by the new class name.
 * @returns {HTMLElement|string} - The modified HTML element or the current class list as a string if no className is provided.
 */
function timonjs_class(element, className, replaceClass) {
  const toggle = (name) => element.classList.toggle(name);

  if (typeof replaceClass === "undefined") {
    if (typeof className === "undefined") {
      return Array.from(element.classList).join(" ");
    } else if (Array.isArray(className)) {
      className.forEach(name => {
        toggle(name)
      });
    } else {
      toggle(className);
    }
  } else {
    toggle(replaceClass);
    toggle(className);
  }
  return element;
}

/**
 * Adds one or more class names to the specified element.
 *
 * @param {HTMLElement} element - The DOM element to which the class(es) will be added.
 * @param {...string} classList - One or more class names to be added to the element.
 * @returns {HTMLElement} The element with the added class(es).
 */
function timonjs_addClass(element, ...classList) {
  classList.forEach(name => {
    element.classList.add(name);
  });
  return element;
}

/**
 * Removes one or more class names from the specified element.
 *
 * @param {HTMLElement} element - The DOM element from which to remove the class names.
 * @param {...string} classList - One or more class names to be removed from the element.
 * @returns {HTMLElement} The element with the specified class names removed.
 */
function timonjs_removeClass(element, ...classList) {
  classList.forEach(name => {
    element.classList.remove(name);
  });
  return element;
}

/**
 * Replaces a specified class on an element with a new class.
 *
 * @param {HTMLElement} element - The DOM element on which to replace the class.
 * @param {string} replaceClass - The class to be removed from the element.
 * @param {string} setClass - The class to be added to the element.
 * @returns {HTMLElement} The element with the updated class.
 */
function timonjs_replaceClass(element, replaceClass, setClass) {
  element.classList.remove(replaceClass);
  element.classList.add(setClass);
  return element;
}

/**
 * Toggles one or more class names on the specified element.
 *
 * @param {HTMLElement} element - The DOM element to toggle class names on.
 * @param {...string} classNames - One or more class names to toggle.
 * @returns {HTMLElement} The element with the toggled class names.
 */
function timonjs_toggleClass(element, ...classNames) {
  classNames.forEach(className => {
    element.classList.toggle(className);
  });
  return element;
}

/**
 * Checks if the given element has all the specified class names.
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @param {...string} classNames - The class names to check for.
 * @returns {boolean} True if the element has all the specified class names, otherwise false.
 */
function timonjs_hasClass(element, ...classNames) {
  return classNames.every(className => element.classList.contains(className));
}

/**
 * Manipulates the attributes of a given DOM element.
 *
 * @param {HTMLElement} element - The DOM element to manipulate.
 * @param {string|Object} [type] - The attribute name as a string, or an object containing key-value pairs of attributes.
 * @param {string} [value] - The value to set for the specified attribute name.
 * @returns {HTMLElement|Object|string} - Returns the element itself if setting attributes, 
 *                                        an object of all attributes if no type and value are provided,
 *                                        or the value of the specified attribute if only type is provided.
 */
function timonjs_attr(element, type, value) {
  if (typeof value === "undefined" && typeof type === "undefined") {
    const attributes = {};
    for (const attr of element.attributes) {
      attributes[attr.name] = attr.value;
    }
    return attributes;
  } else if (typeof value === "undefined" && typeof type === "string") {
    return element.getAttribute(type);
  } else if (typeof type === "object") {
    Object.entries(type).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  } else {
    element.setAttribute(type, value);
  }
  return element;
}

/**
 * Sets or gets an attribute on a given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to set or get the attribute on.
 * @param {string} type - The type of attribute to set or get.
 * @param {string} value - The value to set for the attribute. If omitted, the current value of the attribute is returned.
 * @returns {string|undefined} - The current value of the attribute if getting, or undefined if setting.
 */
function timonjs_attribute(element, type, value) {
  return timonjs_attr(element, type, value);
}

/**
 * Manipulates or retrieves data attributes of a given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to manipulate or retrieve data from.
 * @param {string} [dataName] - The name of the data attribute to manipulate or retrieve.
 * @param {string} [value] - The value to set for the specified data attribute.
 * @returns {HTMLElement|Object|string} - Returns the element itself if setting a value,
 *                                         an object of all data attributes if no dataName is provided,
 *                                         or the value of the specified data attribute if no value is provided.
 */
function timonjs_data(element, dataName, value) {
  if (typeof value === "undefined" && typeof dataName === "undefined") {
    const dataObject = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith("data")) {
        dataObject[attr.name] = attr.value;
      }
    }
    return dataObject;
  } else if (typeof value === "undefined" && typeof dataName === "string") {
    return element.getAttribute(dataName);
  } else if (typeof value === "string" && typeof dataName === "string") {
    element.setAttribute(dataName, value);
  }
  return element;
}

/**
 * Toggles the inner text of a given HTML element between two specified texts.
 *
 * @param {HTMLElement} element - The HTML element whose text is to be toggled.
 * @param {string} text1 - The first text option.
 * @param {string} text2 - The second text option.
 * @returns {HTMLElement} The HTML element with its text toggled.
 */
function timonjs_toggleText(element, text1, text2) {
  if (element.innerText === text1) {
    element.innerText = text2;
  } else {
    element.innerText = text1;
  }
  return element;
}

/**
 * Toggles the innerHTML of a given element between two provided HTML strings.
 *
 * @param {HTMLElement} element - The DOM element whose innerHTML will be toggled.
 * @param {string} html1 - The first HTML string to toggle.
 * @param {string} html2 - The second HTML string to toggle.
 * @returns {HTMLElement} The DOM element with its innerHTML toggled.
 */
function timonjs_toggleHTML(element, html1, html2) {
  if (element.innerHTML === html1) {
    element.innerHTML = html2;
  } else {
    element.innerHTML = html1;
  }
  return element;
}

/**
 * Retrieves the parent element of the given element. If the parent element has an ID, it returns the element with that ID.
 * If the parent element does not have an ID, it assigns a temporary random ID to the parent, retrieves the element, 
 * removes the temporary ID, and then returns the parent element.
 *
 * @param {HTMLElement} element - The child element whose parent is to be retrieved.
 * @returns {HTMLElement} - The parent element of the given element.
 */
function timonjs_parent(element) {
  const parent = element.parentElement;
  if (typeof parent.id === "string") {
    return document.getElementById(parent.id);
  } else {
    const id = randomString(128);
    parent.id = id;
    const parentElement = document.getElementById(id);
    parentElement.removeAttribute("id");
    return parentElement;
  }
}

/**
 * Checks if a given element has a specific child element.
 *
 * @param {HTMLElement} element - The parent element to check within.
 * @param {HTMLElement} child - The child element to look for.
 * @returns {boolean} - Returns true if the child element is found within the parent element, otherwise false.
 */
function hasChild(element, child) {
  for (let i = 0; i < element.children.length; i++) {
    if (child === element.children[i]) return true;
  }
  return false;
}

/**
 * Checks if a given element has a child with a specific ID.
 *
 * @param {HTMLElement} element - The parent element to search within.
 * @param {string} id - The ID of the child element to look for.
 * @returns {boolean} - Returns true if the child with the specified ID is found, otherwise false.
 */
function hasChildWithId(element, id) {
  const child = document.getElementById(id);
  for (let i = 0; i < element.children.length; i++) {
    if (child === element.children[i]) return true;
  }
  return false;
}

/**
 * Returns the offset width of the given HTML element.
 *
 * @param {HTMLElement} element - The HTML element whose offset width is to be retrieved.
 * @returns {number} The offset width of the element in pixels.
 */
function timonjs_x(element) {
  return element.offsetWidth;
}

/**
 * Returns the offset height of the given HTML element.
 *
 * @param {HTMLElement} element - The HTML element whose offset height is to be returned.
 * @returns {number} The offset height of the element.
 */
function timonjs_y(element) {
  return element.offsetHeight;
}

/**
 * Calculates the width and height of a given HTML element.
 *
 * @param {HTMLElement} element - The HTML element to measure.
 * @returns {Object} An object containing the width (`x`) and height (`y`) of the element.
 */
function timonjs_xy(element) {
  return {
    x: element.offsetWidth,
    y: element.offsetHeight
  };
}

/**
 * Assigns or retrieves a custom ID for a given element.
 *
 * @param {Object} element - The element to assign or retrieve the custom ID.
 * @param {string} [id] - The custom ID to assign. If not provided, the function will return the current custom ID of the element.
 * @returns {Object|string} - Returns the element if an ID is assigned, or the current custom ID if no ID is provided.
 */
function timonjs_customId(element, id) {
  if (typeof id === "string") {
    element.timonId = id;
  } else {
    return element.timonId;
  }
  return element;
}

/**
 * Assigns a custom ID to the given element.
 *
 * @param {HTMLElement} element - The DOM element to which the ID will be assigned.
 * @param {string} id - The custom ID to assign to the element.
 * @returns {HTMLElement} The element with the assigned custom ID.
 */
function timonjs_timonId(element, id) {
  return timonjs_customId(element, id);
}

/**
 * Appends multiple nodes to a given element.
 *
 * @param {HTMLElement} element - The element to which the nodes will be appended.
 * @param {...Node} nodes - The nodes to append to the element.
 * @returns {HTMLElement} The element with the appended nodes.
 */
function timonjs_append(element, ...nodes) {
  nodes.forEach(node => {
    element.appendChild(node);
  });
  return element;
}

/**
 * Prepends multiple nodes to the given element.
 *
 * @param {HTMLElement} element - The element to which the nodes will be prepended.
 * @param {...Node} nodes - The nodes to prepend to the element.
 * @returns {HTMLElement} The element with the prepended nodes.
 */
function timonjs_prepend(element, ...nodes) {
  nodes.forEach(node => {
    element.prepend(node);
  });
  return element;
}

/**
 * Returns the number of child elements of the given element.
 *
 * @param {HTMLElement} element - The parent element whose children are to be counted.
 * @returns {number} The number of child elements.
 */
function timonjs_childrenCount(element) {
  return element.children.length;
}

/**
 * Retrieves the first file from the input element's file list.
 *
 * @param {HTMLInputElement} element - The input element containing the file list.
 * @returns {File|null} The first file in the file list, or null if no files are selected.
 */
function timonjs_file(element) {
  if (typeof element.files[0] === "undefined") {
    return null;
  } else {
    return element.files[0];
  }
}

/**
 * Retrieves the files from the given HTML input element.
 *
 * @param {HTMLInputElement} element - The HTML input element from which to retrieve the files.
 * @returns {FileList} The list of files selected in the input element.
 */
function timonjs_files(element) {
  return element.files;
}

/**
 * Checks if the given element's value is empty.
 *
 * This function considers a value empty if it is:
 * - `undefined`
 * - `null`
 * - an empty string
 * - an empty array
 * - an empty object
 *
 * @param {Object} element - The element whose value is to be checked.
 * @param {*} element.value - The value to be checked.
 * @returns {boolean} `true` if the value is empty, otherwise `false`.
 */
function timonjs_valIsEmpty(element) {
  const value = element.value;
  if (value === undefined || value === null || value === "" || typeof value === "undefined") {
    return true;
  } else if (Array.isArray(value) && value?.length === 0) {
    return true;
  } else if (typeof value === "object" && Object.keys(value)?.length === 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * Checks if the given element is empty.
 *
 * @param {any} element - The element to check.
 * @returns {boolean} - Returns true if the element is empty, otherwise false.
 */
function timonjs_vIE(element) {
  return timonjs_valIsEmpty(element);
}

/**
 * Checks if the text content of a given element is empty.
 *
 * This function evaluates the `innerText` property of the provided element
 * and determines if it is empty. It considers various cases such as:
 * - `undefined`
 * - `null`
 * - An empty string
 * - An empty array
 * - An empty object
 *
 * @param {HTMLElement} element - The DOM element whose text content is to be checked.
 * @returns {boolean} - Returns `true` if the text content is empty, otherwise `false`.
 */
function timonjs_textIsEmpty(element) {
  const text = element.innerText;
  if (text === undefined || text === null || text === "" || typeof text === "undefined") {
    return true;
  } else if (Array.isArray(text) && text?.length === 0) {
    return true;
  } else if (typeof text === "object" && Object.keys(text)?.length === 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * Checks if the inner HTML of a given element is empty.
 *
 * This function considers the inner HTML to be empty if it is:
 * - `undefined`
 * - `null`
 * - an empty string `""`
 * - an empty array `[]`
 * - an empty object `{}`
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} - Returns `true` if the inner HTML is empty, otherwise `false`.
 */
function timonjs_htmlIsEmpty(element) {
  const html = element.innerHTML;
  if (html === undefined || html === null || html === "" || typeof html === "undefined") {
    return true;
  } else if (Array.isArray(html) && html?.length === 0) {
    return true;
  } else if (typeof html === "object" && Object.keys(html)?.length === 0) {
    return true;
  } else {
    return false;
  }
}

/**
 * Inserts the given nodes after the specified element.
 *
 * @param {Element} element - The reference element after which the nodes will be inserted.
 * @param {...Node} nodes - The nodes to be inserted after the reference element.
 * @returns {Element} The reference element after the nodes have been inserted.
 */
function timonjs_addAfter(element, ...nodes) {
  nodes.forEach(node => {
    element.insertAdjacentElement(node);
  });
  return element;
}

/**
 * Inserts the specified nodes before the given element in the DOM.
 *
 * @param {HTMLElement} element - The reference element before which the new nodes will be inserted.
 * @param {...Node} nodes - The nodes to be inserted before the reference element.
 * @returns {HTMLElement} The reference element.
 */
function timonjs_addBefore(element, ...nodes) {
  nodes.forEach(node => {
    element.parentElement.insertBefore(node, element);
  });
  return element;
}

/**
 * Retrieves an image from the given element. The element can be an <img>, <canvas>, or an <input> of type "file".
 * 
 * @param {HTMLElement} element - The element from which to retrieve the image.
 * @returns {HTMLImageElement} The image element created from the source.
 * @throws {Error} If the element does not contain an image.
 */
function timonjs_getImg(element) {
  if (element.tagName !== "IMG" && element.tagName !== "CANVAS" && !(element.tagName === "INPUT" && element.type === "file")) {
    throw new Error("This element does not contain an image.");
  }

  const image = new Image();

  if (element.tagName === "IMG") {
    image.src = element.src;
  } else if (element.tagName === "INPUT") {
    const file = element.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        image.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  } else if (element.tagName === "CANVAS") {
    const context = element.getContext("2d");
    image.onload = () => {
      context.drawImage(image, 0, 0);
    };
    image.src = "image.jpg";
  }

  return image;
}

/**
 * Converts an image element (IMG, CANVAS, or file INPUT) to a base64-encoded string.
 *
 * @param {HTMLElement} element - The element containing the image. Must be an IMG, CANVAS, or file INPUT element.
 * @returns {Promise<string>} A promise that resolves to a base64-encoded string of the image.
 * @throws {Error} If the element does not contain an image or if there is an error loading the image.
 */
function timonjs_getImgBase64(element) {
  if (element.tagName !== "IMG" && element.tagName !== "CANVAS" && !(element.tagName === "INPUT" && element.type === "file")) {
    throw new Error("This element does not contain an image.");
  }

  if (element.tagName === "IMG") {
    const image = new Image();
    image.src = element.src;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, image.width, image.height);

        resolve(canvas.toDataURL("image/png"));
      };

      image.onerror = () => {
        reject(new Error("Failed to load image."));
      };
    });
  } else if (element.tagName === "INPUT") {
    const file = element.files[0];

    if (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          resolve(event.target.result);
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file."));
        };

        reader.readAsDataURL(file);
      });
    }
  } else if (element.tagName === "CANVAS") {
    return Promise.resolve(element.toDataURL("image/png"));
  }
}

/**
 * Asynchronously retrieves the base64 representation of an image from a given element.
 *
 * @param {HTMLElement} element - The HTML element containing the image.
 * @returns {Promise<string>} A promise that resolves to the base64 string of the image.
 */
async function timonjs_imgBase(element) {
  return await timonjs_getImgBase64(element);
}

/**
 * Requests fullscreen mode for the given HTML element.
 *
 * This function attempts to make the provided element enter fullscreen mode
 * using the appropriate method for the current browser.
 *
 * @param {HTMLElement} element - The HTML element to be displayed in fullscreen mode.
 */
function timonjs_fullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/**
 * Retrieves a DOM element based on its ID and provides additional functionality for event handling and CSS styling.
 * @param {string} id - The ID of the DOM element to retrieve.
 * @param {Node|NodeList} caller - The DOM element to call the function from.
 * @returns {Element} - The retrieved DOM element with additional functionality for event handling and CSS styling.
 */
function getElm(id, caller = document) {
  const element = caller.getElementById(id);

  if (element === null) {
    // The element does not exist
    console.error(`The element with id ${id} does not exist!`);
  }

  if (typeof element.timonId === "string") {
    // The element already has all the functions attached
    return element;
  }

  /**
   * Logs an error message if a function with the given name is already declared for an element.
   * The message indicates that the existing function is being replaced and provides the new name for the replaced function.
   *
   * @param {string} name - The name of the function that is already declared.
   */
  const settingError = name => {
    if (DEBUG) console.log(`The function "${name}" is already declared for this element. The replaced function is named "_${name}".`);
  }

  // Marks the element with a timonId to indicate that all the functions have been attached
  element.timonId = randomString(16);

  /**
   * Binds the click method of the given element to the nativeClick constant.
   *
   * @constant {Function} nativeClick - The bound click method of the element.
   * @param {HTMLElement} element - The DOM element whose click method is being bound.
   */
  const nativeClick = element.click.bind(element);

  try {
    element.on = (event, callback, ...args) => timonjs_on(element, event, callback, ...args);
  } catch (error) {
    settingError("on");
    element._on = (event, callback, ...args) => timonjs_on(element, event, callback, ...args);
  }
  
  try {
    element.off = (event, callback, ...args) => timonjs_off(element, event, callback, ...args);
  } catch (error) {
    settingError("off");
    element._off = (event, callback, ...args) => timonjs_off(element, event, callback, ...args);
  }
  
  try {
    element.click = (callback, ...args) => timonjs_click(element, nativeClick, callback, ...args);
  } catch (error) {
    settingError("click");
    element._click = (callback, ...args) => timonjs_click(element, nativeClick, callback, ...args);
  }
  
  try {
    element.childrenOn = (event, callback, ...args) => timonjs_childrenOn(element, event, callback, ...args);
  } catch (error) {
    settingError("childrenOn");
    element._childrenOn = (event, callback, ...args) => timonjs_childrenOn(element, event, callback, ...args);
  }
  
  try {
    element.childrenOff = (event, callback, ...args) => timonjs_childrenOff(element, event, callback, ...args);
  } catch (error) {
    settingError("childrenOff");
    element._childrenOff = (event, callback, ...args) => timonjs_childrenOff(element, event, callback, ...args);
  }
  
  try {
    element.childrenClick = (callback, ...args) => timonjs_childrenClick(element, callback, ...args);
  } catch (error) {
    settingError("childrenClick");
    element._childrenClick = (callback, ...args) => timonjs_childrenClick(element, callback, ...args);
  }
  
  try {
    element.css = (styles, value) => timonjs_css(element, styles, value);
  } catch (error) {
    settingError("css");
    element._css = (styles, value) => timonjs_css(element, styles, value);
  }
  
  try {
    element.toggle = (type, type2) => timonjs_toggle(element, type, type2);
  } catch (error) {
    settingError("toggle");
    element._toggle = (type, type2) => timonjs_toggle(element, type, type2);
  }
  
  try {
    element.hide = () => timonjs_hide(element);
  } catch (error) {
    settingError("hide");
    element._hide = () => timonjs_hide(element);
  }
  
  try {
    element.show = (type) => timonjs_show(element, type);
  } catch (error) {
    settingError("show");
    element._show = (type) => timonjs_show(element, type);
  }
  
  try {
    element.flex = () => timonjs_flex(element);
  } catch (error) {
    settingError("flex");
    element._flex = () => timonjs_flex(element);
  }
  
  try {
    element.grid = () => timonjs_grid(element);
  } catch (error) {
    settingError("grid");
    element._grid = () => timonjs_grid(element);
  }
  
  try {
    element.rotate = degrees => timonjs_rotate(element, degrees);
  } catch (error) {
    settingError("rotate");
    element._rotate = degrees => timonjs_rotate(element, degrees);
  }
  
  try {
    if (element.text) throw new Error();
    element.text = text => timonjs_text(element, text);
  } catch (error) {
    settingError("text");
    element._text = text => timonjs_text(element, text);
  }
  
  try {
    element.html = html => timonjs_html(element, html);
  } catch (error) {
    settingError("html");
    element._html = html => timonjs_html(element, html);
  }
  
  try {
    element.val = value => timonjs_val(element, value);
  } catch (error) {
    settingError("val");
    element._val = value => timonjs_val(element, value);
  }
  
  try {
    element.class = (className, replaceClass) => timonjs_class(element, className, replaceClass);
  } catch (error) {
    settingError("class");
    element._class = (className, replaceClass) => timonjs_class(element, className, replaceClass);
  }
  
  try {
    element.addClass = (...classList) => timonjs_addClass(element, ...classList);
  } catch (error) {
    settingError("addClass");
    element._addClass = (...classList) => timonjs_addClass(element, ...classList);
  }
  
  try {
    element.removeClass = (...classList) => timonjs_removeClass(element, ...classList);
  } catch (error) {
    settingError("removeClass");
    element._removeClass = (...classList) => timonjs_removeClass(element, ...classList);
  }
  
  try {
    element.replaceClass = (replaceClass, setClass) => timonjs_replaceClass(element, replaceClass, setClass);
  } catch (error) {
    settingError("replaceClass");
    element._replaceClass = (replaceClass, setClass) => timonjs_replaceClass(element, replaceClass, setClass);
  }
  
  try {
    element.toggleClass = (...classNames) => timonjs_toggleClass(element, ...classNames);
  } catch (error) {
    settingError("toggleClass");
    element._toggleClass = (...classNames) => timonjs_toggleClass(element, ...classNames);
  }
  
  try {
    element.hasClass = (...classNames) => timonjs_hasClass(element, ...classNames);
  } catch (error) {
    settingError("hasClass");
    element._hasClass = (...classNames) => timonjs_hasClass(element, ...classNames);
  }
  
  try {
    element.attr = (type, value) => timonjs_attr(element, type, value);
  } catch (error) {
    settingError("attr");
    element._attr = (type, value) => timonjs_attr(element, type, value);
  }
  
  try {
    if (element.attribute) throw new Error();
    element.attribute = (type, value) => timonjs_attribute(element, type, value);
  } catch (error) {
    settingError("attribute");
    element._attribute = (type, value) => timonjs_attribute(element, type, value);
  }
  
  try {
    element.data = (dataName, value) => timonjs_data(element, dataName, value);
  } catch (error) {
    settingError("data");
    element._data = (dataName, value) => timonjs_data(element, dataName, value);
  }
  
  try {
    element.toggleText = (text1, text2) => timonjs_toggleText(element, text1, text2);
  } catch (error) {
    settingError("toggleText");
    element._toggleText = (text1, text2) => timonjs_toggleText(element, text1, text2);
  }
  
  try {
    element.toggleHTML = (html1, html2) => timonjs_toggleHTML(element, html1, html2);
  } catch (error) {
    settingError("toggleHTML");
    element._toggleHTML = (html1, html2) => timonjs_toggleHTML(element, html1, html2);
  }
  
  try {
    if (element.parent) throw new Error();
    element.parent = () => timonjs_parent(element);
  } catch (error) {
    settingError("parent");
    element._parent = () => timonjs_parent(element);
  }
  
  try {
    element.hasChild = child => hasChild(element, child);
  } catch (error) {
    settingError("hasChild");
    element._hasChild = child => hasChild(element, child);
  }
  
  try {
    element.hasChildWithId = id => hasChildWithId(element, id);
  } catch (error) {
    settingError("hasChildWithId");
    element._hasChildWithId = id => hasChildWithId(element, id);
  }
  
  try {
    element.x = () => timonjs_x(element);
  } catch (error) {
    settingError("x");
    element._x = () => timonjs_x(element);
  }
  
  try {
    element.y = () => timonjs_y(element);
  } catch (error) {
    settingError("y");
    element._y = () => timonjs_y(element);
  }
  
  try {
    element.xy = () => timonjs_xy(element);
  } catch (error) {
    settingError("xy");
    element._xy = () => timonjs_xy(element);
  }
  
  try {
    element.customId = id => timonjs_customId(element, id);
  } catch (error) {
    settingError("customId");
    element._customId = id => timonjs_customId(element, id);
  }
  
  try {
    element.timonId = id => timonjs_timonId(element, id);
  } catch (error) {
    settingError("timonId");
    element._timonId = id => timonjs_timonId(element, id);
  }
  
  try {
    if (element.append) throw new Error();
    element.append = (...nodes) => timonjs_append(element, ...nodes);
  } catch (error) {
    settingError("append");
    element._append = (...nodes) => timonjs_append(element, ...nodes);
  }
  
  try {
    element.prepend = (...nodes) => timonjs_prepend(element, ...nodes);
  } catch (error) {
    settingError("prepend");
    element._prepend = (...nodes) => timonjs_prepend(element, ...nodes);
  }
  
  try {
    element.childrenCount = () => timonjs_childrenCount(element);
  } catch (error) {
    settingError("childrenCount");
    element._childrenCount = () => timonjs_childrenCount(element);
  }
  
  try {
    element.file = () => timonjs_file(element);
  } catch (error) {
    settingError("file");
    element._file = () => timonjs_file(element);
  }
  
  try {
    if (element.files) throw new Error();
    element.files = () => timonjs_files(element);
  } catch (error) {
    settingError("files");
    element._files = () => timonjs_files(element);
  }
  
  try {
    element.valIsEmpty = () => timonjs_valIsEmpty(element);
  } catch (error) {
    settingError("valIsEmpty");
    element._valIsEmpty = () => timonjs_valIsEmpty(element);
  }
  
  try {
    element.vIE = () => timonjs_vIE(element);
  } catch (error) {
    settingError("vIE");
    element._vIE = () => timonjs_vIE(element);
  }
  
  try {
    element.textIsEmpty = () => timonjs_textIsEmpty(element);
  } catch (error) {
    settingError("textIsEmpty");
    element._textIsEmpty = () => timonjs_textIsEmpty(element);
  }
  
  try {
    element.htmlIsEmpty = () => timonjs_htmlIsEmpty(element);
  } catch (error) {
    settingError("htmlIsEmpty");
    element._htmlIsEmpty = () => timonjs_htmlIsEmpty(element);
  }
  
  try {
    element.addAfter = (...nodes) => timonjs_addAfter(element, ...nodes);
  } catch (error) {
    settingError("addAfter");
    element._addAfter = (...nodes) => timonjs_addAfter(element, ...nodes);
  }
  
  try {
    element.addBefore = (...nodes) => timonjs_addBefore(element, ...nodes);
  } catch (error) {
    settingError("addBefore");
    element._addBefore = (...nodes) => timonjs_addBefore(element, ...nodes);
  }
  
  try {
    element.getImg = () => timonjs_getImg(element);
  } catch (error) {
    settingError("getImg");
    element._getImg = () => timonjs_getImg(element);
  }
  
  try {
    element.getImgBase64 = () => timonjs_getImgBase64(element);
  } catch (error) {
    settingError("getImgBase64");
    element._getImgBase64 = () => timonjs_getImgBase64(element);
  }
  
  try {
    element.imgBase = () => timonjs_imgBase(element);
  } catch (error) {
    settingError("imgBase");
    element._imgBase = () => timonjs_imgBase(element);
  }
  
  try {
    element.fullscreen = () => timonjs_fullscreen(element);
  } catch (error) {
    settingError("fullscreen");
    element._fullscreen = () => timonjs_fullscreen(element);
  }

  element.getElm = id => getElm(id, element);

  element.getQuery = query => getQuery(query, element);

  return element;
}

/**
 * Retrieves DOM elements based on a CSS selector query and provides additional functionality for event handling and CSS styling.
 * @param {string} query - The CSS selector query used to select the desired elements.
 * @param {Node|NodeList} caller - The DOM element to call the function from.
 * @returns {NodeList} - A collection of DOM elements with additional functionality for event handling and CSS styling.
 */
function getQuery(query, caller = document) {

  const elements = caller.querySelectorAll(query);

  if (elements.length === 0) {
    // No elements with that query exist
    console.error(`There is no element with query ${query}`);
  }

  /**
     * Logs an error message if a function with the given name is already declared for an element.
     * The message indicates that the existing function is being replaced and provides the new name for the replaced function.
     *
     * @param {string} name - The name of the function that is already declared.
     */
  const settingError = name => {
    if (DEBUG) console.log(`The function "${name}" is already declared for this element. The replaced function is named "_${name}".`);
  }

  try {
    elements.get = position => elements[position];
  } catch (error) {
    settingError("get");
    elements._get = position => elements[position];
  }

  try {
    elements.on = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_on(elements[i], event, callback, ...args);
      }
    }
  } catch (error) {
    settingError("on");
    elements._on = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_on(elements[i], event, callback, ...args);
      }
    }
  }

  try {
    elements.off = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_off(elements[i], event, callback, ...args);
      }
    }
  } catch (error) {
    settingError("off");
    elements._off = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_off(elements[i], event, callback, ...args);
      }
    }
  }

  try {
    elements.click = (callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_click(elements[i], elements[i].click.bind(elements[i]), callback, ...args);
      }
    }
  } catch (error) {
    settingError("click");
    elements._click = (callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_click(elements[i], elements[i].click.bind(elements[i]), callback, ...args);
      }
    }
  }

  try {
    elements.childrenOn = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenOn(elements[i], event, callback, ...args);
      }
    }
  } catch (error) {
    settingError("childrenOn");
    elements._childrenOn = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenOn(elements[i], event, callback, ...args);
      }
    }
  }

  try {
    elements.childrenOff = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenOff(elements[i], event, callback, ...args);
      }
    }
  } catch (error) {
    settingError("childrenOff");
    elements._childrenOff = (event, callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenOff(elements[i], event, callback, ...args);
      }
    }
  }

  try {
    elements.childrenClick = (callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenClick(elements[i], callback, ...args);
      }
    }
  } catch (error) {
    settingError("childrenClick");
    elements._childrenClick = (callback, ...args) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_childrenClick(elements[i], callback, ...args);
      }
    }
  }

  try {
    elements.css = (styles, value) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_css(elements[i], styles, value);
      }
    }
  } catch (error) {
    settingError("css");
    elements._css = (styles, value) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_css(elements[i], styles, value);
      }
    }
  }

  try {
    elements.toggle = (type, type2) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_toggle(elements[i], type, type2);
      }
    }
  } catch (error) {
    settingError("toggle");
    elements._toggle = (type, type2) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_toggle(elements[i], type, type2);
      }
    }
  }

  try {
    elements.hide = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_hide(elements[i]);
      }
    }
  } catch (error) {
    settingError("hide");
    elements._hide = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_hide(elements[i]);
      }
    }
  }

  try {
    elements.show = (type) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_show(elements[i], type);
      }
    }
  } catch (error) {
    settingError("show");
    elements._show = (type) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_show(elements[i], type);
      }
    }
  }

  try {
    elements.flex = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_flex(elements[i]);
      }
    }
  } catch (error) {
    settingError("flex");
    elements._flex = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_flex(elements[i]);
      }
    }
  }

  try {
    elements.grid = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_grid(elements[i]);
      }
    }
  } catch (error) {
    settingError("grid");
    elements._grid = () => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_grid(elements[i]);
      }
    }
  }

  try {
    elements.class = (className, replaceClass) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_class(elements[i], className, replaceClass);
      }
    }
  } catch (error) {
    settingError("class");
    elements._class = (className, replaceClass) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_class(elements[i], className, replaceClass);
      }
    }
  }

  try {
    elements.addClass = (...classList) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addClass(elements[i], ...classList);
      }
    }
  } catch (error) {
    settingError("addClass");
    elements._addClass = (...classList) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addClass(elements[i], ...classList);
      }
    }
  }

  try {
    elements.removeClass = (...classList) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_removeClass(elements[i], ...classList);
      }
    }
  } catch (error) {
    settingError("removeClass");
    elements._removeClass = (...classList) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_removeClass(elements[i], ...classList);
      }
    }
  }

  try {
    elements.replaceClass = (replaceClass, setClass) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_replaceClass(elements[i], replaceClass, setClass);
      }
    }
  } catch (error) {
    settingError("replaceClass");
    elements._replaceClass = (replaceClass, setClass) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_replaceClass(elements[i], replaceClass, setClass);
      }
    }
  }

  try {
    elements.toggleClass = (...classNames) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_toggleClass(elements[i], ...classNames);
      }
    }
  } catch (error) {
    settingError("toggleClass");
    elements._toggleClass = (...classNames) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_toggleClass(elements[i], ...classNames);
      }
    }
  }

  try {
    elements.hasClass = (...classNames) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_hasClass(elements[i], ...classNames);
      }
    }
  } catch (error) {
    settingError("hasClass");
    elements._hasClass = (...classNames) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_hasClass(elements[i], ...classNames);
      }
    }
  }

  try {
    if (elements.append) throw new Error();
    elements.append = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_append(elements[i], ...nodes);
      }
    }
  } catch (error) {
    settingError("append");
    elements._append = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_append(elements[i], ...nodes);
      }
    }
  }

  try {
    elements.prepend = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_prepend(elements[i], ...nodes);
      }
    }
  } catch (error) {
    settingError("prepend");
    elements._prepend = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_prepend(elements[i], ...nodes);
      }
    }
  }

  try {
    elements.addAfter = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addAfter(elements[i], ...nodes);
      }
    }
  } catch (error) {
    settingError("addAfter");
    elements._addAfter = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addAfter(elements[i], ...nodes);
      }
    }
  }

  try {
    elements.addBefore = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addBefore(elements[i], ...nodes);
      }
    }
  } catch (error) {
    settingError("addBefore");
    elements._addBefore = (...nodes) => {
      for (let i = 0; i < elements.length; i++) {
        timonjs_addBefore(elements[i], ...nodes);
      }
    }
  }

  for (let i = 0; i < elements.length; i++) {

    const element = elements[i];

    if (typeof element.timonId === "string") {
      // The element already has all the functions attached
      continue;
    }

    // Marks the element with a timonId to indicate that all the functions have been attached
    element.timonId = randomString(16);

    /**
     * Binds the click method of the given element to the nativeClick constant.
     *
     * @constant {Function} nativeClick - The bound click method of the element.
     * @param {HTMLElement} element - The DOM element whose click method is being bound.
     */
    const nativeClick = element.click.bind(element);

    try {
      element.on = (event, callback, ...args) => timonjs_on(element, event, callback, ...args);
    } catch (error) {
      settingError("on");
      element._on = (event, callback, ...args) => timonjs_on(element, event, callback, ...args);
    }
    
    try {
      element.off = (event, callback, ...args) => timonjs_off(element, event, callback, ...args);
    } catch (error) {
      settingError("off");
      element._off = (event, callback, ...args) => timonjs_off(element, event, callback, ...args);
    }
    
    try {
      element.click = (callback, ...args) => timonjs_click(element, nativeClick, callback, ...args);
    } catch (error) {
      settingError("click");
      element._click = (callback, ...args) => timonjs_click(element, nativeClick, callback, ...args);
    }
    
    try {
      element.childrenOn = (event, callback, ...args) => timonjs_childrenOn(element, event, callback, ...args);
    } catch (error) {
      settingError("childrenOn");
      element._childrenOn = (event, callback, ...args) => timonjs_childrenOn(element, event, callback, ...args);
    }
    
    try {
      element.childrenOff = (event, callback, ...args) => timonjs_childrenOff(element, event, callback, ...args);
    } catch (error) {
      settingError("childrenOff");
      element._childrenOff = (event, callback, ...args) => timonjs_childrenOff(element, event, callback, ...args);
    }
    
    try {
      element.childrenClick = (callback, ...args) => timonjs_childrenClick(element, callback, ...args);
    } catch (error) {
      settingError("childrenClick");
      element._childrenClick = (callback, ...args) => timonjs_childrenClick(element, callback, ...args);
    }
    
    try {
      element.css = (styles, value) => timonjs_css(element, styles, value);
    } catch (error) {
      settingError("css");
      element._css = (styles, value) => timonjs_css(element, styles, value);
    }
    
    try {
      element.toggle = (type, type2) => timonjs_toggle(element, type, type2);
    } catch (error) {
      settingError("toggle");
      element._toggle = (type, type2) => timonjs_toggle(element, type, type2);
    }
    
    try {
      element.hide = () => timonjs_hide(element);
    } catch (error) {
      settingError("hide");
      element._hide = () => timonjs_hide(element);
    }
    
    try {
      element.show = (type) => timonjs_show(element, type);
    } catch (error) {
      settingError("show");
      element._show = (type) => timonjs_show(element, type);
    }
    
    try {
      element.flex = () => timonjs_flex(element);
    } catch (error) {
      settingError("flex");
      element._flex = () => timonjs_flex(element);
    }
    
    try {
      element.grid = () => timonjs_grid(element);
    } catch (error) {
      settingError("grid");
      element._grid = () => timonjs_grid(element);
    }
    
    try {
      element.rotate = degrees => timonjs_rotate(element, degrees);
    } catch (error) {
      settingError("rotate");
      element._rotate = degrees => timonjs_rotate(element, degrees);
    }
    
    try {
      if (element.text) throw new Error();
      element.text = text => timonjs_text(element, text);
    } catch (error) {
      settingError("text");
      element._text = text => timonjs_text(element, text);
    }
    
    try {
      element.html = html => timonjs_html(element, html);
    } catch (error) {
      settingError("html");
      element._html = html => timonjs_html(element, html);
    }
    
    try {
      element.val = value => timonjs_val(element, value);
    } catch (error) {
      settingError("val");
      element._val = value => timonjs_val(element, value);
    }
    
    try {
      element.class = (className, replaceClass) => timonjs_class(element, className, replaceClass);
    } catch (error) {
      settingError("class");
      element._class = (className, replaceClass) => timonjs_class(element, className, replaceClass);
    }
    
    try {
      element.addClass = (...classList) => timonjs_addClass(element, ...classList);
    } catch (error) {
      settingError("addClass");
      element._addClass = (...classList) => timonjs_addClass(element, ...classList);
    }
    
    try {
      element.removeClass = (...classList) => timonjs_removeClass(element, ...classList);
    } catch (error) {
      settingError("removeClass");
      element._removeClass = (...classList) => timonjs_removeClass(element, ...classList);
    }
    
    try {
      element.replaceClass = (replaceClass, setClass) => timonjs_replaceClass(element, replaceClass, setClass);
    } catch (error) {
      settingError("replaceClass");
      element._replaceClass = (replaceClass, setClass) => timonjs_replaceClass(element, replaceClass, setClass);
    }
    
    try {
      element.toggleClass = (...classNames) => timonjs_toggleClass(element, ...classNames);
    } catch (error) {
      settingError("toggleClass");
      element._toggleClass = (...classNames) => timonjs_toggleClass(element, ...classNames);
    }
    
    try {
      element.hasClass = (...classNames) => timonjs_hasClass(element, ...classNames);
    } catch (error) {
      settingError("hasClass");
      element._hasClass = (...classNames) => timonjs_hasClass(element, ...classNames);
    }
    
    try {
      element.attr = (type, value) => timonjs_attr(element, type, value);
    } catch (error) {
      settingError("attr");
      element._attr = (type, value) => timonjs_attr(element, type, value);
    }
    
    try {
      if (element.attribute) throw new Error();
      element.attribute = (type, value) => timonjs_attribute(element, type, value);
    } catch (error) {
      settingError("attribute");
      element._attribute = (type, value) => timonjs_attribute(element, type, value);
    }
    
    try {
      element.data = (dataName, value) => timonjs_data(element, dataName, value);
    } catch (error) {
      settingError("data");
      element._data = (dataName, value) => timonjs_data(element, dataName, value);
    }
    
    try {
      element.toggleText = (text1, text2) => timonjs_toggleText(element, text1, text2);
    } catch (error) {
      settingError("toggleText");
      element._toggleText = (text1, text2) => timonjs_toggleText(element, text1, text2);
    }
    
    try {
      element.toggleHTML = (html1, html2) => timonjs_toggleHTML(element, html1, html2);
    } catch (error) {
      settingError("toggleHTML");
      element._toggleHTML = (html1, html2) => timonjs_toggleHTML(element, html1, html2);
    }
    
    try {
      if (element.parent) throw new Error();
      element.parent = () => timonjs_parent(element);
    } catch (error) {
      settingError("parent");
      element._parent = () => timonjs_parent(element);
    }
    
    try {
      element.hasChild = child => hasChild(element, child);
    } catch (error) {
      settingError("hasChild");
      element._hasChild = child => hasChild(element, child);
    }
    
    try {
      element.hasChildWithId = id => hasChildWithId(element, id);
    } catch (error) {
      settingError("hasChildWithId");
      element._hasChildWithId = id => hasChildWithId(element, id);
    }
    
    try {
      element.x = () => timonjs_x(element);
    } catch (error) {
      settingError("x");
      element._x = () => timonjs_x(element);
    }
    
    try {
      element.y = () => timonjs_y(element);
    } catch (error) {
      settingError("y");
      element._y = () => timonjs_y(element);
    }
    
    try {
      element.xy = () => timonjs_xy(element);
    } catch (error) {
      settingError("xy");
      element._xy = () => timonjs_xy(element);
    }
    
    try {
      element.customId = id => timonjs_customId(element, id);
    } catch (error) {
      settingError("customId");
      element._customId = id => timonjs_customId(element, id);
    }
    
    try {
      element.timonId = id => timonjs_timonId(element, id);
    } catch (error) {
      settingError("timonId");
      element._timonId = id => timonjs_timonId(element, id);
    }
    
    try {
      if (element.append) throw new Error();
      element.append = (...nodes) => timonjs_append(element, ...nodes);
    } catch (error) {
      settingError("append");
      element._append = (...nodes) => timonjs_append(element, ...nodes);
    }
    
    try {
      element.prepend = (...nodes) => timonjs_prepend(element, ...nodes);
    } catch (error) {
      settingError("prepend");
      element._prepend = (...nodes) => timonjs_prepend(element, ...nodes);
    }
    
    try {
      element.childrenCount = () => timonjs_childrenCount(element);
    } catch (error) {
      settingError("childrenCount");
      element._childrenCount = () => timonjs_childrenCount(element);
    }

    try {
      element.file = () => timonjs_file(element);
    } catch (error) {
      settingError("file");
      element._file = () => timonjs_file(element);
    }

    try {
      if (element.files) throw new Error();
      element.files = () => timonjs_files(element);
    } catch (error) {
      settingError("files");
      element._files = () => timonjs_files(element);
    }

    try {
      element.valIsEmpty = () => timonjs_valIsEmpty(element);
    } catch (error) {
      settingError("valIsEmpty");
      element._valIsEmpty = () => timonjs_valIsEmpty(element);
    }

    try {
      element.vIE = () => timonjs_vIE(element);
    } catch (error) {
      settingError("vIE");
      element._vIE = () => timonjs_vIE(element);
    }

    try {
      element.textIsEmpty = () => timonjs_textIsEmpty(element);
    } catch (error) {
      settingError("textIsEmpty");
      element._textIsEmpty = () => timonjs_textIsEmpty(element);
    }
    
    try {
      element.htmlIsEmpty = () => timonjs_htmlIsEmpty(element);
    } catch (error) {
      settingError("htmlIsEmpty");
      element._htmlIsEmpty = () => timonjs_htmlIsEmpty(element);
    }
    
    try {
      element.addAfter = (...nodes) => timonjs_addAfter(element, ...nodes);
    } catch (error) {
      settingError("addAfter");
      element._addAfter = (...nodes) => timonjs_addAfter(element, ...nodes);
    }
    
    try {
      element.addBefore = (...nodes) => timonjs_addBefore(element, ...nodes);
    } catch (error) {
      settingError("addBefore");
      element._addBefore = (...nodes) => timonjs_addBefore(element, ...nodes);
    }
    
    try {
      element.getImg = () => timonjs_getImg(element);
    } catch (error) {
      settingError("getImg");
      element._getImg = () => timonjs_getImg(element);
    }
    
    try {
      element.getImgBase64 = () => timonjs_getImgBase64(element);
    } catch (error) {
      settingError("getImgBase64");
      element._getImgBase64 = () => timonjs_getImgBase64(element);
    }
    
    try {
      element.imgBase = () => timonjs_imgBase(element);
    } catch (error) {
      settingError("imgBase");
      element._imgBase = () => timonjs_imgBase(element);
    }
    
    try {
      element.fullscreen = () => timonjs_fullscreen(element);
    } catch (error) {
      settingError("fullscreen");
      element._fullscreen = () => timonjs_fullscreen(element);
    }

    element.getElm = id => getElm(id, element);

    element.getQuery = query => getQuery(query, element);
  }

  return elements;
}

/**
 * Sends a POST request to the specified URL with a JSON payload.
 * @async
 * @param {string} url - The URL to which the POST request will be sent.
 * @param {Object} body - The data payload of the POST request. It will be transformed to an object.
 * @returns {Promise} - A promise that resolves with the response from the server.
 */
async function post(url, body) {
  try {
    const response = await fetch(window.location.origin + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "cors",
      cache: "default",
     _REDirect: "follow",
      credentials: "same-origin",
      referrerPolicy: "no-referrer-when-downgrade",
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Fetches text data from the given URL.
 *
 * @async
 * @function GETJson
 * @param {string} url - The URL to fetch the text data from.
 * @returns {Promise<Object>} A promise that resolves to the text data.
 * @throws Will throw an error if the fetch operation fails.
 */
async function GETText(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Fetches JSON data from the given URL.
 *
 * @async
 * @function GETJson
 * @param {string} url - The URL to fetch the JSON data from.
 * @returns {Promise<Object>} A promise that resolves to the JSON data.
 * @throws Will throw an error if the fetch operation fails.
 */
async function GETJson(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Generates a random string of a specified length using a combination of uppercase letters, lowercase letters, and numbers.
 * @param {number} length - The desired length of the random string.
 * @returns {string} - A random string of the specified length.
 */
function randomString(length) {
  let result = "";
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    result += char[randomIndex];
  }
  
  return result;
}

/**
 * Scrolls the page to the element matching the given query.
 * @param {string} query - The query used to select the element(s) to scroll to.
 */
function scrollToQuery(query) {
  const element = document.querySelector(query);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/**
 * Sets CSS styles on a specified DOM element.
 * @param {Element} element - The DOM element to apply the CSS styles to.
 * @param {Object} styles - An object containing the CSS styles to be set.
 */
function setCss(element, styles) {
  const cssString = Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
  element.style.cssText = cssString;
}

/**
 * Determines the type of device (desktop, tablet, or mobile) based on the user agent string.
 * @returns {string} The type of device: "desktop", "tablet", or "mobile".
 */
function getDevice() {
  const agent = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(agent)) {
    return "tablet";
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(agent)) {
    return "mobile";
  } else {
    return "desktop";
  }
}

/**
 * Downloads a file from a specified URL.
 * If a custom filename is not provided, the URL is used as the default filename.
 * @param {string} url - The URL of the file to be downloaded.
 * @param {string} [filename=url] - The custom filename to be used for the downloaded file.
 * @throws {Error} If there is an error downloading the file.
 */
async function download(url, filename = url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}

/**
 * Logs a message(s) to the console.
 * 
 * @param {...any} message - The message(s) to be logged.
 */
function log(...message) {
  console.log(...message);
}

/**
 * Logs an error message(s) to the console.
 * @param {...any} message - The error message(s) to be logged.
 */
function errorLog(...message) {
  console.error(...message);
}

/**
 * Logs a warning message(s) to the console.
 * 
 * @param {...any} message - The warning message(s) to be logged.
 */
function warnLog(...message) {
  console.warn(...message);
}

/**
 * Attaches an event listener to a specified element.
 *
 * @param {Element} element - The DOM element to which the event listener will be attached.
 * @param {string} event - The name of the event to listen for (e.g., 'click', 'mouseover').
 * @param {Function} callback - The function to be called when the event is triggered.
 * @param {...any} args - Additional arguments to pass to the event listener.
 */
function on(element, event, callback, ...args) {
  element.addEventListener(event, callback, ...args);
}

/**
 * Attaches a click event listener to a specified element.
 *
 * @param {Element} element - The DOM element to which the event listener will be attached.
 * @param {Function} callback - The function to be called when the event is triggered.
 * @param {...any} args - Additional arguments to pass to the event listener.
 */
function onClick(element, callback, ...args) {
  element.addEventListener("click", callback, ...args);
}

/**
 * Creates a notification field with a message and optional styling.
 *
 * @param {string} message - The message to display in the notification field.
 * @param {number} time - The duration (in milliseconds) for which the notification should be displayed.
 * @param {...string} args - Additional arguments for styling:
 *   - args[0]: CSS class to add to the field.
 *   - args[1]: Alt text for the image.
 *   - args[2]: aFallback background color for the field.
 *   - args[3]: Optional additional CSS for the image.
 */
function timonjs_fieldCreator(message, time, ...args) {
  const field = document.createElement("p");
  const img = document.createElement("img");
  const span = document.createElement("span");
  const output = document.createElement("span");

  field.style.cssText = `
    display: block;
    position: fixed;
    bottom: 5vh;
    left: 50%;
    transform: translateX(-50%);
    max-width: 70vw;
    margin: 0;
    padding: 20px;
    background-color: var(--${args[0]}, ${args[2]});
    opacity: 1;
    box-sizing: border-box;
    border-radius: 15px;
    font-size: 20px;
    line-height: 1;
    z-index: 1000000;
  `;

  img.style.cssText = `
    height: 1lh;
    aspect-ratio: 1/1;
    object-fit: contain;
    object-position: center;
    margin-right: 0.25em;
  `;

  if (args.length >3) img.style.cssText += args[3];

  field.classList.add(args[0]);

  img.alt = args[1];
  img.src = "https://cdn.jsdelivr.net/npm/timonjs/assets/alert.svg";

  output.innerText = message;

  field.append(img, span, output);

  document.querySelector("body").appendChild(field);

  setTimeout(() => {
    if (typeof gsap === "undefined") {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "https://cdn.jsdelivr.net/npm/timonjs/assets/timonjs.min.css";
      document.querySelector("head").appendChild(style);

      field.style.animation = `timonjs-fadeout ${time}ms ease-in`;
    } else {
      gsap.to(field, { opacity: 0, display: "none", duration: time / 1000, ease: "power2.in" });
    }

    setTimeout(() => field.remove(), time);
  }, time);
}

/**
 * Displays an error message in a designated field.
 *
 * @param {string} [message="Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut."] - The error message to display.
 * @param {number} [time=5000] - The duration (in milliseconds) for which the error message will be displayed.
 */
function errorField(message = "Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.", time = 5000) {
  timonjs_fieldCreator(message, time, "error", "Error", "#d61c35");
}

/**
 * Displays an informational message in a styled field.
 *
 * @param {string} message - The message to be displayed.
 * @param {number} [time=5000] - The duration (in milliseconds) for which the message will be displayed. Defaults to 5000ms.
 */
function infoField(message, time = 5000) {
  timonjs_fieldCreator(message, time, "info", "Info", "#4286bd", "transform: rotate(180deg);");
}

/**
 * Displays a success message field with specified message and duration.
 *
 * @param {string} message - The message to be displayed in the success field.
 * @param {number} [time=5000] - The duration (in milliseconds) for which the success field will be displayed. Defaults to 5000ms.
 */
function successField(message, time = 5000) {
  timonjs_fieldCreator(message, time, "success", "Info", "#40b959", "transform: rotate(180deg);");
}

/**
 * Creates one or more HTML elements of the specified type, assigns them unique IDs,
 * and returns them. The elements are temporarily added to the document head to
 * generate the IDs and then removed.
 *
 * @param {string} type - The type of HTML element to create (e.g., 'div', 'span').
 * @param {number} [amount=1] - The number of elements to create. Defaults to 1.
 * @returns {HTMLElement|HTMLElement[]} - The created element(s). If only one element
 * is created, it returns the element itself. If multiple elements are created, it
 * returns an array of elements.
 */
function createElm (type, amount = 1) {
  const elements = [];
  for (let i = 0; i < amount; i++) {
    const temp = document.createElement(type);
    const id = randomString(32);
    temp.id = id;
    document.querySelector("head").appendChild(temp);
    elements.push(getElm(id));
    document.querySelector("head").removeChild(temp);
  };
  return elements.length === 1 ? elements[0] : elements;
}

/**
 * Converts an HTML element to a JSON object.
 *
 * @param {HTMLElement} element - The HTML element to convert.
 * @returns {Object} - The JSON representation of the element.
 */
function elementToJson(element) {
  const json = {
    tagName: element.tagName,
    attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })),
    children: Array.from(element.childNodes).map(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const content = child.textContent.trim();
        if (content !== "") {
          json.children.push({
            nodeType: "text",
            content: child.textContent
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        json.children.push(elementToJson(child));
      }
    })
  };

  return json;
}

/**
 * Converts a JSON object to a DOM element.
 *
 * @param {Object} json - The JSON object representing the element.
 * @returns {Node} - The DOM element created from the JSON object.
 */
function jsonToElement(json) {
  if (json.nodeType === "text") {
    return document.createTextNode(json.content);
  }

  const element = document.createElement(json.tagName);
  json.attributes.forEach(attr => element.setAttribute(attr.name, attr.value));

  json.children.forEach(child => {
    element.append(jsonToElement(child));
  });

  return element;
}

/**
 * Registers a callback function to be executed when the DOM is fully loaded.
 *
 * @param {Function} callback - The function to be executed when the DOM is ready.
 * @param {...any} options - Additional options to be passed to the event listener.
 */
function ready(callback, ...options) {
  addEventListener("DOMContentLoaded", callback, ...options);
}

// Variables

const ORIGIN = typeof window !== "undefined" ? window.location.origin : undefined;
const BREAKPOINTS = {
  MOBILE: {
    SMALL: 260,
    BIG: 575
  },
  TABLET: {
    SMALL: 750,
    BIG: 1000
  },
  DESKTOP: {
    SMALL: 1200,
    BIG: 1700
  }
};

// Exports

if (typeof module !== "undefined") module.exports = {
  timonjs_setDebugMode,
  timonjs_message,
  toBase64,
  toBase64Max,
  toDateString,
  getElm,
  getQuery,
  getDevice,
  setCss,
  on,
  onClick,
  log,
  errorLog,
  warnLog,
  randomString,
  post,
  GETJson,
  GETText,
  download,
  scrollToQuery,
  successField,
  infoField,
  errorField,
  createElm,
  elementToJson,
  jsonToElement,
  ready,
  ORIGIN,
  BREAKPOINTS
};
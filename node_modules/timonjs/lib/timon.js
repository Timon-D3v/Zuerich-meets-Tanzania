/*!
 * timon.js
 * Copyright(c) 2024 Timon Fiedler
 * MIT Licensed
 */

"use strict";

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
 * Retrieves a DOM element based on its ID and provides additional functionality for event handling and CSS styling.
 * @param {string} id - The ID of the DOM element to retrieve.
 * @param {Node|NodeList} caller - The DOM element to call the function from.
 * @returns {Element} - The retrieved DOM element with additional functionality for event handling and CSS styling.
 */
function getElm(id, caller = document) {
  const element = caller.getElementById(id);

  /**
   * Attaches an event listener to the element.
   * @param {string} event - The event type to listen for.
   * @param {Function} callback - The callback function to execute when the event is triggered.
   */
  element.on = (event, callback) => {
    element.addEventListener(event, callback);
  };

  /**
   * Triggers a click event on the element.
   * @param {Function} callback - The callback function to execute when the click event is triggered.
   */
  element.click = (callback) => {
    element.addEventListener("click", callback);
  };

  /**
   * Sets CSS styles on the element.
   * @param {Object} styles - An object containing CSS property-value pairs.
   */
  element.css = (styles) => {
    const cssString = Object.entries(styles)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
    element.style.cssText = cssString;
  };

  /**
   * Hides the element by setting its display property to "none".
   */
  element.hide = () => {
    element.style.display = "none";
  };

  /**
   * Sets the display property of the element to show it.
   * 
   * @param {string} [type="block"] - The display type to set for the element.
   */
  element.show = (type = "block") => {
    element.style.display = type;
  };

  /**
   * Sets the display property of the element to "flex".
   */
  element.flex = () => {
    element.style.display = "flex";
  };

  /**
   * Sets the display property of the element to "grid".
   */
  element.grid = () => {
    element.style.display = "grid";
  };

  /**
   * Rotates an HTML element by a specified number of degrees.
   * @param {number} degrees - The number of degrees by which the element should be rotated.
   */
  element.rotate = (degrees) => {
    element.style.transform += `rotate(${degrees}deg)`;
  };

  /*
   * Check if the element already has a text attribute (e.g., the HTML "a" element).
  */
  if (typeof element.text === "undefined") {
    /**
     * Get or set the text content of an element.
     * @param {string} [text] - The text content to set for the element. If not provided, the current text content of the element is returned.
     * @returns {string} - The current text content of the element if `text` parameter is not provided, otherwise nothing is returned.
     */
    element.text = (text) => {
      if (typeof text === "undefined") {
        return element.innerText;
      } else {
        element.innerText = text.toString();
      }
    };
  } else {
    /**
     * Get or set the text content of an element.
     * @param {string} [text] - The text content to set for the element. If not provided, the current text content of the element is returned.
     * @returns {string} - The current text content of the element if `text` parameter is not provided, otherwise nothing is returned.
     */
    element._text = (text) => {
      if (typeof text === "undefined") {
        return element.innerText;
      } else {
        element.innerText = text.toString();
      }
    };
  }

  /**
   * Get or set the HTML content of an element.
   * @param {string} [html] - The HTML content to set for the element. If not provided, the function will return the current HTML content of the element.
   * @returns {string} - The current HTML content of the element if `html` parameter is not provided, otherwise nothing is returned.
   */
  element.html = (html) => {
    if (typeof html === "undefined") {
      return element.innerHTML;
    } else {
      element.innerHTML = html.toString();
    }
  };

  /**
   * Get or set the value of an element.
   * @param {string} [value] - The new value to be set for the element. If not provided, the function will return the current value of the element.
   * @returns {string} - The current value of the element if `value` is not provided, otherwise, returns nothing.
   */
  element.val = (value) => {
    if (typeof value === "undefined") {
      return element.value;
    } else {
      element.value = value;
    }
  };

  /**
   * Adds or removes a CSS class from an HTML element.
   * If no argument is provided, returns a string containing all the CSS classes applied to the element.
   * If a class name is provided as an argument, checks if the element already has that class and removes it if it does, or adds it if it doesn't.
   * @param {string} className - The CSS class name to add or remove from the element.
   * @returns {string|undefined} - If no className argument is provided, returns a string containing all the CSS classes applied to the element. Otherwise, returns undefined.
   */
  element.class = (className) => {
    if (typeof className === "undefined") {
      return Array.from(element.classList).join(" ");
    } else if (element.classList.contains(className)) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
  };

  /**
   * Adds one or more CSS classes to an HTML element.
   * @param {...string} classList - One or more CSS class names to be added to the element.
   */
  element.addClass = (...classList) => {
    classList.forEach(name => {
      element.classList.add(name);
    });
  };

  /**
   * Removes one or more CSS classes from an HTML element.
   * @param {...string} classList - One or more strings representing the CSS classes to be removed from the element.
   */
  element.removeClass = (...classList) => {
    classList.forEach(name => {
      element.classList.remove(name);
    });
  };

  /**
   * Removes an event listener from the element.
   *
   * @param {string} event - The event type to remove the listener from.
   * @param {function} callback - The callback function to remove.
   */
  element.off = (event, callback) => {
    element.removeEventListener(event, callback);
  };

  /**
   * Replaces one or more CSS classes on an HTML element with another class or classes.
   * @param {string|string[]} replaceClass - The class or classes to be removed from the element.
   * @param {string|string[]} setClass - The class or classes to be added to the element.
   */
  element.replaceClass = (replaceClass, setClass) => {
    const removeClasses = Array.isArray(replaceClass) ? replaceClass : [replaceClass];
    const addClasses = Array.isArray(setClass) ? setClass : [setClass];

    element.classList.remove(...removeClasses);
    element.classList.add(...addClasses);
  };

  /**
   * Toggles one or more CSS classes on an HTML element.
   * @param {...string} classNames - One or more CSS class names to toggle.
   */
  element.toggleClass = (...classNames) => {
    classNames.forEach(className => {
      element.classList.toggle(className);
    });
  };

  /**
   * The `element.data` function is used to get or set data attributes on an HTML element.
   * @param {string} [dataName] - The name of the data attribute. If not provided, the function will return an object containing all data attributes of the element.
   * @param {string} [value] - The value to be set for the data attribute. Only applicable if `dataName` is provided.
   * @returns {object|string|undefined} - If `dataName` is not provided, returns an object containing all data attributes of the element. If `dataName` is provided and `value` is not provided, returns the value of the specified data attribute. If `dataName` and `value` are both provided, sets the value of the specified data attribute.
   */
  element.data = (dataName, value) => {
    if (typeof dataName === "undefined") {
      const dataObject = {};
      for (const attr of element.attributes) {
        if (attr.name.startsWith("data")) {
          dataObject[attr.name] = attr.value;
        }
      }
      return dataObject;
    } else if (typeof dataName === "string" && typeof value === "undefined") {
      return element.getAttribute(dataName);
    } else if (typeof dataName === "string" && typeof value === "string") {
      element.setAttribute(dataName, value);
    }
  };

  /**
   * Toggles the text content of the element between two given values.
   *
   * @param {string} text1 - The first text value.
   * @param {string} text2 - The second text value.
   */
  element.toggleText = (text1, text2) => {
    if (element.innerText === text1) {
      element.innerText = text2;
    } else {
      element.innerText = text1;
    }
  };

  /**
   * Toggles the HTML content of the element between two given values.
   *
   * @param {string} html1 - The first HTML value.
   * @param {string} html2 - The second HTML value.
   */
  element.toggleHTML = (html1, html2) => {
    if (element.innerHTML === html1) {
      element.innerHTML = html2;
    } else {
      element.innerHTML = html1;
    }
  };

  /**
   * Checks if the element has the specified class.
   *
   * @param {string} className - The class name to check for.
   * @returns {boolean} - True if the element has the class, false otherwise.
   */
  element.hasClass = (className) => {
    return element.classList.contains(className);
  };

  /**
   * Sets an extra property on the element object.
   *
   * @param {string} name - The name of the property.
   * @param {*} value - The value to assign to the property.
   */
  element.extra = (name, value) => {
    element[name] = value;
  };

  /**
   * Retrieves or sets the attribute of the element.
   *
   * @param {string} type - The type of attribute to retrieve or set.
   * @param {string} [value] - The value to set for the attribute.
   * @returns {Object|string|undefined} - If no arguments are provided, returns an object containing all attributes of the element. If only the 'type' argument is provided, returns the value of the specified attribute. If both 'type' and 'value' arguments are provided, sets the value of the specified attribute.
   */
  element.attribute = (type, value) => {
    if (typeof type === "undefined") {
      const attributes = {};
      for (const attr of element.attributes) {
        attributes[attr.name] = attr.value;
      }
      return attributes;
    } else if (typeof type === "string" && typeof value === "undefined") {
      element.getAttribute(type);
    } else if (typeof type === "string" && typeof value === "string") {
      element.setAttribute(type, value);
    };
  };

  /**
   * Returns the parent element of the given element.
   * If the parent element has an `id` attribute, the function returns the element with that `id`.
   * Otherwise, it assigns a randomly generated `id` to the parent element, creates a new element with that `id`, and returns the new element. After the new element has been returned, the id attribute is removed.
   * @returns {HTMLElement} The parent element of the given element.
   */
  element.parent = () => {
    const parent = element.parentElement;
    if (typeof parent.id === "string") {
      return getElm(parent.id);
    } else {
      const id = randomString(128);
      parent.id = id;
      const parentElement = getElm(id);
      parentElement.removeAttribute("id");
      return parentElement;
    };
  };

  /**
   * Adds a click event listener to all children of the element.
   * @param {Function} callback - The callback function to be executed when a child element is clicked.
   */
  element.childrenClick = (callback) => {
    Array.from(element.children).forEach(child => {
      child.addEventListener("click", callback);
    });
  };

  /**
   * Adds an event listener to each child element of the current element.
   * @param {string} event - The type of event to listen for.
   * @param {Function} callback - The function to be executed when the event is triggered.
   */
  element.childrenOn = (event, callback) => {
    Array.from(element.children).forEach(child => {
      child.addEventListener(event, callback);
    });
  };

  /**
   * Removes an event listener from each child element of the current element.
   * @param {string} event - The type of event to remove.
   * @param {Function} callback - The function to remove.
   */
  element.childrenOff = (event, callback) => {
    Array.from(element.children).forEach(child => {
      child.removeEventListener(event, callback);
    });
  };

  /**
   * Checks if the given element has a specific child element.
   *
   * @param {Element} child - The child element to check for.
   * @returns {boolean} - True if the element has the child element, false otherwise.
   */
  element.hasChild = (child) => {
    for (let i = 0; i < element.children.length; i++) {
      if (child === element.children[i]) return true;
    }
    return false;
  };
  
  /**
   * Checks if the element has a child with the specified id.
   *
   * @param {string} id - The id of the child element to check for.
   * @returns {boolean} - True if the element has a child with the specified id, false otherwise.
   */
  element.hasChildWithId = (id) => {
    const child = document.getElementById(id);
    for (let i = 0; i < element.children.length; i++) {
      if (child === element.children[i]) return true;
    }
    return false;
  };

  /**
   * Returns the width of the element.
   *
   * @returns {number} The width of the element.
   */
  element.x = () => {
    return element.offsetWidth;
  };

  /**
   * Returns the height of the element.
   *
   * @returns {number} The height of the element.
   */
  element.y = () => {
    return element.offsetHeight;
  };

  /**
   * Returns an object with the width and height of the element.
   *
   * @returns {Object} An object with the properties 'x' and 'y' representing the width and height of the element, respectively.
   */
  element.xy = () => {
    return {
      x: element.offsetWidth,
      y: element.offsetHeight
    };
  };

  /**
   * Returns the width of the element as a string.
   *
   * @returns {string} The width of the element as a string.
   */
  element.xString = () => {
    return element.offsetWidth.toString();
  };

  /**
   * Returns the height of the element as a string.
   *
   * @returns {string} The height of the element as a string.
   */
  element.yString = () => {
    return element.offsetHeight.toString();
  };

  /**
   * Returns an object with the width and height of the element as a string.
   *
   * @returns {Object} An object with the properties 'x' and 'y' representing the width and height of the element as a string, respectively.
   */
  element.xyString = () => {
    return {
      x: element.offsetWidth.toString(),
      y: element.offsetHeight.toString()
    };
  };
    
  /**
   * Returns all elements with the specified query.
   *
   * @param {string} query - The query of the element to retrieve.
   * @returns {HTMLElement} - The element with the specified query.
   */
  element.getQuery = (query) => {
    return getQuery(query, element);
  };

  /**
   * Returns the element with the specified id.
   *
   * @param {string} id - The id of the element to retrieve.
   * @returns {HTMLElement} - The element with the specified id.
   */
  element.getElm = (id) => {
    return getElm(id, element);
  };

  /**
   * Sets a custom ID for the element.
   *
   * @param {string} id - The custom ID to set for the element.
   */
  element.customId = (id) => {
    element.uuid = id;
  };

  /**
   * Appends the specified nodes as children to the element.
   * 
   * @param {...Node} nodes - The nodes to be appended.
   */
  element.append = (...nodes) => {
    nodes.forEach(node => {
      element.appendChild(node);
    });
  };

  /**
   * Returns the number of child elements of the current element.
   *
   * @returns {number} The number of child elements.
   */
  element.childrenCount = () => {
    return element.children.length;
  };

  /**
   * Retrieves the file selected in an input element of type "file".
   * @returns {File|undefined} The first file selected in the input element, or undefined if no file is selected.
   */
  element.file = () => {
    try {
      return element.files[0];
    } catch (err) {
      console.error("This element does not contain any files.");
      return undefined;
    }
  };

  /**
   * Replaces the current element with a new element of the specified type.
   *
   * @param {string} type - The type of the new element.
   */
  element.changeType = (type) => {
    const newElement = document.createElement(type);
    newElement.innerHTML = element.innerHTML;
    Array.from(element.attributes).forEach((attr) => {
      newElement.setAttribute(attr.name, attr.value);
    });
    element.parentNode.replaceChild(newElement, element);
  };

  /**
   * Checks if the value of an input element is empty.
   * @returns {boolean} - True if the value is empty, false otherwise.
   */
  element.valIsEmpty = () => {
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
  };

  /**
   * Checks if the text content of the element is empty.
   * @returns {boolean} True if the text content is empty, false otherwise.
   */
  element.textIsEmpty = () => {
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
  };

  /**
   * Checks if the HTML content of the element is empty.
   * @returns {boolean} True if the HTML content is empty, false otherwise.
   */
  element.htmlIsEmpty = () => {
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
  };

  /**
   * Adds the specified node after the current element.
   *
   * @param {Node} node - The node to be added.
   */
  element.addAfter = (node) => {
    element.insertAdjacentElement(node);
  };

  /**
   * Adds the specified node before the current element.
   *
   * @param {Node} node - The node to be added.
   */
  element.addBefore = (node) => {
    element.parentElement.insertBefore(node, element);
  };

  /**
   * Retrieves an image element from the given HTML element.
   * The HTML element can be an <img>, <canvas>, or <input type="file"> element.
   * If the element does not contain an image, an error is thrown.
   * 
   * @returns {HTMLImageElement} The retrieved image element.
   * @throws {Error} If the element does not contain an image.
   */
  element.getImg = () => {
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
  };

  /**
   * Retrieves the base64 representation of an image contained in the given HTML element.
   * The element can be an <img>, <canvas>, or <input type="file"> element.
   * If the element does not contain an image, an error is thrown.
   * 
   * @returns {string} The base64 representation of the image.
   * @throws {Error} If the element does not contain an image.
   */
  element.getImgBase64 = () => {
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
  };

  /**
   * Sets the element to fullscreen mode.
   * 
   * This function requests the browser to display the element in fullscreen mode.
   * If the browser supports the Fullscreen API, it will use the appropriate method
   * to enter fullscreen mode. If the browser does not support the Fullscreen API,
   * this function will have no effect.
   */
  element.fullscreen = () => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  element.uuid = randomString(32);

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

  /**
   * Attaches an event listener to all elements.
   * @param {string} event - The event type to listen for.
   * @param {Function} callback - The callback function to execute when the event is triggered.
   */
  elements.on = (event, callback) => {
    elements.forEach(elm => elm.addEventListener(event, callback));
  };

  /**
   * Triggers a click event on all elements.
   * @param {Function} callback - The callback function to execute when the click event is triggered.
   */
  elements.click = (callback) => {
    elements.forEach(elm => elm.addEventListener("click", callback));
  };

  /**
   * Sets CSS styles on all elements.
   * @param {Object} styles - An object containing CSS property-value pairs.
   */
  elements.css = (styles) => {
    const cssString = Object.entries(styles)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; ');
    elements.forEach(elm => elm.style.cssText = cssString);
  };

  /**
   * Hides all elements by setting its display property to "none".
   */
  elements.hide = () => {
    elements.forEach((element) => {
      element.style.display = "none";
    });
  };

  /**
   * Sets the display property of all elements to show it.
   * 
   * @param {string} [type="block"] - The display type to set for all elements.
   */
  elements.show = (type = "block") => {
    elements.forEach((element) => {
      element.style.display = type;
    });
  };

  /**
   * Sets the display property of all elements to "flex".
   */
  elements.flex = () => {
    elements.forEach((element) => {
      element.style.display = "flex";
    });
  };

  /**
   * Sets the display property of all elements to "grid".
   */
  elements.grid = () => {
    elements.forEach((element) => {
      element.style.display = "grid";
    });
  };

  /**
   * Rotates all HTML elements by a specified number of degrees.
   * @param {number} degrees - The number of degrees by which all elements should be rotated.
   */
  elements.rotate = (degrees) => {
    elements.forEach((element) => {
      element.style.transform += `rotate(${degrees}deg)`;
    });
  };

  /**
   * Adds or removes a CSS class from all HTML elements.
   * If no argument is provided, returns an array with strings containing all the CSS classes applied to the elements.
   * If a class name is provided as an argument, checks if the element already has that class and removes it if it does, or adds it if it doesn't.
   * @param {string} className - The CSS class name to add or remove from the element.
   * @returns {array|undefined} - If no className argument is provided, returns an array of strings containing all the CSS classes applied to the elements. Otherwise, returns undefined.
   */
  elements.class = (className) => {
    let classArray = []
    elements.forEach((element) => {
      if (typeof className === "undefined") {
        classArray.push(Array.from(element.classList).join(" "));
      } else if (element.classList.contains(className)) {
        element.classList.remove(className);
      } else {
        element.classList.add(className);
      }
    });
    return classArray
  };

  /**
   * Adds one or more CSS classes to all HTML elements.
   * @param {...string} classList - One or more CSS class names to be added to all elements.
   */
  elements.addClass = (...classList) => {
    classList.forEach(name => {
      element.classList.add(name);
    });
  };

  /**
   * Removes one or more CSS classes from all HTML elements.
   * @param {...string} classList - One or more strings representing the CSS classes to be removed from all elements.
   */
  elements.removeClass = (...classList) => {
    elements.forEach((element) => {
      classList.forEach(name => {
        element.classList.remove(name);
      });
    });
  };

  /**
   * Removes an event listener from all elements.
   *
   * @param {string} event - The event type to remove the listener from.
   * @param {function} callback - The callback function to remove.
   */
  elements.off = (event, callback) => {
    elements.forEach((element) => {
      element.removeEventListener(event, callback);
    });
  };

  /**
   * Replaces one or more CSS classes on all HTML elements with another class or classes.
   * @param {string|string[]} replaceClass - The class or classes to be removed from all elements.
   * @param {string|string[]} setClass - The class or classes to be added to all elements.
   */
  elements.replaceClass = (replaceClass, setClass) => {
    elements.forEach((element) => {
      const removeClasses = Array.isArray(replaceClass) ? replaceClass : [replaceClass];
      const addClasses = Array.isArray(setClass) ? setClass : [setClass];

      element.classList.remove(...removeClasses);
      element.classList.add(...addClasses);
    });
  };

  /**
   * Toggles one or more CSS classes on all HTML elements.
   * @param {...string} classNames - One or more CSS class names to toggle.
   */
  elements.toggleClass = (...classNames) => {
    elements.forEach((element) => {
      classNames.forEach(className => {
        element.classList.toggle(className);
      });
    });
  };

  /**
   * Sets an extra property on the element object.
   *
   * @param {string} name - The name of the property.
   * @param {*} value - The value to assign to the property.
   */
  elements.extra = (name, value) => {
    elements[name] = value;
  };

  /**
   * Adds a click event listener to all children of all elements.
   * @param {Function} callback - The callback function to be executed when a child element is clicked.
   */
  elements.childrenClick = (callback) => {
    elements.forEach((element) => {
      Array.from(element.children).forEach(child => {
        child.addEventListener("click", callback);
      });
    });
  };

  /**
   * Adds an event listener to each child element of all elements.
   * @param {string} event - The type of event to listen for.
   * @param {Function} callback - The function to be executed when the event is triggered.
   */
  elements.childrenOn = (event, callback) => {
    elements.forEach((element) => {
      Array.from(element.children).forEach(child => {
        child.addEventListener(event, callback);
      });
    });
  };

  /**
   * Removes an event listener from each child element of all elements.
   * @param {string} event - The type of event to remove.
   * @param {Function} callback - The function to remove.
   */
  elements.childrenOff = (event, callback) => {
    elements.forEach((element) => {
      Array.from(element.children).forEach(child => {
        child.removeEventListener(event, callback);
      });
    });
  };

  /**
   * Appends the specified nodes as children to the element.
   * 
   * @param {...Node} nodes - The nodes to be appended.
   */
  elements.append = (...nodes) => {
    elements.forEach((element) => {
      nodes.forEach(node => {
        element.appendChild(node);
      });
    });
  };

  /**
   * Replaces the current elements with new elements of the specified type.
   *
   * @param {string} type - The type of the new elements.
   */
  elements.changeType = (type) => {
    elements.forEach((element) => {
      const newElement = document.createElement(type);
      newElement.innerHTML = element.innerHTML;
      Array.from(element.attributes).forEach((attr) => {
        newElement.setAttribute(attr.name, attr.value);
      });
      element.parentNode.replaceChild(newElement, element);
    });
  };

  /**
   * Adds the specified node after the current elements.
   *
   * @param {Node} node - The node to be added.
   */
  elements.addAfter = (node) => {
    elements.forEach((element) => {
      element.insertAdjacentElement(node);
    });
  };

  /**
   * Adds the specified node before the current elements.
   *
   * @param {Node} node - The node to be added.
   */
  elements.addBefore = (node) => {
    elements.forEach((element) => {
      element.parentElement.insertBefore(node, element);
    });
  };

  /**
   * Retrieves an element from the 'elements' array based on the specified index.
   *
   * @param {number} number - The index of the element to retrieve.
   * @returns {Node} The element at the specified index.
   */
  elements.get = (number) => {
    return elements[number];
  };

  elements.uuid = randomString(32);

  elements.forEach(element => {
    /**
     * Attaches an event listener to the element.
     * @param {string} event - The event type to listen for.
     * @param {Function} callback - The callback function to execute when the event is triggered.
     */
    element.on = (event, callback) => {
      element.addEventListener(event, callback);
    };

    /**
     * Triggers a click event on the element.
     * @param {Function} callback - The callback function to execute when the click event is triggered.
     */
    element.click = (callback) => {
      element.addEventListener("click", callback);
    };

    /**
     * Sets CSS styles on the element.
     * @param {Object} styles - An object containing CSS property-value pairs.
     */
    element.css = (styles) => {
      const cssString = Object.entries(styles)
        .map(([property, value]) => `${property}: ${value}`)
        .join('; ');
      element.style.cssText = cssString;
    };

    /**
     * Hides the element by setting its display property to "none".
     */
    element.hide = () => {
      element.style.display = "none";
    };

    /**
     * Sets the display property of the element to show it.
     * 
     * @param {string} [type="block"] - The display type to set for the element.
     */
    element.show = (type = "block") => {
      element.style.display = type;
    };

    /**
     * Sets the display property of the element to "flex".
     */
    element.flex = () => {
      element.style.display = "flex";
    };

    /**
     * Sets the display property of the element to "grid".
     */
    element.grid = () => {
      element.style.display = "grid";
    };

    /**
     * Rotates an HTML element by a specified number of degrees.
     * @param {number} degrees - The number of degrees by which the element should be rotated.
     */
    element.rotate = (degrees) => {
      element.style.transform += `rotate(${degrees}deg)`;
    };

    /*
     * Check if the element already has a text attribute (e.g., the HTML "a" element).
    */
    if (typeof element.text === "undefined") {
      /**
       * Get or set the text content of an element.
       * @param {string} [text] - The text content to set for the element. If not provided, the current text content of the element is returned.
       * @returns {string} - The current text content of the element if `text` parameter is not provided, otherwise nothing is returned.
       */
      element.text = (text) => {
        if (typeof text === "undefined") {
          return element.innerText;
        } else {
          element.innerText = text.toString();
        }
      };
    } else {
      /**
       * Get or set the text content of an element.
       * @param {string} [text] - The text content to set for the element. If not provided, the current text content of the element is returned.
       * @returns {string} - The current text content of the element if `text` parameter is not provided, otherwise nothing is returned.
       */
      element._text = (text) => {
        if (typeof text === "undefined") {
          return element.innerText;
        } else {
          element.innerText = text.toString();
        }
      };
    }

    /**
     * Get or set the HTML content of an element.
     * @param {string} [html] - The HTML content to set for the element. If not provided, the function will return the current HTML content of the element.
     * @returns {string} - The current HTML content of the element if `html` parameter is not provided, otherwise nothing is returned.
     */
    element.html = (html) => {
      if (typeof html === "undefined") {
        return element.innerHTML;
      } else {
        element.innerHTML = html.toString();
      }
    };

    /**
     * Get or set the value of an element.
     * @param {string} [value] - The new value to be set for the element. If not provided, the function will return the current value of the element.
     * @returns {string} - The current value of the element if `value` is not provided, otherwise, returns nothing.
     */
    element.val = (value) => {
      if (typeof value === "undefined") {
        return element.value;
      } else {
        element.value = value;
      }
    };

    /**
     * Adds or removes a CSS class from an HTML element.
     * If no argument is provided, returns a string containing all the CSS classes applied to the element.
     * If a class name is provided as an argument, checks if the element already has that class and removes it if it does, or adds it if it doesn't.
     * @param {string} className - The CSS class name to add or remove from the element.
     * @returns {string|undefined} - If no className argument is provided, returns a string containing all the CSS classes applied to the element. Otherwise, returns undefined.
     */
    element.class = (className) => {
      if (typeof className === "undefined") {
        return Array.from(element.classList).join(" ");
      } else if (element.classList.contains(className)) {
        element.classList.remove(className);
      } else {
        element.classList.add(className);
      }
    };

    /**
     * Adds one or more CSS classes to an HTML element.
     * @param {...string} classList - One or more CSS class names to be added to the element.
     */
    element.addClass = (...classList) => {
      classList.forEach(name => {
        element.classList.add(name);
      });
    };

    /**
     * Removes one or more CSS classes from an HTML element.
     * @param {...string} classList - One or more strings representing the CSS classes to be removed from the element.
     */
    element.removeClass = (...classList) => {
      classList.forEach(name => {
        element.classList.remove(name);
      });
    };

    /**
     * Removes an event listener from the element.
     *
     * @param {string} event - The event type to remove the listener from.
     * @param {function} callback - The callback function to remove.
     */
    element.off = (event, callback) => {
      element.removeEventListener(event, callback);
    };

    /**
     * Replaces one or more CSS classes on an HTML element with another class or classes.
     * @param {string|string[]} replaceClass - The class or classes to be removed from the element.
     * @param {string|string[]} setClass - The class or classes to be added to the element.
     */
    element.replaceClass = (replaceClass, setClass) => {
      const removeClasses = Array.isArray(replaceClass) ? replaceClass : [replaceClass];
      const addClasses = Array.isArray(setClass) ? setClass : [setClass];

      element.classList.remove(...removeClasses);
      element.classList.add(...addClasses);
    };

    /**
     * Toggles one or more CSS classes on an HTML element.
     * @param {...string} classNames - One or more CSS class names to toggle.
     */
    element.toggleClass = (...classNames) => {
      classNames.forEach(className => {
        element.classList.toggle(className);
      });
    };

    /**
     * The `element.data` function is used to get or set data attributes on an HTML element.
     * @param {string} [dataName] - The name of the data attribute. If not provided, the function will return an object containing all data attributes of the element.
     * @param {string} [value] - The value to be set for the data attribute. Only applicable if `dataName` is provided.
     * @returns {object|string|undefined} - If `dataName` is not provided, returns an object containing all data attributes of the element. If `dataName` is provided and `value` is not provided, returns the value of the specified data attribute. If `dataName` and `value` are both provided, sets the value of the specified data attribute.
     */
    element.data = (dataName, value) => {
      if (typeof dataName === "undefined") {
        const dataObject = {};
        for (const attr of element.attributes) {
          if (attr.name.startsWith("data")) {
            dataObject[attr.name] = attr.value;
          }
        }
        return dataObject;
      } else if (typeof dataName === "string" && typeof value === "undefined") {
        return element.getAttribute(dataName);
      } else if (typeof dataName === "string" && typeof value === "string") {
        element.setAttribute(dataName, value);
      }
    };

    /**
     * Toggles the text content of the element between two given values.
     *
     * @param {string} text1 - The first text value.
     * @param {string} text2 - The second text value.
     */
    element.toggleText = (text1, text2) => {
      if (element.innerText === text1) {
        element.innerText = text2;
      } else {
        element.innerText = text1;
      }
    };

    /**
     * Toggles the HTML content of the element between two given values.
     *
     * @param {string} html1 - The first HTML value.
     * @param {string} html2 - The second HTML value.
     */
    element.toggleHTML = (html1, html2) => {
      if (element.innerHTML === html1) {
        element.innerHTML = html2;
      } else {
        element.innerHTML = html1;
      }
    };

    /**
     * Checks if the element has the specified class.
     *
     * @param {string} className - The class name to check for.
     * @returns {boolean} - True if the element has the class, false otherwise.
     */
    element.hasClass = (className) => {
      return element.classList.contains(className);
    };

    /**
     * Sets an extra property on the element object.
     *
     * @param {string} name - The name of the property.
     * @param {*} value - The value to assign to the property.
     */
    element.extra = (name, value) => {
      element[name] = value;
    };

    /**
     * Retrieves or sets the attribute of the element.
     *
     * @param {string} type - The type of attribute to retrieve or set.
     * @param {string} [value] - The value to set for the attribute.
     * @returns {Object|string|undefined} - If no arguments are provided, returns an object containing all attributes of the element. If only the 'type' argument is provided, returns the value of the specified attribute. If both 'type' and 'value' arguments are provided, sets the value of the specified attribute.
     */
    element.attribute = (type, value) => {
      if (typeof type === "undefined") {
        const attributes = {};
        for (const attr of element.attributes) {
          attributes[attr.name] = attr.value;
        }
        return attributes;
      } else if (typeof type === "string" && typeof value === "undefined") {
        element.getAttribute(type);
      } else if (typeof type === "string" && typeof value === "string") {
        element.setAttribute(type, value);
      };
    };

    /**
     * Returns the parent element of the given element.
     * If the parent element has an `id` attribute, the function returns the element with that `id`.
     * Otherwise, it assigns a randomly generated `id` to the parent element, creates a new element with that `id`, and returns the new element. After the new element has been returned, the id attribute is removed.
     * @returns {HTMLElement} The parent element of the given element.
     */
    element.parent = () => {
      const parent = element.parentElement;
      if (typeof parent.id === "string") {
        return getElm(parent.id);
      } else {
        const id = randomString(128);
        parent.id = id;
        const parentElement = getElm(id);
        parentElement.removeAttribute("id");
        return parentElement;
      };
    };

    /**
     * Adds a click event listener to all children of the element.
     * @param {Function} callback - The callback function to be executed when a child element is clicked.
     */
    element.childrenClick = (callback) => {
      Array.from(element.children).forEach(child => {
        child.addEventListener("click", callback);
      });
    };

    /**
     * Adds an event listener to each child element of the current element.
     * @param {string} event - The type of event to listen for.
     * @param {Function} callback - The function to be executed when the event is triggered.
     */
    element.childrenOn = (event, callback) => {
      Array.from(element.children).forEach(child => {
        child.addEventListener(event, callback);
      });
    };

    /**
     * Removes an event listener from each child element of the current element.
     * @param {string} event - The type of event to remove.
     * @param {Function} callback - The function to remove.
     */
    element.childrenOff = (event, callback) => {
      Array.from(element.children).forEach(child => {
        child.removeEventListener(event, callback);
      });
    };

    /**
     * Checks if the given element has a specific child element.
     *
     * @param {Element} child - The child element to check for.
     * @returns {boolean} - True if the element has the child element, false otherwise.
     */
    element.hasChild = (child) => {
      for (let i = 0; i < element.children.length; i++) {
        if (child === element.children[i]) return true;
      }
      return false;
    };
    
    /**
     * Checks if the element has a child with the specified id.
     *
     * @param {string} id - The id of the child element to check for.
     * @returns {boolean} - True if the element has a child with the specified id, false otherwise.
     */
    element.hasChildWithId = (id) => {
      const child = document.getElementById(id);
      for (let i = 0; i < element.children.length; i++) {
        if (child === element.children[i]) return true;
      }
      return false;
    };

    /**
     * Returns the width of the element.
     *
     * @returns {number} The width of the element.
     */
    element.x = () => {
      return element.offsetWidth;
    };

    /**
     * Returns the height of the element.
     *
     * @returns {number} The height of the element.
     */
    element.y = () => {
      return element.offsetHeight;
    };

    /**
     * Returns an object with the width and height of the element.
     *
     * @returns {Object} An object with the properties 'x' and 'y' representing the width and height of the element, respectively.
     */
    element.xy = () => {
      return {
        x: element.offsetWidth,
        y: element.offsetHeight
      };
    };

    /**
     * Returns the width of the element as a string.
     *
     * @returns {string} The width of the element as a string.
     */
    element.xString = () => {
      return element.offsetWidth.toString();
    };

    /**
     * Returns the height of the element as a string.
     *
     * @returns {string} The height of the element as a string.
     */
    element.yString = () => {
      return element.offsetHeight.toString();
    };

    /**
     * Returns an object with the width and height of the element as a string.
     *
     * @returns {Object} An object with the properties 'x' and 'y' representing the width and height of the element as a string, respectively.
     */
    element.xyString = () => {
      return {
        x: element.offsetWidth.toString(),
        y: element.offsetHeight.toString()
      };
    };

    /**
     * Returns an element with the specified id.
     *
     * @param {string} id - The id of the element to retrieve.
     * @returns {HTMLElement} - The element with the specified id.
     */
    element.getElm = (id) => {
      return getElm(id);
    };

    /**
     * Sets a custom ID for the element.
     *
     * @param {string} id - The custom ID to set for the element.
     */
    element.customId = (id) => {
      element.uuid = id;
    };

    /**
     * Appends the specified nodes as children to the element.
     * 
     * @param {...Node} nodes - The nodes to be appended.
     */
    element.append = (...nodes) => {
      nodes.forEach(node => {
        element.appendChild(node);
      });
    };

    /**
     * Returns the number of child elements of the current element.
     *
     * @returns {number} The number of child elements.
     */
    element.childrenCount = () => {
      return element.children.length;
    };

    /**
     * Retrieves the file selected in an input element of type "file".
     * @returns {File|undefined} The first file selected in the input element, or undefined if no file is selected.
     */
    element.file = () => {
      try {
        return element.files[0];
      } catch (err) {
        console.error("This element does not contain any files.");
        return undefined;
      }
    };

    /**
     * Replaces the current element with a new element of the specified type.
     *
     * @param {string} type - The type of the new element.
     */
    element.changeType = (type) => {
      const newElement = document.createElement(type);
      newElement.innerHTML = element.innerHTML;
      Array.from(element.attributes).forEach((attr) => {
        newElement.setAttribute(attr.name, attr.value);
      });
      element.parentNode.replaceChild(newElement, element);
    };

    /**
     * Checks if the value of an input element is empty.
     * @returns {boolean} - True if the value is empty, false otherwise.
     */
    element.valIsEmpty = () => {
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
    };

    /**
     * Checks if the text content of the element is empty.
     * @returns {boolean} True if the text content is empty, false otherwise.
     */
    element.textIsEmpty = () => {
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
    };

    /**
     * Checks if the HTML content of the element is empty.
     * @returns {boolean} True if the HTML content is empty, false otherwise.
     */
    element.htmlIsEmpty = () => {
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
    };

    /**
     * Adds the specified node after the current element.
     *
     * @param {Node} node - The node to be added.
     */
    element.addAfter = (node) => {
      element.insertAdjacentElement(node);
    };

    /**
     * Adds the specified node before the current element.
     *
     * @param {Node} node - The node to be added.
     */
    element.addBefore = (node) => {
      element.parentElement.insertBefore(node, element);
    };

    /**
     * Retrieves an image element from the given HTML element.
     * The HTML element can be an <img>, <canvas>, or <input type="file"> element.
     * If the element does not contain an image, an error is thrown.
     * 
     * @returns {HTMLImageElement} The retrieved image element.
     * @throws {Error} If the element does not contain an image.
     */
    element.getImg = () => {
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
    };

    /**
     * Retrieves the base64 representation of an image contained in the given HTML element.
     * The element can be an <img>, <canvas>, or <input type="file"> element.
     * If the element does not contain an image, an error is thrown.
     * 
     * @returns {string} The base64 representation of the image.
     * @throws {Error} If the element does not contain an image.
     */
    element.getImgBase64 = () => {
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
    };
    
    /**
     * Returns all elements with the specified query.
     *
     * @param {string} query - The query of the element to retrieve.
     * @returns {HTMLElement} - The element with the specified query.
     */
    element.getQuery = (query) => {
      return getQuery(query, element);
    };
  
    /**
     * Returns the element with the specified id.
     *
     * @param {string} id - The id of the element to retrieve.
     * @returns {HTMLElement} - The element with the specified id.
     */
    element.getElm = (id) => {
      return getElm(id, element);
    };

    element.uuid = randomString(32);
  });

  return elements;
}

/**
 * Sends a POST request to the specified URL with a JSON payload.
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
      redirect: "follow",
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
 * Logs a message to the console.
 * 
 * @param {string} message - The message to be logged.
 */
function log(message) {
  console.log(message);
}

/**
 * Logs an error message to the console.
 * @param {string} message - The error message to be logged.
 */
function errorLog(message) {
  console.error(message);
}

/**
 * Logs a warning message to the console.
 * 
 * @param {string} message - The warning message to be logged.
 */
function warnLog(message) {
  console.warn(message);
}

/**
 * Attaches an event listener to a DOM element.
 * @param {Element} element - The DOM element to attach the event listener to.
 * @param {string} event - The type of event to listen for.
 * @param {Function} callback - The callback function to execute when the event is triggered.
 */
function on(element, event, callback) {
  element.addEventListener(event, callback);
}

/**
 * Attaches a click event listener to a DOM element.
 * 
 * @param {Element} element - The DOM element to attach the event listener to.
 * @param {Function} callback - The callback function to execute when the click event is triggered.
 */
function onClick(element, callback) {
  element.addEventListener("click", callback);
}

/**
 * Creates and displays an error message on the webpage for a specified duration.
 * @param {string} [message="Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut."] - The error message to be displayed.
 * @param {number} [time=5000] - The duration in milliseconds for which the error message will be visible.
 */
function errorField(message = "Etwas hat nicht geklappt. Versuche es in einigen Sekunden erneut.", time = 5000) {
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
    background-color: #d61c35;
    background-color: var(--error);
    opacity: 1;
    box-sizing: border-box;
    border-radius: 15px;
    font-size: 20px;
    line-height: 1.25;
    z-index: 1000000;
  `;

  img.style.cssText = `
    height: 1lh;
    aspect-ratio: 1/1;
    object-fit: contain;
    object-position: center;
    transform: translateY(20%);
    margin-right: 0.25em;
  `;

  field.classList.add("error");

  img.alt = "Achtung";
  img.src = "https://ik.imagekit.io/timon/timonjs/alert.svg";

  span.innerText = "Ein Fehler ist aufgetreten: ";
  output.innerText = message;

  field.append(img, span, output);

  document.querySelector("body").appendChild(field);

  setTimeout(() => {
    if (typeof gsap?.version === "string") {
      gsap.to(field, { opacity: 0, display: "none", duration: time / 1000, ease: "power2.in" });
    } else {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "https://ik.imagekit.io/timon/timonjs/timonjs.css";
      document.querySelector("head").appendChild(style);

      field.style.animation = `timonjs-fadeout ${time}ms ease-in`;
    }

    setTimeout(() => field.remove(), time);
  }, time);
}

/**
 * Creates and displays an info message on the webpage for a specified duration.
 * @param {string} message - The info message to be displayed.
 * @param {number} [time=5000] - The duration in milliseconds for which the error message will be visible.
 */
function infoField(message, time = 5000) {
  const field = document.createElement("p");
  const img = document.createElement("img");
  const span = document.createElement("span");

  field.style.cssText = `
    display: block;
    position: fixed;
    bottom: 5vh;
    left: 50%;
    transform: translateX(-50%);
    max-width: 70vw;
    margin: 0;
    padding: 20px;
    background-color: #4286bd;
    background-color: var(--info);
    opacity: 1;
    box-sizing: border-box;
    border-radius: 15px;
    font-size: 20px;
    line-height: 1.25;
    z-index: 1000000;
  `;

  img.style.cssText = `
    height: 1lh;
    aspect-ratio: 1/1;
    object-fit: contain;
    object-position: center;
    transform: translateY(20%);
    margin-right: 0.25em;
    transform: rotate(180deg);
  `;

  field.classList.add("error");

  img.alt = "Info";
  img.src = "https://ik.imagekit.io/timon/timonjs/alert.svg";

  span.innerText = message;

  field.append(img, span);

  document.querySelector("body").appendChild(field);

  setTimeout(() => {
    if (typeof gsap?.version === "string") {
      gsap.to(field, { opacity: 0, display: "none", duration: time / 1000, ease: "power2.in" });
    } else {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "https://ik.imagekit.io/timon/timonjs/timonjs.css";
      document.querySelector("head").appendChild(style);

      field.style.animation = `timonjs-fadeout ${time}ms ease-in`;
    }

    setTimeout(() => field.remove(), time);
  }, time);
}

/**
 * Creates and displays a success message on the webpage for a specified duration.
 * @param {string} message - The success message to be displayed.
 * @param {number} [time=5000] - The duration in milliseconds for which the error message will be visible.
 */
function successField(message, time = 5000) {
  const field = document.createElement("p");
  const img = document.createElement("img");
  const span = document.createElement("span");

  field.style.cssText = `
    display: block;
    position: fixed;
    bottom: 5vh;
    left: 50%;
    transform: translateX(-50%);
    max-width: 70vw;
    margin: 0;
    padding: 20px;
    background-color: #40b959;
    background-color: var(--success);
    opacity: 1;
    box-sizing: border-box;
    border-radius: 15px;
    font-size: 20px;
    line-height: 1.25;
    z-index: 1000000;
  `;

  img.style.cssText = `
    height: 1lh;
    aspect-ratio: 1/1;
    object-fit: contain;
    object-position: center;
    transform: translateY(20%);
    margin-right: 0.25em;
    transform: rotate(180deg);
  `;

  field.classList.add("error");

  img.alt = "Info";
  img.src = "https://ik.imagekit.io/timon/timonjs/alert.svg";

  span.innerText = message;

  field.append(img, span);

  document.querySelector("body").appendChild(field);

  setTimeout(() => {
    if (typeof gsap?.version === "string") {
      gsap.to(field, { opacity: 0, display: "none", duration: time / 1000, ease: "power2.in" });
    } else {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "https://ik.imagekit.io/timon/timonjs/timonjs.css";
      document.querySelector("head").appendChild(style);

      field.style.animation = `timonjs-fadeout ${time}ms ease-in`;
    }

    setTimeout(() => field.remove(), time);
  }, time);
}

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

// Variables

const ORIGIN = typeof window !== "undefined" ? window.location.origin : undefined;

// Exports

if (typeof module !== "undefined") module.exports = {
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
  download,
  scrollToQuery,
  successField,
  infoField,
  errorField,
  createElm,
  ORIGIN
};
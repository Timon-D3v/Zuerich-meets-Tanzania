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
 * @returns {Element} - The retrieved DOM element with additional functionality for event handling and CSS styling.
 */
function getElm(id) {
  const element = document.getElementById(id);

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

  return element;
}

/**
 * Retrieves DOM elements based on a CSS selector query and provides additional functionality for event handling and CSS styling.
 * @param {string} query - The CSS selector query used to select the desired elements.
 * @returns {NodeList} - A collection of DOM elements with additional functionality for event handling and CSS styling.
 */
function getQuery(id) {
  const elements = document.querySelectorAll(id);

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

// Variables

// Exports

export default {
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
  errorField
};
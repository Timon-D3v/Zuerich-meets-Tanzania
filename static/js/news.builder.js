on(document, "DOMContentLoaded", () => {
    setTimeout(() => {
        const content = getQuery(".news-div").get(0);
        const edit_btn = getElm("edit-current-element");
        const delete_btn = getElm("delete-current-element");
        const json = {
            html: null,
            pos: "center",
        };
        const sortable = new Draggable.Sortable(content, {
            draggable: ".news-div > *:not(*[contenteditable='true'], h1.news-title)",
        });
        let current_element = null;

        sortable.on("sortable:start", (e) => {
            const elements = getQuery(".news-div > *");
            current_element = e.data.dragEvent.data.originalSource;

            elements.forEach((element) => {
                element.classList.remove("active");
                element.innerHTML = markdownToHtml(element.innerHTML);
                element.contentEditable = false;
            });

            current_element.classList.add("active");
        });

        getElm("add-text").click(async () => {
            const element = createElm("p");
            element.addClass("news-text");
            element.innerHTML = await prompt("Bitte gib den Text ein, den du hinzufügen möchtest. Du kannst ihn auch nachher noch bearbeiten.");

            content.appendChild(element);
        });

        getElm("add-title").click(async () => {
            const element = createElm("h2");
            element.addClass("news-content-title");
            element.innerHTML = await prompt("Bitte gib den Titel ein, den du hinzufügen möchtest. Du kannst ihn auch nachher noch bearbeiten.");

            content.appendChild(element);
        });

        getElm("add-picture").click(async () => {
            const input = createElm("input");
            input.type = "file";
            input.accept = "image/*";
            input.on("change", async (e) => {
                const base64 = await input.getImgBase64();

                const element = createElm("img");
                element.src = base64;
                element.alt = input.file().name;
                element.addClass("news-img");

                const position = await prompt("Positionierung des Bildes (links, mitte oder rechts)");

                switch (position.toLowerCase().trim()) {
                    case "links":
                        json.pos = "left";
                        element.addClass("news-left");
                        break;
                    case "mitte":
                        json.pos = "center";
                        element.addClass("news-center");
                        break;
                    case "rechts":
                        json.pos = "right";
                        element.addClass("news-right");
                        break;
                    default:
                        alert("Diese Positionierung gibt es nicht, es wird nun in der Mitte platziert. Du kannst die Positionierung ändern, wenn du ein neues Bild hinzufügst.");
                        element.addClass("news-center");
                        break;
                }

                getQuery(".news > img").forEach((e) => e.remove());
                getQuery(".news > iframe").forEach((e) => e.remove());
                getQuery(".news element").forEach((e) => e.remove());
                getQuery(".news").get(0).append(element);
            });

            input.click();
        });

        getElm("add-multiple-pictures").click(() => {
            const input = createElm("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.on("change", async (e) => {
                const fileArray = [];

                for (let i = 0; i < input.files.length; i++) {
                    const file = input.files[i];

                    fileArray.push({
                        base64: await toBase64Max(file, 2e5),
                        name: file.name,
                        id: `auto_${randomString(37)}`,
                    });
                }

                const wrapper = createElm("element");
                const wrapperId = `auto_${randomString(32)}`;
                wrapper.addClass("blog_carousel", wrapperId);

                const style = createElm("link");
                style.rel = "stylesheet";
                style.href = "/css/blog.css";

                const mainDiv = createElm("div");
                const mainDivId = `auto_${randomString(33)}`;
                mainDiv.addClass("blog_c-main", mainDivId);

                const nextBtn = createElm("button");
                const nextBtnId = `auto_${randomString(34)}`;
                nextBtn.type = "button";
                nextBtn.id = nextBtnId;
                nextBtn.addClass("blog_carousel_next");

                const prevBtn = createElm("button");
                const prevBtnId = `auto_${randomString(35)}`;
                prevBtn.type = "button";
                prevBtn.id = prevBtnId;
                prevBtn.addClass("blog_carousel_prev");

                const ruler = createElm("div");
                const rulerId = `auto_${randomString(36)}`;
                ruler.addClass("blog_c-ruler", rulerId);

                for (let i = 0; i < fileArray.length; i++) {
                    const file = fileArray[i];

                    const img = createElm("img");
                    const preview = createElm("img");
                    img.alt = file.name;
                    preview.alt = file.name;
                    img.src = file.base64;
                    preview.src = file.base64;
                    img.addClass(file.id);
                    preview.addClass(file.id);

                    mainDiv.append(img);
                    ruler.append(preview);
                }

                const script = createElm("script");
                script.type = "text/javascript";

                const imgArrayName = `imgArray_${randomString(16)}`;
                const currentImgName = `currentImg_${randomString(16)}`;
                const funcNextName = `next_${randomString(16)}`;
                const funcPrevName = `prev_${randomString(16)}`;
                const funcToName = `to_${randomString(16)}`;

                let scriptContent = `const ${imgArrayName} = [`;

                for (let i = 0; i < fileArray.length; i++) {
                    scriptContent += `getQuery(".${fileArray[i].id}"),`;
                }

                scriptContent += `];
        let ${currentImgName} = 1;
        ${imgArrayName}[${currentImgName} - 1].toggleClass("active");
        function ${funcNextName}() {
            ${currentImgName} + 1 > ${imgArrayName}.length ?
            ${currentImgName} = 1 :
            ${currentImgName}++;
            ${currentImgName} === 1 ?
            ${imgArrayName}[${imgArrayName}.length - 1].toggleClass("active") :
            ${imgArrayName}[${currentImgName} - 2].toggleClass("active");
            ${imgArrayName}[${currentImgName} - 1].toggleClass("active");
        }
        function ${funcPrevName}() {
            ${currentImgName} - 1 === 0 ?
            ${currentImgName} = ${imgArrayName}.length :
            ${currentImgName}--;
            ${currentImgName} === ${imgArrayName}.length ?
            ${imgArrayName}[0].toggleClass("active") :
            ${imgArrayName}[${currentImgName}].toggleClass("active");
            ${imgArrayName}[${currentImgName} - 1].toggleClass("active");
        }
        function ${funcToName}(i) {
            ${imgArrayName}[${currentImgName} - 1].toggleClass("active");
            ${imgArrayName}[i - 1].toggleClass("active");
            ${currentImgName} = i;
        }
        getElm("${nextBtnId}").click(${funcNextName});
        getElm("${prevBtnId}").click(${funcPrevName});
        for (let i = 0; i < ${imgArrayName}.length; i++) {
            ${imgArrayName}[i].get(1).click(() => ${funcToName}(i + 1));
        };`;

                script.innerHTML = scriptContent;

                wrapper.append(mainDiv, nextBtn, prevBtn, ruler, script, style);

                getQuery(".news > img").forEach((e) => e.remove());
                getQuery(".news > iframe").forEach((e) => e.remove());
                getQuery(".news element").forEach((e) => e.remove());
                content.append(wrapper);
            });

            input.click();
        });

        getElm("add-pdf").click(async () => {
            const iframe = createElm("iframe");
            iframe.src = await prompt("Bitte gib den Link zum PDF ein, das du hinzufügen möchtest.");
            iframe.addClass("news-iframe");

            getQuery(".news > img").forEach((e) => e.remove());
            getQuery(".news > iframe").forEach((e) => e.remove());
            getQuery(".news element").forEach((e) => e.remove());
            getQuery(".news").get(0).append(iframe);
        });

        getElm("add-btn").click(async () => {
            const element = createElm("button");
            element.addClass("news-cta");
            element.innerHTML = await prompt("Bitte gib den Text ein, den der Button anzeigen soll.");
            element.attr("onclick", "window.open('" + (await prompt("Bitte gib den Link ein, zu dem der Button führen soll.")) + "', '_blank')");
            element.attr("type", "button");
            content.appendChild(element);
        });

        getElm("done").click(async () => {
            const result = await confirm("Bist du sicher, dass alles fertig ist?");

            if (!result) return;

            json.newsletter = await confirm("Sollte dieser Beitrag als Newsletter verschickt werden? (OK = Ja, Abbrechen = Nein. Wenn du den Beitrag nur bearbeitest, wird sowieso keine E-Mail verschickt.)");

            json.src = getQuery(".news *:is(img, iframe)").get(0).src;

            json.type = null;
            json.isBase64 = false;

            if (json.src.includes("ik.imagekit.io/zmt/pdf/") || json.src.includes(".pdf")) json.type = "iframe";
            else if (json.src.includes("https://")) json.type = "img";
            else {
                json.type = "img";
                json.isBase64 = true;
            }

            getElm("done").disabled = true;

            getQuery(".blog_carousel img").forEach((e) => e.removeClass("active"));

            getQuery(".news-div *").forEach((element) => {
                if (element.contentEditable === "true") element.contentEditable = false;
            });

            json.html = elmToJson(content);
            const isNew = edit_btn.data("data-news-is-new") === "true";
            json.id = edit_btn.data("data-news-id");

            const response = await post(isNew ? "/post/news" : "/post/news/update", json);

            if (response.ok) return alert("Das hat geklappt, die News sind jetzt online und du kannst den Builder verlassen.");

            getElm("done").disabled = false;

            alert("Etwas hat nicht geklappt. Schliesse den Builder nicht und versuche es in einigen Sekunden erneut. Wenn das Problem länger besteht, melde dich bitte beim Entwickler.");
        });

        edit_btn.click(async () => {
            switch (current_element.tagName) {
                case "P":
                    current_element.contentEditable = true;
                    current_element.innerText = HTMLToMarkdown(current_element.innerHTML);
                    break;
                case "H2":
                    current_element.innerHTML = await prompt("Bearbeite den Text wie nötig.", HTMLToMarkdown(current_element.innerHTML));
                    break;
                default:
                    console.log(current_element.tagName);
                    alert("Dieses Element kann nicht bearbeitet werden.");
                    break;
            }
        });

        delete_btn.click(async () => {
            const result = await confirm("Möchtest du dieses Element wirklich löschen?");
            if (result) current_element.remove();
        });

        function elmToJson(element) {
            const options = {
                tagName: element.tagName,
                attributes: {},
                children: [],
            };

            for (let attr of element.attributes) {
                options.attributes[attr.name] = attr.value;
            }

            for (let child of element.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    const content = child.textContent.trim();

                    if (content === "") continue;

                    options.children.push({
                        tagName: "___text___",
                        content,
                    });

                    continue;
                }

                options.children.push(elmToJson(child));
            }

            return options;
        }

        function jsonToElm(options) {
            const element = document.createElement(options.tagName);

            for (let attr in options.attributes) {
                element.setAttribute(attr, options.attributes[attr]);
            }

            for (let child of options.children) {
                if (child.tagName === "___text___") {
                    element.appendChild(document.createTextNode(child.content));
                    continue;
                }

                element.appendChild(jsonToElm(child));
            }

            return element;
        }

        function markdownToHtml(text) {
            return text
                .replace(/\*\*\*([^\*]{1,})\*\*\*/gm, "<b>$1</b>")
                .replace(/\_\_\_([^\_]{1,})\_\_\_/gm, "<i>$1</i>")
                .replace(/\+\+\+([^\+]{1,})\+\+\+/gm, "<u>$1</u>")
                .replace(/\{\[([^\]]+)\]\(([^)]+)\)\}/gm, "<a href='$2' target='_blank'>$1</a>");
        }

        function HTMLToMarkdown(text) {
            return text
                .replace(/<b>((?:(?!<\/b>).)+)<\/b>/gm, "***$1***")
                .replace(/<i>((?:(?!<\/b>).)+)<\/i>/gm, "___$1___")
                .replace(/<u>((?:(?!<\/b>).)+)<\/u>/gm, "+++$1+++")
                .replace(/<a href='([^']*)' target='_blank'>(.*?)<\/a>/gm, "{[$2]($1)}");
        }
    }, 500);
});

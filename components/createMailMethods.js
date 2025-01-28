import { toRealDate } from "./toRealDate.js";


export function createMailSubject(obj) {
    return obj.author_name + " schreibt über Webseitenformular";
}

export function createMailText(obj) {
    let date = toRealDate(Date());
    let divider = "----------------------------------------------";
    let address = `${obj.author_name} ${obj.author_family_name} hat diese E-Mail hinterlegt: ${obj.author_email}`;
    let footer1 = "Dies ist eine automatisch verschickte E-Mail über eine API von mailjet.com\nProgrammiert und aufgesetzt von Timon Fiedler.";
    let footer2 = "Timon Fiedler ist nicht verantwortlich für eventuellen Spam oder andere Fehler, die durch den Endnutzer entstehen.";
    let part2 = `${divider}\n\n${obj.message}\n\n${divider}\n${address}\n${divider}\n\n${footer1}\n${footer2}`;
    return `${obj.author_name} ${obj.author_family_name} schreibt am ${date}: \n${part2}`;
}
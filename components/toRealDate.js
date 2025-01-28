import { toDateString } from "timonjs";

export function toRealDate(date) {
    return toDateString(new Date(date));
}

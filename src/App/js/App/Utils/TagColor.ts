import * as tag from 'App/ServerApi/Tag';

export function getForegroundColor(tagColor: string) {
    const r = parseInt(tagColor.substr(0, 2), 16),
        g = parseInt(tagColor.substr(2, 2), 16),
        b = parseInt(tagColor.substr(4, 2), 16),
        // ref: https://stackoverflow.com/a/596243/646215
        lightness = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lightness < 90) {
        return '#FFF';
    }

    return null;
}

export function styleHtmlElement(htmlElement: HTMLElement, tag: tag.ITag) {
    if (!tag.hexColorCode) {
        return;
    }

    htmlElement.style.backgroundColor = '#' + tag.hexColorCode;

    const fgColor = getForegroundColor(tag.hexColorCode);
    if (fgColor) {
        htmlElement.style.color = fgColor;
    }
}

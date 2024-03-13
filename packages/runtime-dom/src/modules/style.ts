import { isString } from "@vue/shared";

export function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString(next);

    if(next && !isCssString) {
        for(let key in next) {
          setStyle(style, key, next[key]);
        }

        if(prev && !isString(prev)) {
            for(let key in prev) {
              if(next[key] == null) {
                setStyle(style, key, '');
              }
            }
        }
    }
}

function setStyle(style: CSSStyleDeclaration, name: string, value: string) {
  style[name] = value;
}
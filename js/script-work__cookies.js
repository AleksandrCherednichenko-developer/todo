// запись значений
export function writeCookie(name, val, expires) {
   var date = new Date;
   date.setDate(date.getDate() + expires);
   document.cookie = name + "=" + (val) + "; expires=" + date.toUTCString();
}
// получение значений
export function readCookie(name) {
   var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
   ));
   return matches ? decodeURIComponent(matches[1]) : undefined;
}
// удаление значений
export function deleteCookie(name) {
   writeCookie(name, "", -1)
}
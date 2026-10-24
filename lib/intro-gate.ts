/** Shared by the server layout (inline script) and the client intro component. */
export const INTRO_SEEN_KEY = "hotbun:intro-seen";

/**
 * Runs inline in <head> before first paint: skip the intro for returning
 * visitors in this session and for reduced-motion users, with no flash.
 */
export const introGateScript = `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="skip"}}catch(e){}`;

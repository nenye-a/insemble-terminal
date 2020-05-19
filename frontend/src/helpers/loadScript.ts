export default function loadScript(src: string) {
  let promise: Promise<null> = new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      resolve(null);
    });
    script.addEventListener('error', (event: Event) => {
      script.parentNode && script.parentNode.removeChild(script);
      reject(event);
    });
    document.head && document.head.appendChild(script);
  });
  return promise;
}

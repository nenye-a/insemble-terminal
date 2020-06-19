function copyToClipboard(text: string): void {
  let dummyEl = document.createElement('input');
  dummyEl.readOnly = true;
  dummyEl.value = text;
  dummyEl.style.position = 'absolute';
  if (document.body != null) {
    document.body.appendChild(dummyEl);
    selectText(dummyEl);
    document.execCommand('copy');
    if (dummyEl != null && dummyEl.parentNode != null) {
      dummyEl.parentNode.removeChild(dummyEl);
    }
  }
}

function selectText(node: HTMLInputElement) {
  if (navigator.userAgent.match(/ipad|iphone/i)) {
    node.setSelectionRange(0, 9999);
  } else {
    node.select();
  }
}

export default copyToClipboard;

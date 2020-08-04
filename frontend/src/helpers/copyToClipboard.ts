function copyToClipboard(text: string): void {
  // Create dummy element
  let dummyEl = document.createElement('input');
  dummyEl.readOnly = true;
  // Set the dummy element value to text
  dummyEl.value = text;
  // Set the position so the element won't be shown to user
  dummyEl.style.position = 'absolute';
  if (document.body != null) {
    // Attach to body
    document.body.appendChild(dummyEl);
    // Select the value of the dummy element
    selectText(dummyEl);
    // Copy text
    document.execCommand('copy');
    if (dummyEl != null && dummyEl.parentNode != null) {
      // Remove from body
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

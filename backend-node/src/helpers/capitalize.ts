export default function capitalize(sentence: string) {
  /**
   * This function is parsing the "CAPITALIZE_DATA" string into "Capitalize Data" string.
   */
  let wordArr = sentence.split('_');
  let capitalizedText = '';
  for (let word of wordArr) {
    let capitalizedWord =
      word[0].toUpperCase() + word.substring(1).toLowerCase() + ' ';
    capitalizedText += capitalizedWord;
  }
  return capitalizedText.trim();
}

// Original vector tiles. Empty areas of each tile are transparent.
const tilePaths = {
  diamonds: '<path d="M-50 0L50 100L150 0M-50 100L50 0L150 100" fill="none" stroke="#193b4c" stroke-width="9"/>',
  slots: '<path fill="#224653" fill-rule="evenodd" d="M0 0H100V100H0Z M8 10H42V36H8Z M58 10H92V36H58Z M0 60H16V86H0Z M34 60H66V86H34Z M84 60H100V86H84Z"/>',
  waves: '<g fill="none" stroke="#29485b" stroke-width="12"><path d="M-10 12Q25 44 50 20T110 12M-10 62Q25 94 50 70T110 62"/></g>'
};
function patternSource(name) {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">' + tilePaths[name] + '</svg>';
}
function svgUrl(source) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
}

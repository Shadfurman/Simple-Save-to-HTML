var standardStyles = {
  'TITLE': { 'cssReference': 'article h1', 'fontSize': 26, 'fontName': 'Arial', 'color': '#000000', 'marginTop': '0', 'marginBottom': '3', 'bold': false, 'italic': false },
  'SUBTITLE': { 'cssReference': 'article h1 small', 'fontSize': 15, 'fontName': 'Arial', 'color': '#666666', 'marginTop': '0', 'marginBottom': '16', 'bold': false, 'italic': false },
  'HEADING1': { 'cssReference': 'article h2', 'fontSize': 20, 'fontName': 'Arial', 'color': '#000000', 'marginTop': '20', 'marginBottom': '6', 'bold': false, 'italic': false },
  'HEADING2': { 'cssReference': 'article h3', 'fontSize': 16, 'fontName': 'Arial', 'color': '#000000', 'marginTop': '18', 'marginBottom': '6', 'bold': false, 'italic': false },
  'HEADING3': { 'cssReference': 'article h4', 'fontSize': 14, 'fontName': 'Arial', 'color': '#434343', 'marginTop': '16', 'marginBottom': '4', 'bold': false, 'italic': false },
  'HEADING4': { 'cssReference': 'article h5', 'fontSize': 12, 'fontName': 'Arial', 'color': '#666666', 'marginTop': '14', 'marginBottom': '4', 'bold': false, 'italic': false },
  'HEADING5': { 'cssReference': 'article h6', 'fontSize': 11, 'fontName': 'Arial', 'color': '#666666', 'marginTop': '12', 'marginBottom': '4', 'bold': false, 'italic': false },
  'HEADING6': { 'cssReference': 'article h6 small', 'fontSize': 11, 'fontName': 'Arial', 'color': '#666666', 'marginTop': '12', 'marginBottom': '4', 'bold': false, 'italic': true },
  'NORMAL': { 'cssReference': 'article p', 'fontSize': 11, 'fontName': 'Arial', 'color': '#000000', 'marginTop': '0', 'marginBottom': '0', 'bold': false, 'italic': false }
};

var errorMessage = '';

function convertDocToHTML() {
  var doc = DocumentApp.getActiveDocument();
  var documentName = doc.getName();
  var body = doc.getBody();
  var htmlOutput = '<article>\n';
  var cssOutput = '';
  var processedHeadings = [];
  var inList = false;
  var listType = null;
  
  var body = DocumentApp.getActiveDocument().getBody();
  var numElements = body.getNumChildren();

  for (var i = 0; i < numElements; i++) {
    var element = body.getChild(i);
    var elementType = element.getType();

    switch (elementType) {
      case DocumentApp.ElementType.PARAGRAPH:
        var paragraph = element.asParagraph();
        var text = paragraph.editAsText();
        var headingType = paragraph.getHeading();
        cssOutput += processHeadingsToCss(text, processedHeadings, headingType);

        if (inList) { // close open lists
          htmlOutput += '</' + listType + '>\n';
          inList = false;
          listType = null;
        }

        htmlOutput += handleParagraph(paragraph, headingType);
        break;
      case DocumentApp.ElementType.LIST_ITEM:
        var listItem = element.asListItem();
        var text = listItem.editAsText();
        var headingType = listItem.getHeading();
        var glyphType = listItem.getGlyphType();
        cssOutput += processHeadingsToCss(text, processedHeadings, headingType);

        if (!inList) {
          var attributes = listItem.getAttributes();
          styleString = getIndentCss(attributes);
          listType = getListType(glyphType);
          htmlOutput += '<' + listType + styleString + '>\n';
          inList = true;
        }
        listItemHtml = handleListItem(listItem, headingType);
        htmlOutput += '<li>' + listItemHtml + '</li>\n';
        break;
      // Add cases for other types like tables, images, etc.
    }
  }
  // Close any open list at the end of the loop
  if (inList) {
    htmlOutput += '</' + listType + '>\n';
  }
  htmlOutput += '</article>';
  var htmlTemplate = HtmlService.createTemplateFromFile('SaveDialog');
  htmlTemplate.htmlOutput = htmlOutput;
  htmlTemplate.cssOutput = cssOutput;
  htmlTemplate.documentName = documentName;
  htmlTemplate.errorMessage = errorMessage;
  var html = htmlTemplate.evaluate().setWidth(400).setHeight(420);
  DocumentApp.getUi().showModalDialog(html, 'HTML Output');
}

function getListType (glyphType) {
    switch (glyphType) {
    case DocumentApp.GlyphType.BULLET:
      listType = 'ul';
      break;
    case DocumentApp.GlyphType.NUMBER:
      listType = 'ol';
      break;
    // Handle other list types like checkbox, etc.
  }
  return listType;
}

function processHeadingsToCss(text, processedHeadings, headingType) {
  var headingTypeName = DocumentApp.ParagraphHeading[headingType];
  var cssOutput = '';

  // Check if the paragraph is a heading and if its style hasn't been recorded yet
  if (!processedHeadings.includes(headingTypeName)) {
    // var text = paragraph.editAsText();
    var attributes = text.getAttributes();

    var styles = getStylesOrDefault(attributes, headingTypeName);
    cssOutput = constructCSS(headingTypeName, styles);
    processedHeadings.push(headingTypeName);
  };

  return cssOutput
}

function getIndentCss(attributes) {
  var startIndent = attributes[DocumentApp.Attribute.INDENT_START] || 0;
  var firstLineIndent = attributes[DocumentApp.Attribute.INDENT_FIRST_LINE] || 0;
  var styleString = '';

  // Add styles only if indentations are not null and not zero
  var effectiveFirstLineIndent = firstLineIndent - startIndent;
  if (startIndent > 0) {
    styleString += 'margin-left: ' + startIndent + 'pt; ';
  }
  if (effectiveFirstLineIndent > 0) {
    styleString += 'text-indent: ' + effectiveFirstLineIndent + 'pt; ';
  }
  if (styleString) {
    styleString = styleString.trim();
    styleString = ' style="' + styleString + '" ';
  }

  return styleString;
}

function convertTextToHtml(text, headingType, styleString) {
  var htmlOutput = '';

  // Handling empty paragraphs
  if (text === '') {
    htmlOutput += '<br>\n';
  } else {
    // Handling headings and normal paragraphs
    switch(headingType) {
      case DocumentApp.ParagraphHeading.TITLE:
        htmlOutput += '<h1' + styleString + '>' + text + '</h1>\n';
        break;
      case DocumentApp.ParagraphHeading.SUBTITLE:
        htmlOutput += '<h1' + styleString + '><small>' + text + '</small></h1>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING1:
        htmlOutput += '<h2' + styleString + '>' + text + '</h2>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING2:
        htmlOutput += '<h3' + styleString + '>' + text + '</h3>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING3:
        htmlOutput += '<h4' + styleString + '>' + text + '</h4>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING4:
        htmlOutput += '<h5' + styleString + '>' + text + '</h5>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING5:
        htmlOutput += '<h6' + styleString + '>' + text + '</h6>\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING6:
        htmlOutput += '<h6><small' + styleString + '>' + text + '</small></h6>\n';
        break;

      default:
        htmlOutput += '<p' + styleString + '>' + text + '</p>\n';
    }
  }

  return htmlOutput
}

function handleListItem(listItem, headingType) {
  var text = listItem.getText().trim();
  var styleString = '';
  var htmlOutput = '';
  htmlOutput = convertTextToHtml(text, headingType, styleString);
  return htmlOutput;
}

function handleParagraph(paragraph, headingType) {
  var text = paragraph.getText().trim();
  var attributes = paragraph.getAttributes();
  var styleString = '';
  var htmlOutput = '';

  styleString = getIndentCss (attributes);
  htmlOutput = convertTextToHtml(text, headingType, styleString);
  return htmlOutput;
}

function getStylesOrDefault(attributes, headingType) {
  var defaultStyles = standardStyles[headingType];
  var styles = {};

  styles.fontSize = attributes[DocumentApp.Attribute.FONT_SIZE] || defaultStyles.fontSize;
  styles.fontName = attributes[DocumentApp.Attribute.FONT_FAMILY] || defaultStyles.fontName;
  styles.color = attributes[DocumentApp.Attribute.FOREGROUND_COLOR] || defaultStyles.color;
  styles.marginTop = defaultStyles.marginTop;
  styles.marginBottom = defaultStyles.marginBottom;
  styles.bold = (attributes[DocumentApp.Attribute.BOLD] !== null) ? attributes[DocumentApp.Attribute.BOLD] : defaultStyles.bold;
  styles.italic = (attributes[DocumentApp.Attribute.ITALIC] !== null) ? attributes[DocumentApp.Attribute.ITALIC] : defaultStyles.italic;
  return styles;
}

function constructCSS(headingType, styles) {
  cssRef = standardStyles[headingType].cssReference;

  var css = cssRef + ' {\n';
  css += '\tfont-size: ' + styles.fontSize + 'pt;\n';
  css += '\tfont-family: ' + styles.fontName + ';\n';
  css += '\tfont-weight: lighter;\n';
  css += '\tcolor: ' + styles.color + ';\n';  
  css += '\tmargin-top: ' + styles.marginTop + 'px;\n';
  css += '\tmargin-bottom: ' + styles.marginBottom + 'px;\n';
  if (styles.bold) {
    css += '\tfont-weight: bold;\n';
  }
  if (styles.italic) {
    css += '\tfont-style: italic;\n';
  }
  // Add other CSS properties as needed
  css += '}\n';
  return css;
}

function saveToGoogleDocs(content, filename) {
  var newDoc = null;
  var url = null;
  var returnMessage = '';

  newDoc = DocumentApp.create(filename);
  Utilities.sleep(1);
  try {
    url = newDoc.getUrl();
    if (url) {
      newDoc.getBody().setText(content);
      returnMessage += filename + ' created successfully. ';
    } else {
      returnMessage += 'Document URL is not available. ';
    }
  } catch (e) {
    returnMessage += 'Failed: ' + e.toString() + '. ';
  }
    
  return returnMessage;
}

function onOpen() {
  var ui = DocumentApp.getUi();
  ui.createMenu('Simple HTML')
    .addItem('Save HTML or CSS', 'convertDocToHTML')
    .addToUi();
}

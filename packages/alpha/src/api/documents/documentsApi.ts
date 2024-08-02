// Copyright 2024 Cognite AS

import { CogniteInternalId } from '@cognite/sdk-core';
import { DocumentsAPI } from '@cognite/sdk';

import {
  DocumentCellElement,
  DocumentElement,
  DocumentElementsResponse,
  DocumentLineElement,
  DocumentListElement,
  DocumentParagraphElement,
  DocumentTableElement,
  DocumentTableOfContentsElement,
  DocumentTitleElement,
  DocumentWordElement,
} from '../../types';

abstract class TextWithBoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  page: number;
  text: string;

  constructor(
    left: number,
    right: number,
    top: number,
    bottom: number,
    page: number,
    text: string
  ) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.page = page;
    this.text = text;
  }
}

class WordWithBoundingBox extends TextWithBoundingBox {
  constructor(word: DocumentWordElement) {
    const left = word.characters[0].left;
    const right = word.characters[word.characters.length - 1].right;
    let top = word.characters[0].top;
    let bottom = word.characters[0].bottom;
    const page = word.characters[0].page;
    let text = '';

    for (const character of word.characters) {
      if (character.top < top) {
        top = character.top;
      }
      if (character.bottom > bottom) {
        bottom = character.bottom;
      }
      text += character.text;
    }

    super(left, right, top, bottom, page, text);
  }
}

class LineWithBoundingBox extends TextWithBoundingBox {
  words: WordWithBoundingBox[];

  constructor(line: DocumentLineElement) {
    const words = line.words.map((word) => new WordWithBoundingBox(word));

    const left = words[0].left;
    const right = words[words.length - 1].right;
    let top = words[0].top;
    let bottom = words[0].bottom;
    const page = words[0].page;
    let text = '';

    for (const word of words) {
      if (word.top < top) {
        top = word.top;
      }
      if (word.bottom > bottom) {
        bottom = word.bottom;
      }
      if (text.length > 0) {
        text += ' ';
      }
      text += word.text;
    }

    super(left, right, top, bottom, page, text);
    this.words = words;
  }
}

class LinesWithBoundingBox extends TextWithBoundingBox {
  lines: LineWithBoundingBox[];

  constructor(lines: LineWithBoundingBox[]) {
    let left = lines[0].left;
    let right = lines[0].right;
    const top = lines[0].top;
    const bottom = lines[lines.length - 1].bottom;
    const page = lines[0].page;
    let text = '';

    for (const line of lines) {
      if (line.left < left) {
        left = line.left;
      }
      if (line.right > right) {
        right = line.right;
      }
      if (text.length > 0) {
        text += '\n';
      }
      text += line.text;
    }

    super(left, right, top, bottom, page, text);
    this.lines = lines;
  }
}

class ParagraphWithBoundingBox extends LinesWithBoundingBox {
  constructor(element: DocumentParagraphElement) {
    const lines = element.lines.map((line) => new LineWithBoundingBox(line));
    super(lines);
  }
}

class TableOfContentsWithBoundingBox extends LinesWithBoundingBox {
  constructor(element: DocumentTableOfContentsElement) {
    const lines = element.lines.map((line) => new LineWithBoundingBox(line));
    super(lines);
  }
}

class ListWithBoundingBox extends LinesWithBoundingBox {
  constructor(element: DocumentListElement) {
    const lines = element.lines.map((line) => new LineWithBoundingBox(line));
    super(lines);
  }
}

class TitleWithBoundingBox extends LinesWithBoundingBox {
  level: number;

  constructor(element: DocumentTitleElement) {
    const level = element.level || 3;
    const lines = element.lines.map((line) => new LineWithBoundingBox(line));
    super(lines);
    this.level = level;
  }
}

class CellWithBoundingBox extends LinesWithBoundingBox {
  constructor(element: DocumentCellElement) {
    const lines = element.lines.map((line) => new LineWithBoundingBox(line));
    super(lines);
  }
}

class TableWithBoundingBox extends LinesWithBoundingBox {
  columnHeaderCount: number;
  rowHeaderCount: number;
  rows: (CellWithBoundingBox | null)[][];

  constructor(element: DocumentTableElement) {
    const rows = element.rows.map((cells) =>
      cells.map((cell) =>
        cell.lines.length > 0 ? new CellWithBoundingBox(cell) : null
      )
    );
    const lines = [];
    for (const cells of rows) {
      for (const cell of cells) {
        if (cell === null) continue;

        lines.push(...cell.lines);
      }
    }
    super(lines);
    this.columnHeaderCount = element.columnHeaderCount || 0;
    this.rowHeaderCount = element.rowHeaderCount || 0;
    this.rows = rows;
  }
}

export type ElementWithBoundingBox =
  | TitleWithBoundingBox
  | ParagraphWithBoundingBox
  | ListWithBoundingBox
  | TableOfContentsWithBoundingBox
  | TableWithBoundingBox;

export class DocumentElementsResponseWithHelpers {
  elements: DocumentElement[];

  constructor(response: DocumentElementsResponse) {
    this.elements = response.elements;
  }

  private getElementPage(element: DocumentElement): number {
    if ('rows' in element) {
      for (const row of element.rows) {
        for (const cell of row) {
          for (const line of cell.lines) {
            return line.words[0].characters[0].page;
          }
        }
      }
    } else if (element.lines !== undefined) {
      for (const line of element.lines) {
        return line.words[0].characters[0].page;
      }
    }

    throw new Error('Unable to determine page for element');
  }

  public *getElements(
    fromPage?: number,
    toPage?: number
  ): Generator<ElementWithBoundingBox, void> {
    for (const element of this.elements) {
      const page = this.getElementPage(element);
      if (fromPage !== undefined && page < fromPage) {
        continue;
      }
      if (toPage !== undefined && page > toPage) {
        return;
      }
      if (element.type == 'table') {
        yield new TableWithBoundingBox(element as DocumentTableElement);
      } else if (element.type == 'title') {
        yield new TitleWithBoundingBox(element as DocumentTitleElement);
      } else if (element.type == 'list') {
        yield new ListWithBoundingBox(element as DocumentListElement);
      } else if (element.type == 'toc') {
        yield new TableOfContentsWithBoundingBox(
          element as DocumentTableOfContentsElement
        );
      } else {
        yield new ParagraphWithBoundingBox(element as DocumentParagraphElement);
      }
    }
  }

  public *getLines(
    fromPage?: number,
    toPage?: number
  ): Generator<LineWithBoundingBox, void> {
    for (const element of this.getElements(fromPage, toPage)) {
      for (const line of element.lines) {
        yield line;
      }
    }
  }

  public *getWords(
    fromPage?: number,
    toPage?: number
  ): Generator<WordWithBoundingBox, void> {
    for (const line of this.getLines(fromPage, toPage)) {
      for (const word of line.words) {
        yield word;
      }
    }
  }
}

export class DocumentsAPIAlpha extends DocumentsAPI {
  public elements = (
    id: CogniteInternalId
  ): Promise<DocumentElementsResponseWithHelpers> => {
    return this.documentElements(id);
  };

  private async documentElements(
    id: CogniteInternalId
  ): Promise<DocumentElementsResponseWithHelpers> {
    const response = await this.get<DocumentElementsResponse>(
      this.url(`${id}/elements`)
    );
    return new DocumentElementsResponseWithHelpers(response.data);
  }
}

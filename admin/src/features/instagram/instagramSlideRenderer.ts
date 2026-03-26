export type SlideVariant = 'text-only' | 'text-with-image' | 'text-with-horizontal-image' | 'image-with-text';
export type SlideColorTheme = 'dedicated' | 'frontend' | 'plain-rose';

export interface SlideRenderOptions {
  variant: SlideVariant;
  colorTheme: SlideColorTheme;
  title: string;
  body: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
}

const WIDTH = 1080;
const HEIGHT = 1350;
const STANDARD_CARD_X = 126;
const STANDARD_CARD_Y = 198;
const STANDARD_CARD_W = WIDTH - 252;
const STANDARD_CARD_H = 838;
const STACKED_IMAGE_H = 712;

const palette = {
  paper: '#FFFDFC',
  text: '#2A2520',
  muted: '#7A7068',
  shadow: 'rgba(42, 37, 32, 0.05)',
  bullet: '#B88B67',
};

const backgroundThemes: Record<SlideColorTheme, {
  background: string;
  topLeft: string;
  rightDefault: string;
  rightAlt: string;
  bottomLeft: string;
  frame: string;
  cardBorder: string;
  cardShadow: string;
  imageBorder: string;
  imagePlaceholder: string;
  opacity: number;
  showShapes: boolean;
}> = {
  dedicated: {
    background: '#FDFAF5',
    topLeft: '#C8DEDB',
    rightDefault: '#E8BDC3',
    rightAlt: '#E7B3BA',
    bottomLeft: '#EFE7DC',
    frame: '#E6DDD3',
    cardBorder: 'rgba(126, 108, 95, 0.12)',
    cardShadow: 'rgba(42, 37, 32, 0.05)',
    imageBorder: 'rgba(126, 108, 95, 0.14)',
    imagePlaceholder: 'rgba(200, 222, 219, 0.35)',
    opacity: 0.5,
    showShapes: true,
  },
  frontend: {
    background: '#EEF5F1',
    topLeft: '#8FC4C1',
    rightDefault: '#D4A373',
    rightAlt: '#9AAA88',
    bottomLeft: '#EACCA6',
    frame: '#D6E4DF',
    cardBorder: 'rgba(92, 129, 123, 0.18)',
    cardShadow: 'rgba(80, 110, 104, 0.05)',
    imageBorder: 'rgba(92, 129, 123, 0.2)',
    imagePlaceholder: 'rgba(143, 196, 193, 0.24)',
    opacity: 0.58,
    showShapes: true,
  },
  'plain-rose': {
    background: '#E34262',
    topLeft: '#E34262',
    rightDefault: '#E34262',
    rightAlt: '#E34262',
    bottomLeft: '#E34262',
    frame: 'rgba(255,255,255,0.42)',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(119, 22, 44, 0.12)',
    imageBorder: 'rgba(255, 255, 255, 0.26)',
    imagePlaceholder: 'rgba(255, 255, 255, 0.14)',
    opacity: 0,
    showShapes: false,
  },
};

type BodyBlock =
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string };

function normalizeText(value: string) {
  return value.normalize('NFC');
}

function loadImage(url?: string | null): Promise<HTMLImageElement | null> {
  if (!url) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  stroke: string,
  lineWidth: number
) {
  roundedRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawBackground(ctx: CanvasRenderingContext2D, variant: SlideVariant, colorTheme: SlideColorTheme) {
  const theme = backgroundThemes[colorTheme];

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (!theme.showShapes) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = theme.opacity;

  ctx.fillStyle = theme.topLeft;
  ctx.beginPath();
  ctx.arc(38, 190, 228, Math.PI * 0.2, Math.PI * 1.55);
  ctx.quadraticCurveTo(26, 116, 79, 182);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = variant === 'image-with-text' ? theme.rightAlt : theme.rightDefault;
  ctx.beginPath();
  ctx.moveTo(962, 520);
  ctx.bezierCurveTo(1096, 504, 1110, 622, 1038, 690);
  ctx.bezierCurveTo(986, 736, 936, 722, 884, 748);
  ctx.lineTo(884, 538);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.bottomLeft;
  ctx.beginPath();
  ctx.moveTo(0, 1036);
  ctx.bezierCurveTo(110, 942, 246, 998, 268, 1124);
  ctx.bezierCurveTo(280, 1196, 236, 1252, 162, 1262);
  ctx.bezierCurveTo(86, 1272, 28, 1228, 0, 1194);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D, colorTheme: SlideColorTheme) {
  strokeRoundedRect(ctx, 36, 36, WIDTH - 72, HEIGHT - 72, 30, backgroundThemes[colorTheme].frame, 2);
}

function drawPaperCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colorTheme: SlideColorTheme
) {
  const theme = backgroundThemes[colorTheme];

  ctx.save();
  ctx.shadowColor = theme.cardShadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(ctx, x, y, w, h, 18, palette.paper);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, 18, theme.cardBorder, 1.5);
}

function parseBody(body: string): BodyBlock[] {
  const lines = normalizeText(body)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [{ type: 'paragraph', text: 'Ajoutez ici votre message pour composer le slide Instagram.' }];
  }

  return lines.map((line) => {
    const bulletMatch = line.match(/^(?:[-*•]\s*)(.+)$/);
    if (bulletMatch) {
      return { type: 'bullet', text: bulletMatch[1].trim() };
    }
    return { type: 'paragraph', text: line };
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function fitTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  maxWidth: number,
  maxLines: number,
  initialFontSize: number,
  minFontSize: number
) {
  for (let fontSize = initialFontSize; fontSize >= minFontSize; fontSize -= 2) {
    ctx.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    const lines = wrapText(ctx, title, maxWidth);
    if (lines.length <= maxLines) {
      return { fontSize, lines };
    }
  }

  ctx.font = `700 ${minFontSize}px "Segoe UI", Arial, sans-serif`;
  return {
    fontSize: minFontSize,
    lines: wrapText(ctx, title, maxWidth).slice(0, maxLines),
  };
}

function fitBody(
  ctx: CanvasRenderingContext2D,
  blocks: BodyBlock[],
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  minFontSize: number
) {
  for (let fontSize = initialFontSize; fontSize >= minFontSize; fontSize -= 2) {
    ctx.font = `400 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    const lineHeight = Math.round(fontSize * 1.48);
    const groupedLines = blocks.map((block) => ({
      type: block.type,
      lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - 54 : maxWidth),
    }));

    const totalHeight = groupedLines.reduce((acc, group, index) => {
      const spacing = index < groupedLines.length - 1 ? Math.round(fontSize * 0.48) : 0;
      return acc + (group.lines.length * lineHeight) + spacing;
    }, 0);

    if (totalHeight <= maxHeight) {
      return { fontSize, lineHeight, groupedLines, totalHeight };
    }
  }

  ctx.font = `400 ${minFontSize}px "Segoe UI", Arial, sans-serif`;
  const groupedLines = blocks.map((block) => ({
    type: block.type,
    lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - 54 : maxWidth),
  }));

  const totalHeight = groupedLines.reduce((acc, group, index) => {
    const spacing = index < groupedLines.length - 1 ? Math.round(minFontSize * 0.48) : 0;
    return acc + (group.lines.length * Math.round(minFontSize * 1.48)) + spacing;
  }, 0);

  return {
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.48),
    groupedLines,
    totalHeight,
  };
}

function drawTextGroup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  blocks: ReturnType<typeof fitBody>,
  color: string,
  align: CanvasTextAlign
) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.font = `400 ${blocks.fontSize}px "Segoe UI", Arial, sans-serif`;

  let cursorY = y;
  for (let groupIndex = 0; groupIndex < blocks.groupedLines.length; groupIndex += 1) {
    const group = blocks.groupedLines[groupIndex];

    for (let lineIndex = 0; lineIndex < group.lines.length; lineIndex += 1) {
      const line = group.lines[lineIndex];

      if (group.type === 'bullet' && lineIndex === 0) {
        ctx.fillStyle = palette.bullet;
        ctx.beginPath();
        const bulletX = x + 10;
        const bulletY = cursorY + blocks.lineHeight * 0.52;
        ctx.arc(bulletX, bulletY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
      }

      const textX = align === 'center'
        ? x + (maxWidth / 2)
        : (group.type === 'bullet' ? x + 32 : x);

      ctx.fillText(line, textX, cursorY);
      cursorY += blocks.lineHeight;
    }

    if (groupIndex < blocks.groupedLines.length - 1) {
      cursorY += Math.round(blocks.fontSize * 0.48);
    }
  }
}

function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource | null,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  colorTheme: SlideColorTheme
) {
  const theme = backgroundThemes[colorTheme];

  if (!image) {
    drawRoundedRect(ctx, x, y, w, h, radius, theme.imagePlaceholder);
    strokeRoundedRect(ctx, x, y, w, h, radius, theme.imageBorder, 1.5);
    ctx.fillStyle = palette.muted;
    ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ajouter une image', x + (w / 2), y + (h / 2));
    return;
  }

  ctx.save();
  roundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const sourceWidth = (image as HTMLImageElement).width;
  const sourceHeight = (image as HTMLImageElement).height;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = w / h;

  let drawWidth = w;
  let drawHeight = h;
  let drawX = x;
  let drawY = y;

  if (sourceRatio > targetRatio) {
    drawWidth = h * sourceRatio;
    drawX = x - ((drawWidth - w) / 2);
  } else {
    drawHeight = w / sourceRatio;
    drawY = y - ((drawHeight - h) / 2);
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, radius, theme.imageBorder, 1.5);
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: CanvasImageSource | null, colorTheme: SlideColorTheme) {
  const width = 148;
  const height = 100;
  const x = WIDTH - width - 82;
  const y = HEIGHT - height - 78;

  if (!logo) {
    ctx.fillStyle = colorTheme === 'plain-rose' ? '#FFF5F7' : palette.bullet;
    ctx.font = '700 40px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('OB', x + width, y + height);
    return;
  }

  const image = logo as HTMLImageElement;
  const aspect = image.width / image.height;
  const drawWidth = aspect >= width / height ? width : height * aspect;
  const drawHeight = aspect >= width / height ? width / aspect : height;
  const drawX = x + (width - drawWidth);
  const drawY = y + (height - drawHeight);

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawCenteredTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  maxLines: number,
  initialFontSize: number,
  minFontSize: number,
  lineHeightMultiplier: number,
  spacingAfter: number
) {
  const safeTitle = normalizeText(title).trim();
  let cursorY = startY;

  if (!safeTitle) {
    return cursorY;
  }

  const titleLayout = fitTitle(ctx, safeTitle, maxWidth, maxLines, initialFontSize, minFontSize);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (const line of titleLayout.lines) {
    ctx.fillText(line, centerX, cursorY);
    cursorY += titleLayout.fontSize * lineHeightMultiplier;
  }

  return cursorY + spacingAfter;
}

function drawTextOnlySlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  colorTheme: SlideColorTheme
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);

  const hasTitle = normalizeText(title).trim().length > 0;
  const cursorY = drawCenteredTitle(
    ctx,
    title,
    cardX + (cardW / 2),
    cardY + 76,
    cardW - 148,
    3,
    52,
    38,
    1.18,
    hasTitle ? 32 : 0
  );

  const bodyMaxHeight = cardH - (cursorY - cardY) - 88;
  const bodyLayout = fitBody(ctx, blocks, cardW - 148, bodyMaxHeight, 37, 26);
  const balancedCursorY = cursorY + Math.max(0, Math.min(42, (bodyMaxHeight - bodyLayout.totalHeight) / 2));
  drawTextGroup(ctx, cardX + 74, balancedCursorY, cardW - 148, bodyLayout, palette.muted, 'left');
}

function drawTextWithImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);

  const hasTitle = normalizeText(title).trim().length > 0;
  const cursorY = drawCenteredTitle(
    ctx,
    title,
    cardX + 70 + 220,
    cardY + 72,
    448,
    3,
    48,
    36,
    1.15,
    hasTitle ? 28 : 0
  );

  const bodyMaxHeight = cardH - (cursorY - cardY) - 92;
  const bodyLayout = fitBody(ctx, blocks, 440, bodyMaxHeight, 40, 23);
  const balancedCursorY = cursorY + Math.max(0, Math.min(120, (bodyMaxHeight - bodyLayout.totalHeight) / 2));
  drawTextGroup(ctx, cardX + 70, balancedCursorY, 440, bodyLayout, palette.muted, 'left');

  drawContainedImage(ctx, image, cardX + cardW - 282, cardY + 118, 212, 396, 16, colorTheme);
}

function drawTextWithHorizontalImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);

  const hasTitle = normalizeText(title).trim().length > 0;
  const cursorY = drawCenteredTitle(
    ctx,
    title,
    cardX + (cardW / 2),
    cardY + 68,
    cardW - 120,
    3,
    48,
    36,
    1.15,
    hasTitle ? 26 : 0
  );

  const imageY = cardY + cardH - 286;
  const textHeightBudget = imageY - cursorY - 44;
  const bodyLayout = fitBody(ctx, blocks, cardW - 120, textHeightBudget, 36, 22);
  const balancedCursorY = cursorY + Math.max(0, Math.min(72, (textHeightBudget - bodyLayout.totalHeight) / 2));
  drawTextGroup(ctx, cardX + 60, balancedCursorY, cardW - 120, bodyLayout, palette.muted, 'left');

  drawContainedImage(ctx, image, cardX + 60, imageY, cardW - 120, 192, 16, colorTheme);
}

function drawImageWithTextSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme
) {
  const imageX = STANDARD_CARD_X;
  const imageY = STANDARD_CARD_Y;
  const imageW = STANDARD_CARD_W;
  const imageH = STACKED_IMAGE_H;

  drawContainedImage(ctx, image, imageX, imageY, imageW, imageH, 18, colorTheme);

  const plaqueX = 148;
  const plaqueY = 792;
  const plaqueW = 544;
  const plaqueH = 246;
  drawPaperCard(ctx, plaqueX, plaqueY, plaqueW, plaqueH, colorTheme);

  const hasTitle = normalizeText(title).trim().length > 0;
  const cursorY = drawCenteredTitle(
    ctx,
    title,
    plaqueX + (plaqueW / 2),
    plaqueY + 40,
    plaqueW - 88,
    2,
    42,
    30,
    1.14,
    hasTitle ? 16 : 0
  );

  const textBlocks = blocks.length > 2 ? blocks.slice(0, 2) : blocks;
  const bodyMaxHeight = 96;
  const bodyLayout = fitBody(ctx, textBlocks, plaqueW - 88, bodyMaxHeight, 26, 19);
  const balancedCursorY = cursorY + Math.max(0, Math.min(16, (bodyMaxHeight - bodyLayout.totalHeight) / 2));
  drawTextGroup(ctx, plaqueX + 44, balancedCursorY, plaqueW - 88, bodyLayout, palette.muted, 'left');
}

export async function renderInstagramSlide(options: SlideRenderOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const [contentImage, logoImage] = await Promise.all([
    loadImage(options.imageUrl),
    loadImage(options.logoUrl),
  ]);

  drawBackground(ctx, options.variant, options.colorTheme);
  drawFrame(ctx, options.colorTheme);

  const safeTitle = normalizeText(options.title).trim();
  const blocks = parseBody(options.body);

  if (options.variant === 'text-only') {
    drawTextOnlySlide(ctx, safeTitle, blocks, options.colorTheme);
  } else if (options.variant === 'text-with-image') {
    drawTextWithImageSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme);
  } else if (options.variant === 'text-with-horizontal-image') {
    drawTextWithHorizontalImageSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme);
  } else {
    drawImageWithTextSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme);
  }

  drawLogo(ctx, logoImage, options.colorTheme);

  return canvas.toDataURL('image/png');
}

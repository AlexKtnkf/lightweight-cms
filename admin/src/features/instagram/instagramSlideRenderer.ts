export type SlideVariant = 'text-only' | 'text-with-image' | 'text-with-horizontal-image' | 'image-with-text';
export type SlideColorTheme = 'dedicated' | 'frontend' | 'plain-rose' | 'plain-sage' | 'plain-violet' | 'tricolor-soft';
export type SlideTextAlignment = 'normal' | 'center';

export interface SlideRenderOptions {
  variant: SlideVariant;
  colorTheme: SlideColorTheme;
  title: string;
  body: string;
  bodyAlignment?: SlideTextAlignment;
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
const BULLET_TEXT_INDENT = 42;
const BULLET_WRAP_OFFSET = 64;
const CENTERED_BULLET_WRAP_OFFSET = 54;

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
  logo: string;
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
    logo: '#D87A8E',
    cardBorder: 'rgba(126, 108, 95, 0.12)',
    cardShadow: 'rgba(42, 37, 32, 0.05)',
    imageBorder: 'rgba(126, 108, 95, 0.14)',
    imagePlaceholder: 'rgba(200, 222, 219, 0.35)',
    opacity: 0.5,
    showShapes: true,
  },
  frontend: {
    background: '#F7F1E9',
    topLeft: '#DCEBE5',
    rightDefault: '#E0BC96',
    rightAlt: '#BFD2C2',
    bottomLeft: '#EFE2D2',
    frame: 'rgba(61, 115, 112, 0.12)',
    logo: '#3D7370',
    cardBorder: 'rgba(61, 115, 112, 0.14)',
    cardShadow: 'rgba(42, 37, 32, 0.07)',
    imageBorder: 'rgba(61, 115, 112, 0.16)',
    imagePlaceholder: 'rgba(220, 235, 229, 0.72)',
    opacity: 0.46,
    showShapes: true,
  },
  'plain-rose': {
    background: '#E34262',
    topLeft: '#E34262',
    rightDefault: '#E34262',
    rightAlt: '#E34262',
    bottomLeft: '#E34262',
    frame: 'rgba(255,255,255,0.42)',
    logo: '#FFF5F7',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(119, 22, 44, 0.12)',
    imageBorder: 'rgba(255, 255, 255, 0.26)',
    imagePlaceholder: 'rgba(255, 255, 255, 0.14)',
    opacity: 0,
    showShapes: false,
  },
  'plain-sage': {
    background: '#9BC29D',
    topLeft: '#9BC29D',
    rightDefault: '#9BC29D',
    rightAlt: '#9BC29D',
    bottomLeft: '#9BC29D',
    frame: 'rgba(255,255,255,0.4)',
    logo: '#F7FFF7',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(49, 76, 50, 0.12)',
    imageBorder: 'rgba(255, 255, 255, 0.26)',
    imagePlaceholder: 'rgba(255, 255, 255, 0.14)',
    opacity: 0,
    showShapes: false,
  },
  'plain-violet': {
    background: '#9370DB',
    topLeft: '#9370DB',
    rightDefault: '#9370DB',
    rightAlt: '#9370DB',
    bottomLeft: '#9370DB',
    frame: 'rgba(255,255,255,0.4)',
    logo: '#F8F4FF',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'rgba(62, 42, 103, 0.14)',
    imageBorder: 'rgba(255, 255, 255, 0.26)',
    imagePlaceholder: 'rgba(255, 255, 255, 0.14)',
    opacity: 0,
    showShapes: false,
  },
  'tricolor-soft': {
    background: '#FBF8FD',
    topLeft: '#9BC29D',
    rightDefault: '#9370DB',
    rightAlt: '#A889E3',
    bottomLeft: '#E34262',
    frame: 'rgba(110, 92, 146, 0.14)',
    logo: '#6E56A6',
    cardBorder: 'rgba(110, 92, 146, 0.12)',
    cardShadow: 'rgba(57, 43, 86, 0.08)',
    imageBorder: 'rgba(110, 92, 146, 0.14)',
    imagePlaceholder: 'rgba(243, 236, 252, 0.78)',
    opacity: 0.32,
    showShapes: true,
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
  roundedRect(ctx, 40, 40, WIDTH - 80, HEIGHT - 80, 28);
  ctx.clip();

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
    return [{ type: 'paragraph', text: '' }];
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
  maxFontSize: number,
  minFontSize: number
) {
  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
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
  maxFontSize: number,
  minFontSize: number,
  bulletWrapOffset: number = BULLET_WRAP_OFFSET
) {
  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    ctx.font = `400 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    const lineHeight = Math.round(fontSize * 1.42);
    const groupedLines = blocks.map((block) => ({
      type: block.type,
      lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - bulletWrapOffset : maxWidth),
    }));

    const totalHeight = groupedLines.reduce((acc, group, index) => {
      const spacing = index < groupedLines.length - 1 ? Math.round(fontSize * 0.34) : 0;
      return acc + (group.lines.length * lineHeight) + spacing;
    }, 0);

    if (totalHeight <= maxHeight) {
      return { fontSize, lineHeight, groupedLines, totalHeight };
    }
  }

  ctx.font = `400 ${minFontSize}px "Segoe UI", Arial, sans-serif`;
  const groupedLines = blocks.map((block) => ({
    type: block.type,
    lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - bulletWrapOffset : maxWidth),
  }));

  const totalHeight = groupedLines.reduce((acc, group, index) => {
    const spacing = index < groupedLines.length - 1 ? Math.round(minFontSize * 0.34) : 0;
    return acc + (group.lines.length * Math.round(minFontSize * 1.42)) + spacing;
  }, 0);

  return {
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.42),
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
  align: SlideTextAlignment
) {
  ctx.fillStyle = color;
  ctx.textAlign = align === 'center' ? 'center' : 'left';
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
        const bulletX = align === 'center'
          ? x + (maxWidth / 2) - (ctx.measureText(line).width / 2) - 18
          : x + 10;
        const bulletY = cursorY + blocks.lineHeight * 0.52;
        ctx.arc(bulletX, bulletY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
      }

      const textX = align === 'center'
        ? x + (maxWidth / 2)
        : (group.type === 'bullet' ? x + BULLET_TEXT_INDENT : x);

      ctx.fillText(line, textX, cursorY);
      cursorY += blocks.lineHeight;
    }

    if (groupIndex < blocks.groupedLines.length - 1) {
      cursorY += Math.round(blocks.fontSize * 0.34);
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
  const logoColor = backgroundThemes[colorTheme].logo;

  if (!logo) {
    ctx.fillStyle = logoColor;
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

function drawTitleBlock(
  ctx: CanvasRenderingContext2D,
  title: string,
  x: number,
  y: number,
  width: number,
  maxLines: number,
  maxFontSize: number,
  minFontSize: number,
  align: SlideTextAlignment
) {
  const safeTitle = normalizeText(title).trim();
  if (!safeTitle) {
    return { bottomY: y, totalHeight: 0 };
  }

  const layout = fitTitle(ctx, safeTitle, width, maxLines, maxFontSize, minFontSize);
  const lineHeight = layout.fontSize * 1.08;

  ctx.fillStyle = palette.text;
  ctx.font = `700 ${layout.fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = align === 'center' ? 'center' : 'left';
  ctx.textBaseline = 'top';

  let cursorY = y;
  for (const line of layout.lines) {
    const textX = align === 'center' ? x + (width / 2) : x;
    ctx.fillText(line, textX, cursorY);
    cursorY += lineHeight;
  }

  return {
    bottomY: cursorY,
    totalHeight: cursorY - y,
  };
}

function measureTitleBlock(
  ctx: CanvasRenderingContext2D,
  title: string,
  width: number,
  maxLines: number,
  maxFontSize: number,
  minFontSize: number
) {
  const safeTitle = normalizeText(title).trim();
  if (!safeTitle) {
    return { totalHeight: 0 };
  }

  const layout = fitTitle(ctx, safeTitle, width, maxLines, maxFontSize, minFontSize);
  return {
    totalHeight: layout.lines.length * layout.fontSize * 1.08,
  };
}

function drawTextLayoutBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
  blocks: BodyBlock[],
  config: {
    titleMaxLines: number;
    titleMaxFontSize: number;
    titleMinFontSize: number;
    bodyMaxFontSize: number;
    bodyMinFontSize: number;
    contentPaddingX?: number;
    contentPaddingY?: number;
    gap?: number;
    alignment?: SlideTextAlignment;
  }
) {
  const paddingX = config.contentPaddingX ?? 0;
  const paddingY = config.contentPaddingY ?? 0;
  const gap = config.gap ?? 24;
  const alignment = config.alignment ?? 'normal';
  const hasTitle = normalizeText(title).trim().length > 0;
  const innerX = x + paddingX;
  const innerY = y + paddingY;
  const innerWidth = width - (paddingX * 2);
  const innerHeight = height - (paddingY * 2);

  const titleMeasure = hasTitle
    ? measureTitleBlock(
        ctx,
        title,
        innerWidth,
        config.titleMaxLines,
        config.titleMaxFontSize,
        config.titleMinFontSize
      )
    : { totalHeight: 0 };

  const bodyMaxHeight = Math.max(
    innerHeight - (hasTitle ? titleMeasure.totalHeight + gap : 0),
    Math.round(config.bodyMinFontSize * 1.5)
  );
  const bodyLayout = fitBody(
    ctx,
    blocks,
    innerWidth,
    bodyMaxHeight,
    config.bodyMaxFontSize,
    config.bodyMinFontSize,
    alignment === 'center' ? CENTERED_BULLET_WRAP_OFFSET : BULLET_WRAP_OFFSET
  );

  const contentHeight =
    (hasTitle ? titleMeasure.totalHeight + gap : 0) + bodyLayout.totalHeight;
  const startY = alignment === 'center'
    ? innerY + Math.max(0, (innerHeight - contentHeight) / 2)
    : innerY;

  let cursorY = startY;

  if (hasTitle) {
    const titleDraw = drawTitleBlock(
      ctx,
      title,
      innerX,
      cursorY,
      innerWidth,
      config.titleMaxLines,
      config.titleMaxFontSize,
      config.titleMinFontSize,
      alignment
    );
    cursorY = titleDraw.bottomY + gap;
  }

  drawTextGroup(ctx, innerX, cursorY, innerWidth, bodyLayout, palette.muted, alignment);
}

function drawTextOnlySlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  colorTheme: SlideColorTheme,
  bodyAlignment: SlideTextAlignment
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);
  drawTextLayoutBlock(ctx, cardX, cardY, cardW, cardH, title, blocks, {
    titleMaxLines: 3,
    titleMaxFontSize: 72,
    titleMinFontSize: 34,
    bodyMaxFontSize: 52,
    bodyMinFontSize: 22,
    contentPaddingX: 74,
    contentPaddingY: 78,
    gap: 28,
    alignment: bodyAlignment,
  });
}

function drawTextWithImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme,
  bodyAlignment: SlideTextAlignment
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);
  drawTextLayoutBlock(ctx, cardX + 58, cardY + 64, 448, cardH - 128, title, blocks, {
    titleMaxLines: 3,
    titleMaxFontSize: 58,
    titleMinFontSize: 32,
    bodyMaxFontSize: 45,
    bodyMinFontSize: 20,
    gap: 24,
    alignment: bodyAlignment,
  });

  drawContainedImage(ctx, image, cardX + cardW - 282, cardY + 118, 212, 396, 16, colorTheme);
}

function drawTextWithHorizontalImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme,
  bodyAlignment: SlideTextAlignment
) {
  const cardX = STANDARD_CARD_X;
  const cardY = STANDARD_CARD_Y;
  const cardW = STANDARD_CARD_W;
  const cardH = STANDARD_CARD_H;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH, colorTheme);
  const imageY = cardY + cardH - 286;
  drawTextLayoutBlock(ctx, cardX + 60, cardY + 68, cardW - 120, imageY - cardY - 96, title, blocks, {
    titleMaxLines: 3,
    titleMaxFontSize: 60,
    titleMinFontSize: 32,
    bodyMaxFontSize: 42,
    bodyMinFontSize: 20,
    gap: 22,
    alignment: bodyAlignment,
  });

  drawContainedImage(ctx, image, cardX + 60, imageY, cardW - 120, 192, 16, colorTheme);
}

function drawImageWithTextSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  colorTheme: SlideColorTheme,
  bodyAlignment: SlideTextAlignment
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

  const textBlocks = blocks.length > 2 ? blocks.slice(0, 2) : blocks;
  drawTextLayoutBlock(ctx, plaqueX, plaqueY, plaqueW, plaqueH, title, textBlocks, {
    titleMaxLines: 2,
    titleMaxFontSize: 48,
    titleMinFontSize: 28,
    bodyMaxFontSize: 30,
    bodyMinFontSize: 18,
    contentPaddingX: 44,
    contentPaddingY: 38,
    gap: 14,
    alignment: bodyAlignment,
  });
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
  const bodyAlignment = options.bodyAlignment ?? 'normal';

  if (options.variant === 'text-only') {
    drawTextOnlySlide(ctx, safeTitle, blocks, options.colorTheme, bodyAlignment);
  } else if (options.variant === 'text-with-image') {
    drawTextWithImageSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme, bodyAlignment);
  } else if (options.variant === 'text-with-horizontal-image') {
    drawTextWithHorizontalImageSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme, bodyAlignment);
  } else {
    drawImageWithTextSlide(ctx, safeTitle, blocks, contentImage, options.colorTheme, bodyAlignment);
  }

  drawLogo(ctx, logoImage, options.colorTheme);

  return canvas.toDataURL('image/png');
}

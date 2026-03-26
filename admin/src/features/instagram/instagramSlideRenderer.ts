export type SlideVariant = 'text-only' | 'text-with-image' | 'image-with-text';

export interface SlideRenderOptions {
  variant: SlideVariant;
  title: string;
  body: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
}

const WIDTH = 1080;
const HEIGHT = 1350;

const palette = {
  background: '#FDFAF5',
  paper: '#FFFDFC',
  text: '#2A2520',
  muted: '#7A7068',
  primaryLight: '#C8DEDB',
  blush: '#E7B3BA',
  beige: '#EFE7DC',
  border: '#E6DDD3',
  shadow: 'rgba(42, 37, 32, 0.05)',
  bullet: '#B88B67',
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

function drawBackground(ctx: CanvasRenderingContext2D, variant: SlideVariant) {
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.5;

  ctx.fillStyle = palette.primaryLight;
  ctx.beginPath();
  ctx.arc(38, 190, 228, Math.PI * 0.2, Math.PI * 1.55);
  ctx.lineTo(24, 182);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = variant === 'image-with-text' ? palette.blush : '#E8BDC3';
  ctx.beginPath();
  ctx.moveTo(962, 520);
  ctx.bezierCurveTo(1096, 504, 1110, 622, 1038, 690);
  ctx.bezierCurveTo(986, 736, 936, 722, 884, 748);
  ctx.lineTo(884, 538);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.beige;
  ctx.beginPath();
  ctx.moveTo(0, 1036);
  ctx.bezierCurveTo(110, 942, 246, 998, 268, 1124);
  ctx.bezierCurveTo(280, 1196, 236, 1252, 162, 1262);
  ctx.bezierCurveTo(86, 1272, 28, 1228, 0, 1194);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  strokeRoundedRect(ctx, 36, 36, WIDTH - 72, HEIGHT - 72, 30, palette.border, 2);
}

function drawPaperCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  drawRoundedRect(ctx, x, y, w, h, 18, palette.paper);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, 18, 'rgba(42, 37, 32, 0.06)', 1.5);
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
      return { fontSize, lineHeight, groupedLines };
    }
  }

  ctx.font = `400 ${minFontSize}px "Segoe UI", Arial, sans-serif`;
  return {
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.48),
    groupedLines: blocks.map((block) => ({
      type: block.type,
      lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - 54 : maxWidth),
    })),
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
  radius: number
) {
  if (!image) {
    drawRoundedRect(ctx, x, y, w, h, radius, 'rgba(200, 222, 219, 0.45)');
    strokeRoundedRect(ctx, x, y, w, h, radius, 'rgba(42, 37, 32, 0.08)', 1.5);
    ctx.fillStyle = palette.muted;
    ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ajoutez une image', x + (w / 2), y + (h / 2));
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

  strokeRoundedRect(ctx, x, y, w, h, radius, 'rgba(42, 37, 32, 0.08)', 1.5);
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: CanvasImageSource | null) {
  const width = 148;
  const height = 100;
  const x = WIDTH - width - 82;
  const y = HEIGHT - height - 78;

  if (!logo) {
    ctx.fillStyle = palette.bullet;
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

function drawTextOnlySlide(ctx: CanvasRenderingContext2D, title: string, blocks: BodyBlock[]) {
  const cardX = 154;
  const cardY = 226;
  const cardW = WIDTH - 308;
  const cardH = 804;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH);

  const titleLayout = fitTitle(ctx, title, cardW - 148, 3, 52, 38);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  let cursorY = cardY + 76;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, cardX + (cardW / 2), cursorY);
    cursorY += titleLayout.fontSize * 1.18;
  }

  cursorY += 32;

  const bodyLayout = fitBody(ctx, blocks, cardW - 148, cardH - (cursorY - cardY) - 88, 33, 26);
  drawTextGroup(ctx, cardX + 74, cursorY, cardW - 148, bodyLayout, palette.muted, 'left');
}

function drawTextWithImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null
) {
  const cardX = 126;
  const cardY = 198;
  const cardW = WIDTH - 252;
  const cardH = 838;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH);

  const titleLayout = fitTitle(ctx, title, 448, 3, 48, 36);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let cursorY = cardY + 72;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, cardX + 70, cursorY);
    cursorY += titleLayout.fontSize * 1.15;
  }

  cursorY += 28;

  const bodyLayout = fitBody(ctx, blocks, 440, 392, 29, 23);
  drawTextGroup(ctx, cardX + 70, cursorY, 440, bodyLayout, palette.muted, 'left');

  drawContainedImage(ctx, image, cardX + cardW - 282, cardY + 118, 212, 396, 16);
}

function drawImageWithTextSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null
) {
  const imageX = 126;
  const imageY = 168;
  const imageW = WIDTH - 252;
  const imageH = 742;

  drawContainedImage(ctx, image, imageX, imageY, imageW, imageH, 18);

  const plaqueX = 148;
  const plaqueY = 808;
  const plaqueW = 544;
  const plaqueH = 246;
  drawPaperCard(ctx, plaqueX, plaqueY, plaqueW, plaqueH);

  const titleLayout = fitTitle(ctx, title, plaqueW - 88, 2, 42, 30);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let cursorY = plaqueY + 40;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, plaqueX + 44, cursorY);
    cursorY += titleLayout.fontSize * 1.14;
  }

  cursorY += 16;

  const textBlocks = blocks.length > 2 ? blocks.slice(0, 2) : blocks;
  const bodyLayout = fitBody(ctx, textBlocks, plaqueW - 88, 96, 23, 19);
  drawTextGroup(ctx, plaqueX + 44, cursorY, plaqueW - 88, bodyLayout, palette.muted, 'left');
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

  drawBackground(ctx, options.variant);
  drawFrame(ctx);

  const safeTitle = normalizeText(options.title).trim() || 'Votre message ici';
  const blocks = parseBody(options.body);

  if (options.variant === 'text-only') {
    drawTextOnlySlide(ctx, safeTitle, blocks);
  } else if (options.variant === 'text-with-image') {
    drawTextWithImageSlide(ctx, safeTitle, blocks, contentImage);
  } else {
    drawImageWithTextSlide(ctx, safeTitle, blocks, contentImage);
  }

  drawLogo(ctx, logoImage);

  return canvas.toDataURL('image/png');
}

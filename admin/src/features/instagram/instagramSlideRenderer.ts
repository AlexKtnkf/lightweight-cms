export type SlideVariant = 'text-only' | 'text-with-image' | 'image-with-text';

export interface SlideRenderOptions {
  variant: SlideVariant;
  title: string;
  body: string;
  siteTitle?: string;
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
  primary: '#5B9B97',
  primaryLight: '#C8DEDB',
  sage: '#9AAA88',
  accent: '#D4A373',
  accentSoft: '#EACCA6',
  blush: '#E7B3BA',
  border: '#E6DDD3',
  shadow: 'rgba(42, 37, 32, 0.08)',
};

type BodyBlock =
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string };

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
  ctx.globalAlpha = 0.92;

  ctx.fillStyle = palette.primaryLight;
  ctx.beginPath();
  ctx.arc(30, 180, 290, Math.PI * 0.2, Math.PI * 1.55);
  ctx.lineTo(30, 180);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = variant === 'image-with-text' ? palette.blush : '#E95D74';
  ctx.beginPath();
  ctx.moveTo(930, 460);
  ctx.bezierCurveTo(1120, 420, 1125, 610, 1020, 695);
  ctx.bezierCurveTo(960, 745, 900, 725, 850, 765);
  ctx.lineTo(850, 480);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#EFE7DC';
  ctx.beginPath();
  ctx.moveTo(0, 990);
  ctx.bezierCurveTo(120, 865, 290, 955, 310, 1120);
  ctx.bezierCurveTo(322, 1210, 255, 1285, 160, 1298);
  ctx.bezierCurveTo(70, 1310, 28, 1250, 0, 1220);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = palette.accentSoft;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(880, 1085, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFrame(ctx: CanvasRenderingContext2D) {
  strokeRoundedRect(ctx, 32, 32, WIDTH - 64, HEIGHT - 64, 42, palette.border, 2);
  strokeRoundedRect(ctx, 58, 58, WIDTH - 116, HEIGHT - 116, 32, 'rgba(212, 163, 115, 0.22)', 1.5);

  ctx.strokeStyle = 'rgba(91, 155, 151, 0.22)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(92, 118);
  ctx.lineTo(188, 118);
  ctx.moveTo(92, 118);
  ctx.lineTo(92, 206);
  ctx.moveTo(WIDTH - 92, HEIGHT - 118);
  ctx.lineTo(WIDTH - 188, HEIGHT - 118);
  ctx.moveTo(WIDTH - 92, HEIGHT - 118);
  ctx.lineTo(WIDTH - 92, HEIGHT - 206);
  ctx.stroke();
}

function drawPaperCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  drawRoundedRect(ctx, x, y, w, h, 38, palette.paper);
  ctx.restore();

  strokeRoundedRect(ctx, x, y, w, h, 38, 'rgba(42, 37, 32, 0.05)', 1.5);
  strokeRoundedRect(ctx, x + 18, y + 18, w - 36, h - 36, 28, 'rgba(91, 155, 151, 0.10)', 1.5);
}

function parseBody(body: string): BodyBlock[] {
  const lines = body
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
    ctx.font = `700 ${fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    const lines = wrapText(ctx, title, maxWidth);
    if (lines.length <= maxLines) {
      return { fontSize, lines };
    }
  }

  ctx.font = `700 ${minFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
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
  minFontSize: number,
  align: CanvasTextAlign
) {
  for (let fontSize = initialFontSize; fontSize >= minFontSize; fontSize -= 2) {
    ctx.font = `400 ${fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
    const lineHeight = Math.round(fontSize * 1.48);
    const groupedLines = blocks.map((block) => ({
      type: block.type,
      lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - 54 : maxWidth),
    }));

    const totalHeight = groupedLines.reduce((acc, group, index) => {
      const spacing = index < groupedLines.length - 1 ? Math.round(fontSize * 0.58) : 0;
      return acc + (group.lines.length * lineHeight) + spacing;
    }, 0);

    if (totalHeight <= maxHeight) {
      return { fontSize, lineHeight, groupedLines, align };
    }
  }

  ctx.font = `400 ${minFontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  return {
    fontSize: minFontSize,
    lineHeight: Math.round(minFontSize * 1.48),
    groupedLines: blocks.map((block) => ({
      type: block.type,
      lines: wrapText(ctx, block.text, block.type === 'bullet' ? maxWidth - 54 : maxWidth),
    })),
    align,
  };
}

function drawTextGroup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  blocks: ReturnType<typeof fitBody>,
  color: string
) {
  ctx.fillStyle = color;
  ctx.textAlign = blocks.align;
  ctx.textBaseline = 'top';
  ctx.font = `400 ${blocks.fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;

  let cursorY = y;
  for (let groupIndex = 0; groupIndex < blocks.groupedLines.length; groupIndex += 1) {
    const group = blocks.groupedLines[groupIndex];

    for (let lineIndex = 0; lineIndex < group.lines.length; lineIndex += 1) {
      const line = group.lines[lineIndex];

      if (group.type === 'bullet' && lineIndex === 0) {
        ctx.fillStyle = palette.accent;
        ctx.beginPath();
        const bulletX = x + 12;
        const bulletY = cursorY + blocks.lineHeight * 0.52;
        ctx.arc(bulletX, bulletY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
      }

      if (blocks.align === 'center') {
        ctx.fillText(line, x + (maxWidth / 2), cursorY);
      } else {
        const textX = group.type === 'bullet' ? x + 34 : x;
        ctx.fillText(line, textX, cursorY);
      }

      cursorY += blocks.lineHeight;
    }

    if (groupIndex < blocks.groupedLines.length - 1) {
      cursorY += Math.round(blocks.fontSize * 0.58);
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
    drawRoundedRect(ctx, x, y, w, h, radius, 'rgba(91, 155, 151, 0.12)');
    ctx.strokeStyle = 'rgba(91, 155, 151, 0.22)';
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, w, h, radius);
    ctx.stroke();

    ctx.fillStyle = palette.muted;
    ctx.font = '500 28px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ajoutez une image', x + w / 2, y + h / 2);
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
  const width = 172;
  const height = 120;
  const x = WIDTH - width - 96;
  const y = HEIGHT - height - 86;

  if (!logo) {
    ctx.fillStyle = palette.accent;
    ctx.font = '700 44px "Segoe UI", Arial, sans-serif';
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

function drawFooterTag(ctx: CanvasRenderingContext2D, label: string) {
  ctx.fillStyle = 'rgba(122, 112, 104, 0.75)';
  ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, WIDTH / 2, HEIGHT - 66);
}

function drawTextOnlySlide(ctx: CanvasRenderingContext2D, title: string, blocks: BodyBlock[], siteTitle?: string) {
  const cardX = 132;
  const cardY = 196;
  const cardW = WIDTH - 264;
  const cardH = 872;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH);

  const titleLayout = fitTitle(ctx, title, cardW - 180, 3, 60, 42);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  let cursorY = cardY + 96;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, cardX + cardW / 2, cursorY);
    cursorY += titleLayout.fontSize * 1.18;
  }

  cursorY += 48;

  const bodyLayout = fitBody(ctx, blocks, cardW - 180, cardH - (cursorY - cardY) - 118, 38, 28, 'left');
  drawTextGroup(ctx, cardX + 90, cursorY, cardW - 180, bodyLayout, palette.muted);

  drawFooterTag(ctx, siteTitle || 'Slide Instagram');
}

function drawTextWithImageSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  siteTitle?: string
) {
  const cardX = 102;
  const cardY = 170;
  const cardW = WIDTH - 204;
  const cardH = 900;

  drawPaperCard(ctx, cardX, cardY, cardW, cardH);

  const titleLayout = fitTitle(ctx, title, 520, 3, 54, 40);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let cursorY = cardY + 86;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, cardX + 84, cursorY);
    cursorY += titleLayout.fontSize * 1.15;
  }

  cursorY += 40;

  const bodyLayout = fitBody(ctx, blocks, 500, 430, 34, 26, 'left');
  drawTextGroup(ctx, cardX + 84, cursorY, 500, bodyLayout, palette.muted);

  ctx.fillStyle = palette.primary;
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.textTransform = 'uppercase';
  ctx.fillText(siteTitle || 'Instagram', cardX + 84, cardY + cardH - 84);

  drawContainedImage(ctx, image, cardX + cardW - 354, cardY + 132, 250, 500, 34);

  drawRoundedRect(ctx, cardX + cardW - 402, cardY + 712, 292, 138, 34, 'rgba(91, 155, 151, 0.10)');
  strokeRoundedRect(ctx, cardX + cardW - 402, cardY + 712, 292, 138, 34, 'rgba(91, 155, 151, 0.18)', 1.5);
  ctx.fillStyle = palette.text;
  ctx.font = '700 34px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Visuel', cardX + cardW - 360, cardY + 756);
  ctx.fillStyle = palette.muted;
  ctx.font = '400 24px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Ajoutez un portrait, une recette', cardX + cardW - 360, cardY + 804);
  ctx.fillText('ou un détail inspirant.', cardX + cardW - 360, cardY + 838);
}

function drawImageWithTextSlide(
  ctx: CanvasRenderingContext2D,
  title: string,
  blocks: BodyBlock[],
  image: CanvasImageSource | null,
  siteTitle?: string
) {
  const imageX = 108;
  const imageY = 138;
  const imageW = WIDTH - 216;
  const imageH = 824;

  drawContainedImage(ctx, image, imageX, imageY, imageW, imageH, 42);

  const plaqueX = 132;
  const plaqueY = 816;
  const plaqueW = 620;
  const plaqueH = 312;
  drawPaperCard(ctx, plaqueX, plaqueY, plaqueW, plaqueH);

  const titleLayout = fitTitle(ctx, title, plaqueW - 116, 2, 50, 34);
  ctx.fillStyle = palette.text;
  ctx.font = `700 ${titleLayout.fontSize}px "Segoe UI", "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let cursorY = plaqueY + 54;
  for (const line of titleLayout.lines) {
    ctx.fillText(line, plaqueX + 58, cursorY);
    cursorY += titleLayout.fontSize * 1.14;
  }

  cursorY += 24;

  const textBlocks = blocks.length > 2 ? blocks.slice(0, 2) : blocks;
  const bodyLayout = fitBody(ctx, textBlocks, plaqueW - 116, 126, 28, 22, 'left');
  drawTextGroup(ctx, plaqueX + 58, cursorY, plaqueW - 116, bodyLayout, palette.muted);

  drawRoundedRect(ctx, imageX + imageW - 210, imageY + 48, 136, 54, 18, 'rgba(255, 253, 252, 0.92)');
  strokeRoundedRect(ctx, imageX + imageW - 210, imageY + 48, 136, 54, 18, 'rgba(212, 163, 115, 0.24)', 1.5);
  ctx.fillStyle = palette.primaryDark ?? palette.primary;
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(siteTitle || 'Instagram', imageX + imageW - 142, imageY + 76);
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

  const safeTitle = options.title.trim() || 'Votre message ici';
  const blocks = parseBody(options.body);

  if (options.variant === 'text-only') {
    drawTextOnlySlide(ctx, safeTitle, blocks, options.siteTitle);
  } else if (options.variant === 'text-with-image') {
    drawTextWithImageSlide(ctx, safeTitle, blocks, contentImage, options.siteTitle);
  } else {
    drawImageWithTextSlide(ctx, safeTitle, blocks, contentImage, options.siteTitle);
  }

  drawLogo(ctx, logoImage);

  return canvas.toDataURL('image/png');
}

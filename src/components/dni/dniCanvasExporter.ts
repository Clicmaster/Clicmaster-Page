export interface DniCardData {
  characterName: string;
  robloxUser: string;
  birthDate: string;
  gender: string;
  bloodType: string;
  occupation: string;
  address: string;
  dniNumber: string;
  issueDate: string;
  avatarSrc: string;
  logoSrc: string;
}

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const drawTruncatedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) => {
  let rendered = text;
  if (ctx.measureText(rendered).width > maxWidth) {
    while (rendered.length > 1 && ctx.measureText(`${rendered}...`).width > maxWidth) {
      rendered = rendered.slice(0, -1);
    }
    rendered = `${rendered}...`;
  }
  ctx.fillText(rendered, x, y);
};

export const formatMrzLine = (dniNumber: string, characterName: string): string => {
  const cleanId = dniNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase().padEnd(11, '0').slice(0, 12);
  const cleanName = (characterName || 'CIUDADANO ANONIMO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('<<');
  return `I<LAT${cleanId}<<${cleanName}<<<2026`.slice(0, 44);
};

const drawDeterministicQr = (
  ctx: CanvasRenderingContext2D,
  seedText: string,
  x: number,
  y: number,
  size: number
) => {
  const grid = 11;
  const cell = size / grid;

  // White backing plate for QR scannability
  ctx.save();
  drawRoundedRect(ctx, x - 6, y - 6, size + 12, size + 12, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  ctx.fillStyle = '#0D1014';

  const isFinderCell = (r: number, c: number) => {
    const inTopLeft = r < 4 && c < 4;
    const inTopRight = r < 4 && c >= grid - 4;
    const inBottomLeft = r >= grid - 4 && c < 4;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let active = false;
      if (isFinderCell(r, c)) {
        const localR = r >= grid - 4 ? r - (grid - 4) : r;
        const localC = c >= grid - 4 ? c - (grid - 4) : c;
        const onOuterBorder =
          (localR === 0 || localR === 2 || localC === 0 || localC === 2) &&
          localR < 3 &&
          localC < 3;
        const isCenter = localR === 1 && localC === 1;
        active = (onOuterBorder || isCenter) && localR < 3 && localC < 3;
      } else {
        const bitHash = (hash ^ (r * 31 + c * 17)) >>> 0;
        active = (bitHash % 7) < 3;
      }

      if (active) {
        ctx.fillRect(
          Math.floor(x + c * cell),
          Math.floor(y + r * cell),
          Math.ceil(cell),
          Math.ceil(cell)
        );
      }
    }
  }
  ctx.restore();
};

export const exportDniToPng = async (data: DniCardData): Promise<string> => {
  const WIDTH = 1264;
  const HEIGHT = 800;

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el lienzo gráfico.');
  }

  // Load images in parallel
  const [avatarImg, logoImg] = await Promise.all([
    loadImage(data.avatarSrc),
    loadImage(data.logoSrc),
  ]);

  // Ensure rounded card silhouette
  ctx.save();
  drawRoundedRect(ctx, 0, 0, WIDTH, HEIGHT, 44);
  ctx.clip();

  // 1. Dark Obsidian CLICMASTER Base Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, '#0B0D10');
  bgGrad.addColorStop(0.55, '#12161C');
  bgGrad.addColorStop(1, '#080A0C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Signature CLICMASTER Neon Green Ambient Glows
  const glowTopRight = ctx.createRadialGradient(WIDTH - 140, 90, 20, WIDTH - 140, 90, 460);
  glowTopRight.addColorStop(0, 'rgba(124, 255, 58, 0.24)');
  glowTopRight.addColorStop(0.5, 'rgba(66, 212, 37, 0.08)');
  glowTopRight.addColorStop(1, 'rgba(124, 255, 58, 0)');
  ctx.fillStyle = glowTopRight;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glowBottomLeft = ctx.createRadialGradient(140, HEIGHT - 80, 10, 140, HEIGHT - 80, 380);
  glowBottomLeft.addColorStop(0, 'rgba(124, 255, 58, 0.14)');
  glowBottomLeft.addColorStop(1, 'rgba(124, 255, 58, 0)');
  ctx.fillStyle = glowBottomLeft;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 3. Subtle Security Micro-Grid & Diagonal Guilloche Texture
  ctx.strokeStyle = 'rgba(124, 255, 58, 0.045)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx < WIDTH; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, HEIGHT);
    ctx.stroke();
  }
  for (let gy = 0; gy < HEIGHT; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(WIDTH, gy);
    ctx.stroke();
  }

  // Watermark text in center-right
  ctx.save();
  ctx.translate(WIDTH * 0.65, HEIGHT * 0.56);
  ctx.rotate(-0.22);
  ctx.font = '900 92px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(124, 255, 58, 0.035)';
  ctx.textAlign = 'center';
  ctx.fillText('CLICMASTER', 0, 0);
  ctx.restore();

  // Top neon accent bar
  const barGrad = ctx.createLinearGradient(0, 0, WIDTH, 0);
  barGrad.addColorStop(0, '#7CFF3A');
  barGrad.addColorStop(0.5, '#42D425');
  barGrad.addColorStop(1, '#7CFF3A');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, WIDTH, 10);

  // Outer subtle neon rim border
  drawRoundedRect(ctx, 2, 2, WIDTH - 4, HEIGHT - 4, 42);
  ctx.strokeStyle = 'rgba(124, 255, 58, 0.45)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 4. Header Section
  const padX = 56;
  const headerY = 48;

  // Logo badge container
  drawRoundedRect(ctx, padX, headerY, 84, 84, 18);
  ctx.fillStyle = '#0F1318';
  ctx.fill();
  ctx.strokeStyle = 'rgba(124, 255, 58, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (logoImg) {
    ctx.save();
    drawRoundedRect(ctx, padX + 4, headerY + 4, 76, 76, 14);
    ctx.clip();
    ctx.drawImage(logoImg, padX + 4, headerY + 4, 76, 76);
    ctx.restore();
  }

  // Authority Titles
  ctx.fillStyle = '#7CFF3A';
  ctx.font = '800 19px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('REPÚBLICA DE ROLEPLAY LATAM · CLICMASTER', padX + 106, headerY + 32);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 30px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('DOCUMENTO NACIONAL DE IDENTIDAD', padX + 106, headerY + 68);

  // Right ID Number Badge
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 17px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('N° REGISTRO OFICIAL', WIDTH - padX, headerY + 28);

  ctx.fillStyle = '#7CFF3A';
  ctx.font = '900 30px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(data.dniNumber, WIDTH - padX, headerY + 66);
  ctx.textAlign = 'left';

  // Header divider line
  const dividerGrad = ctx.createLinearGradient(padX, 0, WIDTH - padX, 0);
  dividerGrad.addColorStop(0, '#7CFF3A');
  dividerGrad.addColorStop(0.6, 'rgba(124, 255, 58, 0.35)');
  dividerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = dividerGrad;
  ctx.fillRect(padX, 156, WIDTH - padX * 2, 3);

  // 5. Left Column: Roblox Avatar Photo + Security Chip
  const photoX = padX;
  const photoY = 194;
  const photoW = 286;
  const photoH = 340;

  // Outer glow shadow around photo frame
  ctx.save();
  drawRoundedRect(ctx, photoX - 3, photoY - 3, photoW + 6, photoH + 6, 26);
  ctx.fillStyle = 'rgba(124, 255, 58, 0.2)';
  ctx.fill();
  ctx.restore();

  // Clipped avatar photo box
  ctx.save();
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.clip();

  ctx.fillStyle = '#181C22';
  ctx.fillRect(photoX, photoY, photoW, photoH);

  if (avatarImg) {
    // Object-cover math to prevent stretching any uploaded Roblox screenshot
    const imgRatio = avatarImg.width / avatarImg.height;
    const boxRatio = photoW / photoH;
    let drawW = photoW;
    let drawH = photoH;
    let offsetX = photoX;
    let offsetY = photoY;

    if (imgRatio > boxRatio) {
      drawH = photoH;
      drawW = photoH * imgRatio;
      offsetX = photoX - (drawW - photoW) / 2;
    } else {
      drawW = photoW;
      drawH = photoW / imgRatio;
      offsetY = photoY - (drawH - photoH) / 2;
    }
    ctx.drawImage(avatarImg, offsetX, offsetY, drawW, drawH);
  }

  // Bottom bar inside photo
  ctx.fillStyle = 'rgba(10, 12, 16, 0.85)';
  ctx.fillRect(photoX, photoY + photoH - 46, photoW, 46);
  ctx.fillStyle = '#7CFF3A';
  ctx.font = '900 17px Inter, system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AVATAR VERIFICADO · ROBLOX', photoX + photoW / 2, photoY + photoH - 17);
  ctx.textAlign = 'left';
  ctx.restore();

  // Photo Neon Border
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 24);
  ctx.strokeStyle = '#7CFF3A';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Gold EMV Chip + Official Seal under Photo
  const chipX = photoX + 12;
  const chipY = photoY + photoH + 26;
  const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + 86, chipY + 60);
  chipGrad.addColorStop(0, '#FDE047');
  chipGrad.addColorStop(0.5, '#F59E0B');
  chipGrad.addColorStop(1, '#B45309');
  drawRoundedRect(ctx, chipX, chipY, 86, 60, 12);
  ctx.fillStyle = chipGrad;
  ctx.fill();
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 2;
  ctx.stroke();

  // EMV Chip inner circuit lines
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.6)';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(chipX + 18, chipY + 14, 50, 32);
  ctx.beginPath();
  ctx.moveTo(chipX + 43, chipY + 14);
  ctx.lineTo(chipX + 43, chipY + 46);
  ctx.moveTo(chipX + 18, chipY + 30);
  ctx.lineTo(chipX + 68, chipY + 30);
  ctx.stroke();

  // Biometric text next to chip
  ctx.fillStyle = '#7CFF3A';
  ctx.font = '800 16px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('CHIP BIOMÉTRICO', chipX + 104, chipY + 26);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '600 15px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('CLICMASTER PASS', chipX + 104, chipY + 49);

  // 6. Right Column: Legal Character Details
  const infoX = 392;
  const infoMaxW = WIDTH - infoX - padX;
  const col2X = infoX + 410;

  // Row 1: Character Name
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 17px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('APELLIDOS Y NOMBRES DEL CIUDADANO', infoX, 214);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 40px Inter, system-ui, -apple-system, sans-serif';
  drawTruncatedText(
    ctx,
    (data.characterName || 'CIUDADANO ANÓNIMO').toUpperCase(),
    infoX,
    258,
    infoMaxW
  );

  // Row 2: Roblox User & Birth Date
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 16px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('USUARIO DE ROBLOX', infoX, 314);
  ctx.fillText('FECHA DE NACIMIENTO', col2X, 314);

  ctx.fillStyle = '#7CFF3A';
  ctx.font = '800 26px Inter, system-ui, -apple-system, sans-serif';
  drawTruncatedText(ctx, `@${data.robloxUser || 'UsuarioRP'}`, infoX, 348, 380);

  ctx.fillStyle = '#F3F4F6';
  ctx.font = '700 25px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText(data.birthDate || '2001-08-14', col2X, 348);

  // Row 3: Gender / Blood Type & Issue Date
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 16px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('SEXO / GRUPO SANGUÍNEO', infoX, 404);
  ctx.fillText('FECHA DE EMISIÓN', col2X, 404);

  ctx.fillStyle = '#F3F4F6';
  ctx.font = '700 25px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.gender}  /  ${data.bloodType}`, infoX, 438);
  ctx.fillText(data.issueDate, col2X, 438);

  // Row 4: Occupation
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 16px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('OCUPACIÓN / RANGO OFICIAL', infoX, 494);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 25px Inter, system-ui, -apple-system, sans-serif';
  drawTruncatedText(ctx, data.occupation || 'Ciudadano Civil', infoX, 528, infoMaxW);

  // Row 5: Legal Address
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '700 16px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText('DOMICILIO LEGAL EN LA METRÓPOLIS', infoX, 582);

  ctx.fillStyle = '#E5E7EB';
  ctx.font = '600 23px Inter, system-ui, -apple-system, sans-serif';
  drawTruncatedText(ctx, data.address || 'Brookhaven Central', infoX, 616, infoMaxW);

  // 7. Bottom Footer Bar: MRZ Barcode & QR Matrix
  const footerY = 674;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(padX, footerY - 14, WIDTH - padX * 2, 2);

  ctx.fillStyle = 'rgba(124, 255, 58, 0.85)';
  ctx.font = '700 20px ui-monospace, SFMono-Regular, Menlo, monospace';
  const mrz = formatMrzLine(data.dniNumber, data.characterName);
  ctx.fillText(mrz, padX, footerY + 34);

  ctx.fillStyle = '#6B7280';
  ctx.font = '600 15px Inter, system-ui, -apple-system, sans-serif';
  ctx.fillText(
    'DOCUMENTO DIGITAL VÁLIDO EN PORTAL CLICMASTER ROLEPLAY · PROHIBIDA SU FALSIFICACIÓN',
    padX,
    footerY + 66
  );

  // Crisp QR Matrix on bottom right
  drawDeterministicQr(
    ctx,
    `${data.dniNumber}|${data.robloxUser}|${data.characterName}`,
    WIDTH - padX - 88,
    footerY - 2,
    88
  );

  ctx.restore();

  // Trigger file download onto user device
  const safeUser = (data.robloxUser || data.characterName || 'Ciudadano')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 32);
  const fileName = `DNI_CLICMASTER_${safeUser}.png`;

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
  );

  const downloadUrl = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (blob) {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
  }

  return fileName;
};

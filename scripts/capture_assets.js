import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.resolve(__dirname, '../docs/images');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 440,
    height: 860,
    deviceScaleFactor: 2,
  });

  console.log('Navigating to BillGram preview at http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // 1. Fill in client details to make screenshot realistic
  console.log('Filling form data for realistic presentation...');
  await page.type('input[placeholder="e.g. Acme Corp / Jane Doe"]', 'Acme European Design AG');
  await page.type('input[placeholder="billing@client.com"]', 'finance@acmedesign.ch');
  await page.type('input[placeholder="e.g. EU123456789"]', 'CHE-109.876.543');
  await page.type('input[placeholder="Street, City, Postal Code, Country"]', 'Bahnhofstrasse 42, Zurich, Switzerland');

  // Wait a bit
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 1: Editor View
  console.log('Capturing Screenshot 1: Editor View...');
  const shot1 = path.join(OUT_DIR, 'billgram-1.png');
  await page.screenshot({ path: shot1, fullPage: false });

  // Screenshot 2: Preview View with Swiss PDF Canvas and EPC QR
  console.log('Capturing Screenshot 2: Swiss Minimalist Canvas with EPC QR...');
  const previewTabs = await page.$$('nav button');
  if (previewTabs.length >= 2) {
    await previewTabs[1].click(); // Click "Preview" tab
    await new Promise((r) => setTimeout(r, 1200)); // Wait for QR generation
    const shot2 = path.join(OUT_DIR, 'billgram-2.png');
    await page.screenshot({ path: shot2, fullPage: false });
  }

  // Screenshot 3: Invoices Dashboard View
  console.log('Capturing Screenshot 3: Invoices Dashboard...');
  if (previewTabs.length >= 3) {
    await previewTabs[2].click(); // Click "Invoices" tab
    await new Promise((r) => setTimeout(r, 800));
    const shot3 = path.join(OUT_DIR, 'billgram-3.png');
    await page.screenshot({ path: shot3, fullPage: false });
  }

  // Screenshot 4: Settings View
  console.log('Capturing Screenshot 4: Settings & Profile...');
  if (previewTabs.length >= 4) {
    await previewTabs[3].click(); // Click "Settings" tab
    await new Promise((r) => setTimeout(r, 800));
    const shot4 = path.join(OUT_DIR, 'billgram-4.png');
    await page.screenshot({ path: shot4, fullPage: false });
  }

  await browser.close();
  console.log('Browser closed. Generating animated demo GIF via ffmpeg...');

  // Generate demo GIF from screenshots
  const gifPath = path.join(OUT_DIR, 'billgram_demo.gif');
  // Combine shots 1, 2, 3, 4 into a looped gif with 2 seconds per frame
  const concatList = path.join(OUT_DIR, 'frames.txt');
  fs.writeFileSync(
    concatList,
    `file '${path.resolve(OUT_DIR, 'billgram-1.png').replace(/\\/g, '/')}'\nduration 2\n` +
    `file '${path.resolve(OUT_DIR, 'billgram-2.png').replace(/\\/g, '/')}'\nduration 2.5\n` +
    `file '${path.resolve(OUT_DIR, 'billgram-3.png').replace(/\\/g, '/')}'\nduration 2\n` +
    `file '${path.resolve(OUT_DIR, 'billgram-4.png').replace(/\\/g, '/')}'\nduration 2\n` +
    `file '${path.resolve(OUT_DIR, 'billgram-1.png').replace(/\\/g, '/')}'\n`,
    'utf8'
  );

  try {
    const ffmpegCmd = `ffmpeg -y -f concat -safe 0 -i "${concatList}" -vf "fps=10,scale=500:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}"`;
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log('Generated GIF:', gifPath);
  } catch (err) {
    console.error('Failed to generate GIF with ffmpeg:', err);
  }

  // Also create billgram-4.gif for compatibility with mtlg-site carousel
  const altGif = path.join(OUT_DIR, 'billgram-4.gif');
  if (fs.existsSync(gifPath)) {
    fs.copyFileSync(gifPath, altGif);
  }

  console.log('Finished capturing assets successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High body limits for handling photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure persistent storage directories exist
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const menuFilePath = path.join(dataDir, 'saved_menu.json');

// Serve uploaded assets statically
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.resolve(__dirname, 'public')));

// Helper to sanitize menu data
function sanitizeServerMenu(menu: any) {
  if (!menu) return menu;
  if (menu.nutritionData && Array.isArray(menu.nutritionData)) {
    menu.nutritionData = menu.nutritionData.map((item: any) => {
      if (item.id === 'bumil' || (item.label && String(item.label).toLowerCase().includes('busui'))) {
        return {
          ...item,
          label: 'PORSI BUSUI / BUMIL',
        };
      }
      return item;
    });
  }
  return menu;
}

// API: Get current active menu
app.get('/api/menu', (req, res) => {
  try {
    if (fs.existsSync(menuFilePath)) {
      const content = fs.readFileSync(menuFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      return res.json(sanitizeServerMenu(parsed));
    }
    return res.status(404).json({ message: 'No custom menu found' });
  } catch (error) {
    console.error('Error reading saved menu:', error);
    return res.status(500).json({ error: 'Failed to read menu data' });
  }
});

// API: Save menu
app.post('/api/menu', (req, res) => {
  try {
    let menuData = req.body;
    if (!menuData || !menuData.dateKey) {
      return res.status(400).json({ error: 'Invalid menu data' });
    }
    menuData = sanitizeServerMenu(menuData);
    fs.writeFileSync(menuFilePath, JSON.stringify(menuData, null, 2), 'utf-8');
    return res.json({ success: true, menu: menuData });
  } catch (error) {
    console.error('Error saving menu:', error);
    return res.status(500).json({ error: 'Failed to save menu data' });
  }
});

// API: Upload image (converts base64 to server file)
app.post('/api/upload', (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Match data:image/xxx;base64,xxxx
    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const timestamp = Date.now();
    const fileName = `dish_${timestamp}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);

    // Also update a consistent 'dish_latest.jpg' for instant fallback
    const latestPath = path.join(uploadsDir, `dish_latest.${extension}`);
    fs.writeFileSync(latestPath, buffer);

    const publicUrl = `/uploads/${fileName}?t=${timestamp}`;
    return res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error saving uploaded image:', error);
    return res.status(500).json({ error: 'Failed to process image' });
  }
});

// API: Reset menu to default
app.post('/api/reset-menu', (req, res) => {
  try {
    if (fs.existsSync(menuFilePath)) {
      fs.unlinkSync(menuFilePath);
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Error resetting menu:', error);
    return res.status(500).json({ error: 'Failed to reset menu' });
  }
});

// Logo endpoints for 100% exact, unmodified custom logo support
const customLogoPath = path.join(uploadsDir, 'custom_bgn_logo.png');

app.get('/api/logo', (req, res) => {
  try {
    if (fs.existsSync(customLogoPath)) {
      const stats = fs.statSync(customLogoPath);
      return res.json({
        exists: true,
        url: `/uploads/custom_bgn_logo.png?t=${stats.mtimeMs}`,
      });
    }
    return res.json({ exists: false, url: null });
  } catch (error) {
    console.error('Error checking logo:', error);
    return res.status(500).json({ error: 'Failed to check logo' });
  }
});

app.post('/api/logo', (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }

    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    fs.writeFileSync(customLogoPath, buffer);

    // Also sync to dist if present
    const distUploads = path.resolve(__dirname, 'dist', 'uploads');
    if (fs.existsSync(distUploads)) {
      fs.writeFileSync(path.join(distUploads, 'custom_bgn_logo.png'), buffer);
    }

    const timestamp = Date.now();
    return res.json({
      success: true,
      url: `/uploads/custom_bgn_logo.png?t=${timestamp}`,
    });
  } catch (error) {
    console.error('Error saving logo:', error);
    return res.status(500).json({ error: 'Failed to save logo' });
  }
});

app.delete('/api/logo', (req, res) => {
  try {
    if (fs.existsSync(customLogoPath)) {
      fs.unlinkSync(customLogoPath);
    }
    const distLogo = path.resolve(__dirname, 'dist', 'uploads', 'custom_bgn_logo.png');
    if (fs.existsSync(distLogo)) {
      fs.unlinkSync(distLogo);
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Error removing logo:', error);
    return res.status(500).json({ error: 'Failed to remove logo' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.AIS_ENV === 'production';

  if (!isProduction) {
    // Development mode: attach Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

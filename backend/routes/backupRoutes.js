import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const router = express.Router();

// Ensure backup directory exists
const backupDir = path.join(__dirname, '../backups');
fs.mkdir(backupDir, { recursive: true }).catch(console.error);

// GET /api/backup/list - List all backups
router.get('/list', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const files = await fs.readdir(backupDir);
    const backups = [];

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        backups.push({
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    }

    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({
      success: true,
      backups: backups
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/backup/create - Create database backup
router.post('/create', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `brewops_backup_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Get database configuration
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'brewops_db';
    const dbPort = process.env.DB_PORT || 3306;

    // Build mysqldump command
    let command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser}`;
    if (dbPassword) {
      command += ` -p${dbPassword}`;
    }
    command += ` --single-transaction --routines --triggers ${dbName} > "${filepath}"`;

    // Execute backup
    await execAsync(command);

    // Verify backup was created
    const stats = await fs.stat(filepath);
    if (stats.size === 0) {
      await fs.unlink(filepath);
      throw new Error('Backup file is empty');
    }

    res.json({
      success: true,
      message: 'Database backup created successfully',
      backup: {
        filename: filename,
        size: stats.size,
        created: stats.birthtime
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/backup/download/:filename - Download backup file
router.get('/download/:filename', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Security check - only allow .sql files
    if (!filename.endsWith('.sql')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filepath = path.join(backupDir, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file
    const fileStream = await fs.readFile(filepath);
    res.send(fileStream);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/backup/:filename - Delete backup file
router.delete('/:filename', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { filename } = req.params;
    
    // Security check - only allow .sql files
    if (!filename.endsWith('.sql')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filepath = path.join(backupDir, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Delete the file
    await fs.unlink(filepath);

    res.json({
      success: true,
      message: 'Backup file deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/backup/restore - Restore database from backup
router.post('/restore', authenticateToken, authorizeRoles(['admin']), async (req, res, next) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    // Security check - only allow .sql files
    if (!filename.endsWith('.sql')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filepath = path.join(backupDir, filename);

    // Check if file exists
    try {
      await fs.access(filepath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    // Get database configuration
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'brewops_db';
    const dbPort = process.env.DB_PORT || 3306;

    // Build mysql command for restore
    let command = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser}`;
    if (dbPassword) {
      command += ` -p${dbPassword}`;
    }
    command += ` ${dbName} < "${filepath}"`;

    // Execute restore
    await execAsync(command);

    res.json({
      success: true,
      message: 'Database restored successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/backup/cleanup - Clean up old backups
router.post('/cleanup', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res, next) => {
  try {
    const { days = 30 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const files = await fs.readdir(backupDir);
    let deletedCount = 0;

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
    }

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old backup files`,
      deletedCount: deletedCount
    });
  } catch (error) {
    next(error);
  }
});

export default router;
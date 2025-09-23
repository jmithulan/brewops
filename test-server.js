import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4323;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/profile', (req, res) => {
  res.json({
    success: true,
    profile: {
      id: 1,
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      avatar: null,
      phone: null,
      address: null,
      employee_id: null
    }
  });
});

app.put('/api/profile', (req, res) => {
  console.log('Profile update request:', req.body);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: {
      id: 1,
      ...req.body,
      updated_at: new Date()
    }
  });
});

app.post('/api/profile/upload-avatar', (req, res) => {
  console.log('Avatar upload request:', req.body);
  res.json({
    success: true,
    message: 'Avatar updated successfully',
    profile: {
      id: 1,
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      avatar: req.body.avatar,
      phone: null,
      address: null,
      employee_id: null
    }
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/profile');
  console.log('- PUT /api/profile');
  console.log('- POST /api/profile/upload-avatar');
});

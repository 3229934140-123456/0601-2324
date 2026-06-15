import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { dataStore } from '../src/data/store.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'hospital-infection-monitor-secret';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: '用户名和密码不能为空' });
      return;
    }

    const user = dataStore.findUser(username);

    if (!user) {
      res.status(401).json({ error: '用户名或密码错误' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        level: user.level,
        provinceId: user.provinceId,
        cityId: user.cityId,
        hospitalId: user.hospitalId,
        departmentId: user.departmentId,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', (req: Request, res: Response): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未授权' });
      return;
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = dataStore.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: '用户不存在' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        level: user.level,
        provinceId: user.provinceId,
        cityId: user.cityId,
        hospitalId: user.hospitalId,
        departmentId: user.departmentId,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Token 无效或已过期' });
  }
});

router.post('/logout', (req: Request, res: Response): void => {
  res.json({ message: '登出成功' });
});

export default router;

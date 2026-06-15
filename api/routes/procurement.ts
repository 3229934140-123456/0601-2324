import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response): void => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getProcurementPlans(year, page, size, req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取采购计划失败' });
  }
});

router.get('/:id/items', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const items = dataStore.getProcurementItems(id, req.user);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: '获取采购明细失败' });
  }
});

router.get('/deviation/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const analysis = dataStore.getDeviationAnalysis(id, req.user);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: '获取偏差分析失败' });
  }
});

router.post('/upload', (req: Request, res: Response): void => {
  try {
    const { hospitalId, hospitalName, year, items } = req.body;

    if (!hospitalId || !year || !items || !Array.isArray(items)) {
      res.status(400).json({ error: '参数不完整' });
      return;
    }

    const plan = dataStore.uploadProcurementPlan(
      hospitalId,
      hospitalName || '未知医院',
      parseInt(year),
      items,
    );

    if (!plan) {
      res.status(404).json({ error: '医院不存在' });
      return;
    }

    const analysis = dataStore.getDeviationAnalysis(plan.id, req.user);

    res.json({
      plan,
      analysis,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

export default router;

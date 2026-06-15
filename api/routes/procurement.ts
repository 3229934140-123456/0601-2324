import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getProcurementPlans(year, page, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取采购计划失败' });
  }
});

router.get('/:id/items', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const items = dataStore.getProcurementItems(id);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: '获取采购明细失败' });
  }
});

router.get('/deviation/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const analysis = dataStore.getDeviationAnalysis(id);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: '获取偏差分析失败' });
  }
});

router.post('/upload', (req: Request, res: Response): void => {
  try {
    res.json({
      imported: 25,
      deviations: [
        { drugName: '头孢曲松', deviation: 18.5 },
        { drugName: '左氧氟沙星', deviation: -22.3 },
        { drugName: '万古霉素', deviation: 16.7 },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: '上传失败' });
  }
});

export default router;

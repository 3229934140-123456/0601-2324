import { Router, type Request, type Response } from 'express';
import { dataStore } from '../src/data/store.js';

const router = Router();

router.get('/overview', (_req: Request, res: Response): void => {
  try {
    const overview = dataStore.getDashboardOverview();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: '获取概览数据失败' });
  }
});

router.get('/provinces', (_req: Request, res: Response): void => {
  try {
    const provinces = dataStore.getProvinces();
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: '获取省份数据失败' });
  }
});

router.get('/ranking', (req: Request, res: Response): void => {
  try {
    const type = (req.query.type as 'infection' | 'usage') || 'infection';
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const result = dataStore.getHospitalRanking(type, page, size);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取排名数据失败' });
  }
});

router.get('/trend', (req: Request, res: Response): void => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const provinceId = req.query.provinceId as string | undefined;

    const trendData = dataStore.getTrendData(days, provinceId);
    res.json(trendData);
  } catch (error) {
    res.status(500).json({ error: '获取趋势数据失败' });
  }
});

router.get('/drug-categories', (_req: Request, res: Response): void => {
  try {
    const categories = dataStore.getDrugCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取药物类别数据失败' });
  }
});

export default router;
